import logging
import requests
import json
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from chat_utils import create_group_for_event, add_user_to_group, remove_group

# Configure backend API URL
API_BASE_URL = "http://127.0.0.1:8000/api"  # <-- изменено для локального запуска

logger = logging.getLogger(__name__)

async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    await update.message.reply_html(
        f"Hi {user.mention_html()}! I'm the Flock Events bot. I'll help you connect with event participants.\n\n"
        f"To link your Telegram account with your FLOCK profile, press the button below or send /pair.\n\n"
        f"Use /help to see all available commands."
    )
    keyboard = [[InlineKeyboardButton("Pair Telegram Account", callback_data="pair_telegram")]]
    await update.message.reply_text(
        "Pair your Telegram account:",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def help_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message with available commands."""
    help_text = (
        "Available commands:\n\n"
        "/start - Start the bot\n"
        "/help - Show this help message\n"
        "/register - Link your Telegram account to your Flock account\n"
        "/join <event_id> - Join an event's Telegram group\n"
        "/leave <event_id> - Leave an event's Telegram group\n"
    )
    await update.message.reply_text(help_text)

async def register_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Register and link Telegram account with Flock account."""
    user = update.effective_user
    
    # Create unique registration link with token
    # In a real implementation, you would generate a secure token
    registration_token = f"telegram_{user.id}_{user.username}"
    
    # Create an inline keyboard with the registration link
    registration_url = f"https://your-flock-app.com/connect-telegram?token={registration_token}"
    keyboard = [
        [InlineKeyboardButton("Connect your Flock account", url=registration_url)]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "To connect your Telegram account with your Flock account, click the button below:",
        reply_markup=reply_markup
    )
    
    # Store the user's Telegram info in context for later use
    if not context.user_data.get('telegram_info'):
        context.user_data['telegram_info'] = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name
        }

async def ask_email_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Ask user for email to link Telegram account."""
    text = "Please enter the email you used to register on FLOCK.com to link your Telegram account."
    user_id = update.effective_user.id
    # 1. Обычное сообщение (команда /pair)
    if getattr(update, "message", None) and hasattr(update.message, "reply_text"):
        await update.message.reply_text(text)
    # 2. CallbackQuery (нажатие кнопки)
    elif getattr(update, "callback_query", None) and getattr(update.callback_query, "message", None):
        # Заменяем текст и убираем клавиатуру
        await update.callback_query.message.edit_text(text)
    # 3. Fallback
    else:
        await context.bot.send_message(chat_id=user_id, text=text)
    context.user_data['awaiting_email'] = True

async def process_email_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Process email, link Telegram account via backend, and inform user."""
    if not context.user_data.get('awaiting_email'):
        return  # Ignore if not waiting for email
    email = update.message.text.strip().lower()
    telegram_username = update.effective_user.username or str(update.effective_user.id)
    telegram_id = update.effective_user.id
    payload = {'email': email, 'telegram_username': telegram_username, 'telegram_id': telegram_id}
    try:
        resp = requests.post(f"{API_BASE_URL}/telegram-link/", json=payload)
        if resp.status_code == 200:
            await update.message.reply_text(
                "✅ Your Telegram account has been successfully linked to your FLOCK profile!"
            )
        elif resp.status_code == 404:
            await update.message.reply_text(
                "❌ No FLOCK user found with this email. Please check your email and try again."
            )
        else:
            await update.message.reply_text(
                "❌ An error occurred while linking your account. Please try again later."
            )
    except Exception as e:
        await update.message.reply_text(
            "❌ Could not connect to the server. Please try again later."
        )
    context.user_data['awaiting_email'] = False

async def join_event_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Join a Telegram group for an event."""
    if not context.args or len(context.args) < 1:
        await update.message.reply_text("Please provide an event ID: /join <event_id>")
        return
    
    event_id = context.args[0]
    user = update.effective_user
    
    try:
        # Check if event exists and user is registered for it
        response = requests.get(
            f"{API_BASE_URL}/events/{event_id}/participants/",
            params={"telegram_id": user.id}
        )
        
        if response.status_code != 200:
            await update.message.reply_text("You're not registered for this event or the event doesn't exist.")
            return
        
        event_data = response.json()
        
        # Check if event already has a Telegram group
        if not event_data.get('telegram_group_id'):
            # Create new group for the event
            group_link = await create_group_for_event(context.bot, event_data)
            
            # Extract group_id from the link
            group_id = group_link.split('/')[-1]
            
            # Update event in backend with the group info
            requests.patch(
                f"{API_BASE_URL}/events/{event_id}/",
                json={"telegram_group_id": group_id, "telegram_group_link": group_link}
            )
            
            # Update local event_data
            event_data['telegram_group_id'] = group_id
            event_data['telegram_group_link'] = group_link
        
        # Add user to the group
        await add_user_to_group(context.bot, event_data['telegram_group_id'], user.id)
        
        await update.message.reply_text(
            f"You've been added to the group for {event_data['title']}! "
            f"Click here to join: {event_data['telegram_group_link']}"
        )
        
    except Exception as e:
        logger.error(f"Error joining event: {e}")
        await update.message.reply_text("Sorry, there was an error joining the event group.")

async def leave_event_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Leave a Telegram group for an event."""
    if not context.args or len(context.args) < 1:
        await update.message.reply_text("Please provide an event ID: /leave <event_id>")
        return
    
    event_id = context.args[0]
    user = update.effective_user
    
    try:
        # Get event details
        response = requests.get(f"{API_BASE_URL}/events/{event_id}/")
        
        if response.status_code != 200:
            await update.message.reply_text("Event not found.")
            return
        
        event_data = response.json()
        
        if not event_data.get('telegram_group_id'):
            await update.message.reply_text("This event doesn't have a Telegram group.")
            return
        
        # Remove user from the group
        try:
            success = await context.bot.ban_chat_member(
                chat_id=event_data['telegram_group_id'],
                user_id=user.id
            )
            await context.bot.unban_chat_member(
                chat_id=event_data['telegram_group_id'],
                user_id=user.id,
                only_if_banned=True
            )
            
            if success:
                await update.message.reply_text(f"You've left the group for {event_data['title']}.")
            else:
                await update.message.reply_text("There was an issue leaving the group.")
        except Exception as e:
            logger.error(f"Error removing user from group: {e}")
            await update.message.reply_text("There was an issue leaving the group.")
            
    except Exception as e:
        logger.error(f"Error leaving event: {e}")
        await update.message.reply_text("Sorry, there was an error processing your request.")

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle button presses from inline keyboards."""
    query = update.callback_query
    if not query:
        return
        
    await query.answer()
    data = query.data

    if data == "pair_telegram":
        await ask_email_handler(update, context)
        return

    # Handle other button cases
    if data.startswith("join_event_"):
        event_id = data.split("_")[-1]
        context.args = [event_id]
        await join_event_handler(update, context)
    elif data.startswith("leave_event_"):
        event_id = data.split("_")[-1]
        context.args = [event_id]
        await leave_event_handler(update, context)
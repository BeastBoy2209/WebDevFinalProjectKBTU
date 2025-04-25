import logging
import requests
import json
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from chat_utils import create_group_for_event, add_user_to_group, remove_group

# Configure backend API URL
API_BASE_URL = "http://backend:8000/api"

logger = logging.getLogger(__name__)

async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    await update.message.reply_html(
        f"Hi {user.mention_html()}! I'm the Flock Events bot. I'll help you connect with event participants.\n\n"
        f"Use /register to link your Telegram account with your Flock account.\n"
        f"Use /help to see all available commands."
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
            
            # Update event in backend with the group info
            requests.patch(
                f"{API_BASE_URL}/events/{event_id}/",
                json={"telegram_group_id": group_link.split('/')[-1], "telegram_group_link": group_link}
            )
        else:
            group_link = event_data['telegram_group_link']
        
        # Add user to the group
        await add_user_to_group(context.bot, event_data['telegram_group_id'], user.id)
        
        await update.message.reply_text(
            f"You've been added to the group for {event_data['title']}! "
            f"Click here to join: {group_link}"
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
        logger.error(f"Error leaving event: {e}")
        await update.message.reply_text("Sorry, there was an error processing your request.")

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle button presses from inline keyboards."""
    query = update.callback_query
    await query.answer()
    
    # Parse the callback data
    data = query.data
    
    if data.startswith("join_event_"):
        event_id = data.split("_")[-1]
        # Simulate the /join command
        context.args = [event_id]
        await join_event_handler(update, context)
    elif data.startswith("leave_event_"):
        event_id = data.split("_")[-1]
        # Simulate the /leave command
        context.args = [event_id]
        await leave_event_handler(update, context)
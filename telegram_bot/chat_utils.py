import logging
from telegram import Bot
from telegram.error import TelegramError
from telegram.constants import ChatType

logger = logging.getLogger(__name__)

async def create_group_for_event(bot: Bot, event_data: dict) -> str:
    """
    Create a Telegram group for an event.
    
    Args:
        bot: The Telegram bot instance
        event_data: Dictionary with event information
        
    Returns:
        str: Invite link to the created group
    """
    try:
        # Create a new group
        chat = await bot.create_supergroup(
            title=f"Flock: {event_data['title']}",
            description=f"Group for event: {event_data['title']}\n{event_data['description']}\n\nDate: {event_data['date']}\nLocation: {event_data['location']}"
        )
        
        # Pin a message with event details
        message = await bot.send_message(
            chat_id=chat.id,
            text=f"🎉 Welcome to the group for *{event_data['title']}*!\n\n"
                f"📅 *Date:* {event_data['date']}\n"
                f"📍 *Location:* {event_data['location']}\n\n"
                f"📝 *Description:* {event_data['description']}\n\n"
                f"Use this group to coordinate with other participants. The bot will automatically "
                f"remove this group after the event is over.",
            parse_mode='Markdown'
        )
        await bot.pin_chat_message(chat_id=chat.id, message_id=message.message_id)
        
        # Add the event organizer as admin if available
        if event_data.get('organizer_telegram_id'):
            await bot.promote_chat_member(
                chat_id=chat.id,
                user_id=event_data['organizer_telegram_id'],
                can_invite_users=True,
                can_delete_messages=True,
                can_restrict_members=True
            )
        
        # Create and return an invite link
        invite_link = await bot.create_chat_invite_link(chat_id=chat.id)
        return invite_link.invite_link
        
    except TelegramError as e:
        logger.error(f"Error creating group for event {event_data['id']}: {e}")
        raise

async def add_user_to_group(bot: Bot, group_id: str, user_id: int) -> bool:
    """
    Add a user to an event group.
    
    Args:
        bot: The Telegram bot instance
        group_id: ID of the Telegram group
        user_id: Telegram ID of the user to add
        
    Returns:
        bool: Success status
    """
    try:
        chat_member = await bot.get_chat_member(chat_id=group_id, user_id=user_id)
        
        # If user is already in the chat but was kicked before
        if chat_member.status == "kicked":
            await bot.unban_chat_member(chat_id=group_id, user_id=user_id)
            return True
            
        # If user is already in the chat
        if chat_member.status in ["member", "administrator", "creator"]:
            return True
            
        # User isn't in the chat yet, but we can't add them directly
        # They'll need to use the invite link
        return False
        
    except TelegramError as e:
        logger.error(f"Error adding user {user_id} to group {group_id}: {e}")
        return False

async def remove_group(bot: Bot, group_id: str) -> bool:
    """
    Remove a Telegram group (archive it).
    
    Args:
        bot: The Telegram bot instance
        group_id: ID of the Telegram group to remove
        
    Returns:
        bool: Success status
    """
    try:
        # First, send a notification to the group
        await bot.send_message(
            chat_id=group_id,
            text="📢 This event has ended. The group will be archived in 24 hours. "
                 "Thank you for participating! 🎉"
        )
        
        # We're not actually deleting the group, just leaving it
        # This is because bots can't delete groups in Telegram
        await bot.leave_chat(chat_id=group_id)
        return True
        
    except TelegramError as e:
        logger.error(f"Error removing group {group_id}: {e}")
        return False
import logging
import requests
import asyncio
from datetime import datetime, timedelta
from telegram.ext import Application
from chat_utils import remove_group

# Configure backend API URL
API_BASE_URL = "http://localhost:8000/api"

logger = logging.getLogger(__name__)

def setup_scheduler(application: Application):
    """Setup job to clean expired event groups."""
    # Check if job_queue is available
    if not application.job_queue:
        logger.error("JobQueue is not available. Please install python-telegram-bot[job-queue]")
        return
        
    # Schedule to run daily
    application.job_queue.run_repeating(
        callback=run_clean_expired_event_groups,
        interval=timedelta(days=1),
        first=timedelta(seconds=10)  # Start 10 seconds after bot initialization
    )
    
    logger.info("Scheduler setup completed successfully")

async def run_clean_expired_event_groups(context):
    """Wrapper to run the clean_expired_event_groups function"""
    await clean_expired_event_groups(context.bot)

async def clean_expired_event_groups(bot):
    """
    Find and remove groups for events that have ended.
    
    Args:
        bot: The Telegram bot instance
    """
    logger.info("Running cleanup job for expired event groups")
    
    try:
        # Get expired events that still have active groups
        response = requests.get(
            f"{API_BASE_URL}/events/expired-with-active-groups/"
        )
        
        if response.status_code != 200:
            logger.error(f"Failed to get expired events: {response.text}")
            return
            
        expired_events = response.json()
        
        for event in expired_events:
            if not event.get('telegram_group_id'):
                continue
                
            # Remove the group
            success = await remove_group(bot, event['telegram_group_id'])
            
            if success:
                # Update the backend that the group has been removed
                requests.patch(
                    f"{API_BASE_URL}/events/{event['id']}/",
                    json={"telegram_group_active": False}
                )
                logger.info(f"Removed group for expired event {event['id']}: {event['title']}")
            else:
                logger.error(f"Failed to remove group for event {event['id']}")
                
    except Exception as e:
        logger.error(f"Error in clean_expired_event_groups: {e}")
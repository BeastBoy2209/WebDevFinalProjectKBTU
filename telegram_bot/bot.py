import logging
import os
from dotenv import load_dotenv
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler
from handlers import (start_handler, help_handler, register_handler, 
                     join_event_handler, leave_event_handler, button_handler,
                     ask_email_handler, process_email_handler)
from scheduler import setup_scheduler

# Load environment variables
load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

def main():
    """Start the bot."""
    # Create the Application with job_queue explicitly enabled
    application = (
        Application.builder()
        .token(TOKEN)
        .build()
    )

    # Add command handlers
    application.add_handler(CommandHandler("start", start_handler))
    application.add_handler(CommandHandler("help", help_handler))
    application.add_handler(CommandHandler("register", register_handler))
    application.add_handler(CommandHandler("join", join_event_handler))
    application.add_handler(CommandHandler("leave", leave_event_handler))
    application.add_handler(CommandHandler("pair", ask_email_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, process_email_handler))
    
    # Add callback query handler for inline buttons
    application.add_handler(CallbackQueryHandler(button_handler))
    
    # Only setup scheduler if job_queue is available
    if application.job_queue:
        setup_scheduler(application)
    else:
        logger.warning("JobQueue is not available. Scheduler will not run.")
    
    # Start the Bot
    application.run_polling()

if __name__ == "__main__":
    main()
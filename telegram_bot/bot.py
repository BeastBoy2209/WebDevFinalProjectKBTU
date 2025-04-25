import logging
import os
from dotenv import load_dotenv
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler
from handlers import (start_handler, help_handler, register_handler, 
                     join_event_handler, leave_event_handler, button_handler)
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
    # Create the Application
    application = Application.builder().token(TOKEN).build()

    # Add command handlers
    application.add_handler(CommandHandler("start", start_handler))
    application.add_handler(CommandHandler("help", help_handler))
    application.add_handler(CommandHandler("register", register_handler))
    application.add_handler(CommandHandler("join", join_event_handler))
    application.add_handler(CommandHandler("leave", leave_event_handler))
    
    # Add callback query handler for inline buttons
    application.add_handler(CallbackQueryHandler(button_handler))
    
    # Setup the event scheduler for cleaning up old chats
    setup_scheduler(application)
    
    # Start the Bot
    application.run_polling()

if __name__ == "__main__":
    main()
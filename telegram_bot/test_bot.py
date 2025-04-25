import unittest
from unittest.mock import AsyncMock, MagicMock
from handlers import start_handler, help_handler, join_event_handler, leave_event_handler

class TestTelegramBot(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.update = MagicMock()
        self.context = MagicMock()
        self.message = AsyncMock()
        self.update.message = self.message

    async def test_start_handler(self):
        # Test the start handler
        await start_handler(self.update, self.context)
        self.message.reply_text.assert_called_once_with("Welcome to the bot!")

    async def test_help_handler(self):
        # Test the help handler
        await help_handler(self.update, self.context)
        self.message.reply_text.assert_called_once_with("Here is how to use the bot...")

    async def test_join_event_handler_no_event_id(self):
        # Test the join event handler when no event ID is provided
        await join_event_handler(self.update, self.context)
        self.message.reply_text.assert_called_once()
        call_args = self.message.reply_text.call_args[0][0]
        self.assertIn("Please provide an event ID", call_args)

    async def test_leave_event_handler(self):
        # Test the leave event handler
        await leave_event_handler(self.update, self.context)
        self.message.reply_text.assert_called_once_with("You have left the event.")

if __name__ == '__main__':
    unittest.main()
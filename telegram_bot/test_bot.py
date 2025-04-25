import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from handlers import start_handler, help_handler, join_event_handler, leave_event_handler

class TestTelegramBot(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.update = MagicMock()
        self.context = MagicMock()
        self.context.args = []  # Initialize empty args
        self.message = AsyncMock()
        self.update.message = self.message
        self.update.effective_user = MagicMock()
        self.update.effective_user.mention_html.return_value = "@test_user"
        self.update.effective_user.id = 12345
        self.update.effective_user.username = "test_user"

    async def test_start_handler(self):
        # Test the start handler
        await start_handler(self.update, self.context)
        self.message.reply_html.assert_called_once()
        call_args = self.message.reply_html.call_args[0][0]
        self.assertIn("Hi @test_user! I'm the Flock Events bot", call_args)

    async def test_help_handler(self):
        # Test the help handler
        await help_handler(self.update, self.context)
        self.message.reply_text.assert_called_once()
        call_args = self.message.reply_text.call_args[0][0]
        self.assertIn("Available commands:", call_args)

    async def test_join_event_handler_no_event_id(self):
        # Test the join event handler when no event ID is provided
        await join_event_handler(self.update, self.context)
        self.message.reply_text.assert_called_once()
        call_args = self.message.reply_text.call_args[0][0]
        self.assertIn("Please provide an event ID", call_args)

    @patch('handlers.requests')
    @patch('handlers.add_user_to_group')
    async def test_leave_event_handler_no_event_id(self, mock_add_user, mock_requests):
        # Test the leave event handler with no event ID
        await leave_event_handler(self.update, self.context)
        self.message.reply_text.assert_called_once()
        call_args = self.message.reply_text.call_args[0][0]
        self.assertIn("Please provide an event ID", call_args)

if __name__ == '__main__':
    unittest.main()
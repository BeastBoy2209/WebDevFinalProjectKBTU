from django.urls import path
from .views import (
    telegram_is_linked,
    telegram_unlink,
    user_by_telegram_id,
    UserProfileView,
    BadgeListCreateView, BadgeDetailView,
    EventListCreateView, EventDetailView,
    SwipeListCreateView, SwipeDetailView,
    ChatListCreateView, ChatDetailView,
    create_swipe, assign_badge, TelegramLinkView,
    LoginView
)

urlpatterns = [
    path('auth/login', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view()),
    path('badges/', BadgeListCreateView.as_view()),
    path('badges/<int:pk>/', BadgeDetailView.as_view()),
    path('events/', EventListCreateView.as_view()),
    path('events/<int:pk>/', EventDetailView.as_view()),
    path('swipes/', SwipeListCreateView.as_view()),
    path('swipes/<int:pk>/', SwipeDetailView.as_view()),
    path('chats/', ChatListCreateView.as_view()),
    path('chats/<int:pk>/', ChatDetailView.as_view()),
    path('swipe/', create_swipe),           
    path('assign-badge/', assign_badge),   
    path('telegram-link/', TelegramLinkView.as_view()),
    path('users/by-telegram-id/<int:telegram_user_id>/', user_by_telegram_id, name='user_by_telegram_id'),
    path('telegram/is_linked/<int:telegram_user_id>/', telegram_is_linked, name='telegram_is_linked'),
    path('users/unlink-telegram/', telegram_unlink, name='telegram_unlink'),
]
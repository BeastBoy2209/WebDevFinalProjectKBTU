from django.urls import path
from .views import (
    UserProfileView,
    BadgeListCreateView, BadgeDetailView,
    EventListCreateView, EventDetailView,
    SwipeListCreateView, SwipeDetailView,
    ChatListCreateView, ChatDetailView,
    create_swipe, assign_badge, TelegramLinkView, user_by_telegram_id, unlink_telegram
)

urlpatterns = [
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
    path('users/by-telegram-id/<int:telegram_id>/', user_by_telegram_id),
    path('users/unlink-telegram/', unlink_telegram),
]
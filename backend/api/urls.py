from django.urls import path
from .views import create_swipe, assign_badge, UserProfileView, EventListView, EventDetailView

urlpatterns = [
    path('swipe/', create_swipe),
    path('assign-badge/', assign_badge),
    path('profile/', UserProfileView.as_view()),
    path('events/', EventListView.as_view()),
    path('events/<int:pk>/', EventDetailView.as_view()),
]
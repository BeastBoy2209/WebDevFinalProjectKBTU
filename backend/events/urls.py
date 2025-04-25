from django.urls import path

from .views import expired_with_active_groups

urlpatterns = [
    path('expired-with-active-groups/', expired_with_active_groups, name='expired-with-active-groups'),
]
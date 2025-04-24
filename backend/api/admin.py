from django.contrib import admin
from .models import User, Badge, Event, Swipe, Chat

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'age', 'telegram_username', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'telegram_username')
    list_filter = ('is_staff', 'is_active', 'age')
    filter_horizontal = ('badges',)

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'type')
    search_fields = ('name', 'type')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('topic', 'date', 'location')
    search_fields = ('topic', 'location')
    filter_horizontal = ('participants',)

@admin.register(Swipe)
class SwipeAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'result', 'created_at')
    search_fields = ('from_user__email', 'to_user__email')

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('telegram_chat_id', 'created_at')
    filter_horizontal = ('users',)
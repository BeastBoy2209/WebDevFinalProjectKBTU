from django.contrib import admin
from .models import User, Badge, Event, Swipe, Chat
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.utils.translation import gettext_lazy as _

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = '__all__'

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    list_display = ('email', 'first_name', 'last_name', 'age', 'telegram_username', 'telegram_id', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'telegram_username', 'telegram_id')
    list_filter = ('is_staff', 'is_active', 'age')
    filter_horizontal = ('badges', 'groups', 'user_permissions')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'age', 'telegram_username', 'telegram_id', 'photo', 'bio')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions', 'badges')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'password1', 'password2'),
        }),
    )
    ordering = ('email',)

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
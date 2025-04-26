from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# Импортируем все модели из .models
from .models import User, Badge, Event, Swipe, Chat

# Настройка для модели User
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User # Явно указываем модель
    # Используем поля из вашей модели User
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'telegram_user_id') # Заменил username на email в начале
    search_fields = ('email', 'first_name', 'last_name', 'telegram_username') # Убрал username из поиска, т.к. его нет
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    filter_horizontal = ('groups', 'user_permissions', 'badges')
    fieldsets = ( # Переопределяем fieldsets, чтобы убрать username
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'age')}), # Добавил age
        ('Contact info', {'fields': ('telegram_username', 'telegram_user_id')}), # Добавил telegram
        ('Profile', {'fields': ('bio', 'photo', 'badges')}), # Добавил bio, photo, badges
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = ( # Переопределяем add_fieldsets, чтобы убрать username
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'password2'), # Используем email
        }),
    )
    ordering = ('email',) # Устанавливаем сортировку по email

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'icon')
    search_fields = ('name', 'type', 'description')
    list_filter = ('type',)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('topic', 'organizer', 'date', 'location', 'telegram_group_active') # Добавлены organizer и telegram_group_active
    search_fields = ('topic', 'location', 'organizer__username') # Добавлен поиск по организатору
    filter_horizontal = ('participants',)
    list_filter = ('date', 'telegram_group_active') # Добавлены фильтры

@admin.register(Swipe)
class SwipeAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'result', 'created_at')
    search_fields = ('from_user__username', 'to_user__username') # Используем username вместо email
    list_filter = ('result', 'created_at') # Добавлен фильтр по результату

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('get_display_name', 'event', 'telegram_chat_id', 'created_at') # Используем метод для отображения
    search_fields = ('event__topic', 'users__username', 'telegram_chat_id') # Добавлен поиск
    filter_horizontal = ('users',)
    list_filter = ('created_at',)

    def get_display_name(self, obj):
        # Метод для более понятного отображения чата в админке
        if obj.event:
            return f"Chat for Event: {obj.event.topic}"
        elif obj.telegram_chat_id:
            return f"Telegram Chat ID: {obj.telegram_chat_id}"
        else:
            user_list = ", ".join([user.username for user in obj.users.all()[:2]]) # Показываем первых двух юзеров
            if obj.users.count() > 2:
                user_list += "..."
            return f"Chat between: {user_list}"
    get_display_name.short_description = 'Chat Info' # Название колонки в админке
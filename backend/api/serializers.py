from rest_framework import serializers
# Импортируем все модели из api.models
from .models import User, Badge, Event, Swipe, Chat

class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для модели User"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'photo', 'telegram_username', 'telegram_user_id', 'badges', 'age'] # Добавлено age
        read_only_fields = ['id', 'email', 'badges', 'telegram_user_id'] # email обычно не меняется


class UserProfilePictureSerializer(serializers.ModelSerializer):
    """Сериализатор только для обновления фото профиля"""
    profile_picture = serializers.ImageField(write_only=True)
    
    class Meta:
        model = User
        fields = ['photo']


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'type', 'icon']


# --- ДОБАВЛЯЕМ EVENTSERIALIZER ---
class EventSerializer(serializers.ModelSerializer):
    organizer = serializers.PrimaryKeyRelatedField(read_only=True)
    participants = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    # Если хотите видеть больше информации об организаторе/участниках, используйте UserSerializer
    # organizer = UserSerializer(read_only=True)
    # participants = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            'id',
            'topic',
            'description',
            'date',
            'location',
            'organizer',
            'participants',
            'telegram_group_id',
            'telegram_group_active',
            'end_time',
            'chat' # Добавлено поле chat из модели Event
        ]
        read_only_fields = ['organizer', 'participants', 'telegram_group_id', 'telegram_group_active', 'chat']

    # Валидация может быть добавлена здесь при необходимости
# --- КОНЕЦ EVENTSERIALIZER ---

class SwipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Swipe
        fields = ['id', 'from_user', 'to_user', 'result', 'created_at']
        read_only_fields = ['from_user', 'created_at']


class ChatSerializer(serializers.ModelSerializer):
    # users = UserSerializer(many=True, read_only=True) # Если нужны полные данные юзеров
    users = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True) # Если нужны только ID

    class Meta:
        model = Chat
        fields = ['id', 'users', 'telegram_chat_id', 'created_at', 'event']
        read_only_fields = ['created_at', 'telegram_chat_id'] # telegram_chat_id создается ботом
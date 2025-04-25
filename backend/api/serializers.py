from rest_framework import serializers
from .models import User, Badge, Event, Swipe, Chat

class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для модели User"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'age', 'telegram_username', 
                 'telegram_id', 'photo', 'bio', 'badges']
        read_only_fields = ['id', 'email', 'telegram_id']


class UserProfilePictureSerializer(serializers.ModelSerializer):
    """Сериализатор только для обновления фото профиля"""
    profile_picture = serializers.ImageField(write_only=True)
    
    class Meta:
        model = User
        fields = ['profile_picture', 'photo']
        read_only_fields = ['photo']


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    class Meta:
        model = Event
        fields = '__all__'

class SwipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Swipe
        fields = '__all__'

class ChatSerializer(serializers.ModelSerializer):
    users = UserSerializer(many=True, read_only=True)
    class Meta:
        model = Chat
        fields = '__all__'
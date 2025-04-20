from rest_framework import serializers
from .models import User, Badge, Event, Swipe, Chat

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'photo', 'first_name', 'last_name']

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
from rest_framework import serializers
from .models import Event
# Импортируйте UserSerializer, если хотите вложенное представление организатора/участников
# from api.serializers import UserSerializer # Пример пути

class EventSerializer(serializers.ModelSerializer):
    # Если нужен только ID организатора (проще для начала)
    organizer = serializers.PrimaryKeyRelatedField(read_only=True)
    # Или если нужен вложенный объект пользователя (требует UserSerializer)
    # organizer = UserSerializer(read_only=True)

    # Если нужны ID участников
    participants = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    # Или если нужны вложенные объекты участников
    # participants = UserSerializer(many=True, read_only=True)

    # Преобразуем дату в нужный формат при чтении, если необходимо
    # date = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S.%fZ", input_formats=["%Y-%m-%dT%H:%M:%S.%fZ", "iso-8601"])

    class Meta:
        model = Event
        # Указываем все поля, которые должны быть в API ответе
        fields = [
            'id',
            'topic', # Используем topic
            'description',
            'date',
            'location',
            'organizer',
            'participants',
            'telegram_group_id',
            'telegram_group_active',
            'end_time'
            # 'title', # Убираем title, если заменили на topic
        ]
        # Поля только для чтения (не принимаются при POST/PUT запросах)
        read_only_fields = ['organizer', 'participants', 'telegram_group_id', 'telegram_group_active']

    # Можно добавить валидацию, если нужно
    # def validate_date(self, value):
    #     if value < timezone.now():
    #         raise serializers.ValidationError("Дата мероприятия не может быть в прошлом.")
    #     return value
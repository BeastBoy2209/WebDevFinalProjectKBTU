from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Event
from .serializers import EventSerializer
from django.utils import timezone

@api_view(['GET'])
def expired_with_active_groups(request):
    """
    Возвращает события, которые уже завершились и у которых активна Telegram-группа.
    """
    now = timezone.now()
    events = Event.objects.filter(
        end_time__lt=now,
        telegram_group_active=True
    )
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import User, Badge, Event, Swipe, Chat
from .serializers import UserSerializer, BadgeSerializer, EventSerializer, SwipeSerializer, ChatSerializer

# User: только профиль текущего пользователя
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user

# Badge CRUD
class BadgeListCreateView(generics.ListCreateAPIView):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

class BadgeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

# Event CRUD
class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

# Swipe CRUD (обычно только create и list нужны)
class SwipeListCreateView(generics.ListCreateAPIView):
    queryset = Swipe.objects.all()
    serializer_class = SwipeSerializer
    permission_classes = [permissions.IsAuthenticated]

class SwipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Swipe.objects.all()
    serializer_class = SwipeSerializer
    permission_classes = [permissions.IsAuthenticated]

# Chat CRUD
class ChatListCreateView(generics.ListCreateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChatDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_swipe(request):
    serializer = SwipeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(from_user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_badge(request):
    user = User.objects.get(pk=request.data['user_id'])
    badge = Badge.objects.get(pk=request.data['badge_id'])
    user.badges.add(badge)
    return Response({'status': 'badge assigned'})

class TelegramLinkView(APIView):
    permission_classes = []  # Allow any
    authentication_classes = []

    @method_decorator(csrf_exempt)
    def post(self, request):
        email = request.data.get('email')
        telegram_username = request.data.get('telegram_username')
        if not email or not telegram_username:
            return Response({'error': 'Email and telegram_username required.'}, status=400)
        try:
            user = User.objects.get(email=email)
            user.telegram_username = telegram_username
            user.save()
            return Response({'status': 'success'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)
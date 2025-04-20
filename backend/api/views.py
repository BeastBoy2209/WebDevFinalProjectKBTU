from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import User, Badge, Event, Swipe, Chat
from .serializers import UserSerializer, BadgeSerializer, EventSerializer, SwipeSerializer, ChatSerializer

# FBV: create_swipe
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_swipe(request):
    serializer = SwipeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(from_user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# FBV: assign_badge
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_badge(request):
    user = User.objects.get(pk=request.data['user_id'])
    badge = Badge.objects.get(pk=request.data['badge_id'])
    # Допустим, у пользователя есть поле badges = models.ManyToManyField(Badge)
    user.badges.add(badge)
    return Response({'status': 'badge assigned'})

# CBV: UserProfileView
class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# CBV: EventListView
class EventListView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

# CRUD для Event
class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
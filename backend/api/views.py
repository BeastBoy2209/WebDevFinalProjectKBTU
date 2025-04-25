from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import User, Badge, Event, Swipe, Chat
from .serializers import UserSerializer, BadgeSerializer, EventSerializer, SwipeSerializer, ChatSerializer, UserProfilePictureSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API для получения и обновления профиля пользователя
    GET: получить профиль текущего пользователя
    PATCH/PUT: обновить профиль текущего пользователя
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserProfilePictureView(generics.UpdateAPIView):
    """
    API для обновления фото профиля пользователя
    PATCH: обновить фото профиля
    """
    serializer_class = UserProfilePictureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        
        if 'profile_picture' not in request.FILES:
            return Response(
                {"error": "Необходимо загрузить файл изображения"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.photo = request.FILES['profile_picture']
        user.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data)

@api_view(['GET'])
def user_by_telegram_id(request, telegram_user_id):
    try:
        user = User.objects.get(telegram_id=telegram_user_id)
        return Response({
            "id": user.id,
            "email": user.email,
            "telegram_id": user.telegram_id,
            "telegram_username": getattr(user, "telegram_username", None)
        })
    except User.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)
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
def create_swipe(request):
    serializer = SwipeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(from_user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
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
        telegram_id = request.data.get('telegram_id')
        if not email or not telegram_username or not telegram_id:
            return Response({'error': 'Email, telegram_username and telegram_id required.'}, status=400)
        # Привести email к нижнему регистру и убрать пробелы
        email_clean = email.strip().lower()
        try:
            user = User.objects.get(email=email_clean)
            user.telegram_username = telegram_username
            user.telegram_id = telegram_id
            user.save()
            return Response({'status': 'success'})
        except User.DoesNotExist:
            # Для отладки: вывести все email в базе
            all_emails = list(User.objects.values_list('email', flat=True))
            return Response({'error': f'User not found. Tried: {email_clean}. Existing: {all_emails}'}, status=404)

@api_view(['GET'])
def telegram_is_linked(request, telegram_user_id):
    try:
        user = User.objects.get(telegram_id=telegram_user_id)
        return Response({"linked": True})
    except User.DoesNotExist:
        return Response({"linked": False})
    
@api_view(['POST'])
def telegram_unlink(request):
    telegram_id = request.data.get("telegram_id")
    if not telegram_id:
        return Response({"success": False, "error": "telegram_id required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(telegram_id=telegram_id)
        user.telegram_id = None
        user.save()
        return Response({"success": True})
    except User.DoesNotExist:
        return Response({"success": False, "error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'fullName': user.get_full_name(),
                }
            })
        return Response({'message': 'Неверный email или пароль'}, status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(APIView):
    permission_classes = []  # Allow any - no auth required for registration
    authentication_classes = []

    def post(self, request):
        try:
            # Извлекаем данные из запроса
            email = request.data.get('email')
            username = request.data.get('username')
            password = request.data.get('password')
            password_confirm = request.data.get('password_confirm')
            
            # Базовые проверки данных
            if not email or not username or not password:
                return Response({'message': 'Email, имя пользователя и пароль обязательны'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            if password != password_confirm:
                return Response({'message': 'Пароли не совпадают'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Проверяем существование email
            if User.objects.filter(email=email).exists():
                return Response({'message': 'Пользователь с таким email уже существует'}, 
                              status=status.HTTP_409_CONFLICT)
            
            # Создаем пользователя
            user = User.objects.create(
                email=email,
                first_name=username,  # Используем username как first_name
            )
            user.set_password(password)
            
            # Обрабатываем загрузку изображения профиля, если оно есть
            profile_image = request.FILES.get('profile_image')
            if profile_image:
                user.photo = profile_image
            
            user.save()
            
            # Генерируем токен для нового пользователя
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'token': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'fullName': user.get_full_name(),
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Ошибка регистрации: {str(e)}")
            return Response({'message': f'Ошибка регистрации: {str(e)}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings

class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    telegram_username = models.CharField(max_length=100, blank=True, null=True)
    telegram_user_id = models.CharField(max_length=100, blank=True, null=True, unique=True, db_index=True)
    badges = models.ManyToManyField('Badge', blank=True, related_name='users')
    age = models.PositiveIntegerField(blank=True, null=True) # Добавлено поле age

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='api_user_set', # Изменено related_name
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='api_user_set_permissions', # Изменено related_name
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return self.email

class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=50) # Например, 'participation', 'creation', 'social'
    icon = models.CharField(max_length=255, blank=True, null=True) # URL или класс иконки

    def __str__(self):
        return self.name

# --- ДОБАВЛЯЕМ МОДЕЛЬ EVENT ---


class Event(models.Model):
    topic = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True, null=True)
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='organized_events',
        on_delete=models.CASCADE,
        null=True, # Разрешить NULL в базе данных
        blank=True # Разрешить пустое значение в формах/админке (обычно идет вместе с null=True для ForeignKey)
    )
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='participated_events',
        blank=True
    )
    telegram_group_id = models.CharField(max_length=100, blank=True, null=True)
    telegram_group_active = models.BooleanField(default=False)
    end_time = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.topic
# --- КОНЕЦ МОДЕЛИ EVENT ---

class Swipe(models.Model):
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='swipes_made', on_delete=models.CASCADE)
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='swipes_received', on_delete=models.CASCADE)
    result = models.CharField(max_length=10, choices=[('like', 'Like'), ('dislike', 'Dislike')]) # like/dislike
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f"{self.from_user} -> {self.to_user}: {'like' if self.result else 'dislike'}"

class Chat(models.Model):
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chats')
    telegram_chat_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    event = models.OneToOneField(Event, on_delete=models.SET_NULL, null=True, blank=True, related_name='chat') # Связь с Event

    def __str__(self):
        if self.event:
            return f"Chat for Event: {self.event.topic}"
        elif self.telegram_chat_id:
            return f"Telegram Chat ID: {self.telegram_chat_id}"
        else:
            user_list = ", ".join([user.username for user in self.users.all()])
            return f"Chat between: {user_list}"
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

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
    age = models.PositiveIntegerField(null=True, blank=True)
    telegram_username = models.CharField(max_length=64, blank=True)
    photo = models.ImageField(upload_to='user_photos/', blank=True, null=True)
    bio = models.TextField(blank=True)
    badges = models.ManyToManyField('Badge', related_name='users', blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return self.email

class Badge(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    type = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Event(models.Model):
    topic = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    participants = models.ManyToManyField(User, related_name='events', blank=True)
    chat = models.OneToOneField('Chat', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.topic} ({self.date})"

class Swipe(models.Model):
    from_user = models.ForeignKey(User, related_name='swipes_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='swipes_received', on_delete=models.CASCADE)
    result = models.BooleanField()  # True - like, False - dislike
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.from_user} -> {self.to_user}: {'like' if self.result else 'dislike'}"

class Chat(models.Model):
    users = models.ManyToManyField(User, related_name='chats')
    telegram_chat_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat {self.telegram_chat_id}"
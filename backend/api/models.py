from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    photo = models.ImageField(upload_to='user_photos/', blank=True, null=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

class Badge(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    type = models.CharField(max_length=50)

class Event(models.Model):
    topic = models.CharField(max_length=100)
    date = models.DateTimeField()
    participants = models.ManyToManyField('User', related_name='events')

class Swipe(models.Model):
    from_user = models.ForeignKey('User', related_name='swipes_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey('User', related_name='swipes_received', on_delete=models.CASCADE)
    result = models.BooleanField()

class Chat(models.Model):
    users = models.ManyToManyField('User', related_name='chats')
    telegram_chat_id = models.CharField(max_length=100)
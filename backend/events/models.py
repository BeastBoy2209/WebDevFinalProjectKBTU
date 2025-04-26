from django.db import models
from django.conf import settings # Импортируем settings

class Event(models.Model):
    topic = models.CharField(max_length=255) # Используем topic вместо title, как во фронтенде
    description = models.TextField(blank=True, null=True)
    date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True, null=True)
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='organized_events',
        on_delete=models.CASCADE 
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

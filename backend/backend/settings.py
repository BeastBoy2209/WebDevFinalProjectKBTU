INSTALLED_APPS = [
    # ...existing code...
    'corsheaders',
    # ...existing code...
]
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...existing code...
]
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Настройки для медиа-файлов (изображения, загружаемые пользователями)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
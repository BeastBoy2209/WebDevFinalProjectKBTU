from rest_framework.permissions import BasePermission

class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj == request.user or request.method in ('GET', 'HEAD', 'OPTIONS')
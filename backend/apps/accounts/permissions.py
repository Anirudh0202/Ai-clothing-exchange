from rest_framework.permissions import BasePermission


class IsAccountOwner(BasePermission):
    message = 'You do not have permission to access this resource.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return obj == request.user

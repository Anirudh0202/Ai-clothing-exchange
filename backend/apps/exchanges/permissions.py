from rest_framework.permissions import BasePermission


class IsExchangeParticipant(BasePermission):
    message = 'You are not authorized to access this exchange request.'

    def has_object_permission(self, request, view, obj):
        return obj.requester == request.user or obj.owner == request.user


class IsRequestOwner(BasePermission):
    message = 'Only the item owner can perform this action.'

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsRequestCreator(BasePermission):
    message = 'Only the requester can perform this action.'

    def has_object_permission(self, request, view, obj):
        return obj.requester == request.user

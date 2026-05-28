from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.items.models import ClothingItem
from .models import ExchangeEvent, ExchangeHistory, ExchangeRequest
from .permissions import IsExchangeParticipant, IsRequestCreator, IsRequestOwner
from .serializers import (
    ExchangeEventSerializer,
    ExchangeHistorySerializer,
    ExchangeRequestCreateSerializer,
    ExchangeRequestDetailSerializer,
    ExchangeRequestListSerializer,
    ExchangeRequestUpdateSerializer,
)


class ExchangeRequestViewSet(viewsets.GenericViewSet,
                             mixins.CreateModelMixin,
                             mixins.RetrieveModelMixin,
                             mixins.ListModelMixin,
                             mixins.UpdateModelMixin):
    queryset = ExchangeRequest.objects.select_related(
        'requester', 'owner', 'requested_item', 'offered_item'
    ).prefetch_related('events', 'history')
    permission_classes = [permissions.IsAuthenticated, IsExchangeParticipant]

    def get_serializer_class(self):
        if self.action == 'create':
            return ExchangeRequestCreateSerializer
        if self.action in ('update', 'partial_update'):
            return ExchangeRequestUpdateSerializer
        if self.action == 'retrieve':
            return ExchangeRequestDetailSerializer
        return ExchangeRequestListSerializer

    def get_queryset(self):
        user = self.request.user
        base = super().get_queryset()
        if self.action in ('incoming',):
            return base.filter(owner=user)
        if self.action in ('outgoing',):
            return base.filter(requester=user)
        return base.filter(Q(requester=user) | Q(owner=user))

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'], url_path='incoming')
    def incoming(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = ExchangeRequestListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=['get'], url_path='outgoing')
    def outgoing(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = ExchangeRequestListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsRequestOwner])
    def accept(self, request, pk=None):
        exchange_request = self.get_object()
        if exchange_request.status != ExchangeRequest.STATUS_PENDING:
            return Response({'detail': 'Only pending requests can be accepted.'}, status=status.HTTP_400_BAD_REQUEST)
        if exchange_request.requested_item.status != ClothingItem.STATUS_AVAILABLE or exchange_request.offered_item.status != ClothingItem.STATUS_AVAILABLE:
            return Response({'detail': 'Both items must remain available to accept the exchange.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            exchange_request.status = ExchangeRequest.STATUS_ACCEPTED
            exchange_request.updated_at = timezone.now()
            exchange_request.save(update_fields=['status', 'updated_at'])
            ExchangeEvent.objects.create(
                exchange_request=exchange_request,
                event_type='accepted',
                previous_status=ExchangeRequest.STATUS_PENDING,
                status=exchange_request.status,
                note='Exchange request accepted.',
            )
        serializer = ExchangeRequestDetailSerializer(exchange_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsRequestOwner])
    def reject(self, request, pk=None):
        exchange_request = self.get_object()
        if exchange_request.status != ExchangeRequest.STATUS_PENDING:
            return Response({'detail': 'Only pending requests can be rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            exchange_request.status = ExchangeRequest.STATUS_REJECTED
            exchange_request.updated_at = timezone.now()
            exchange_request.save(update_fields=['status', 'updated_at'])
            ExchangeEvent.objects.create(
                exchange_request=exchange_request,
                event_type='rejected',
                previous_status=ExchangeRequest.STATUS_PENDING,
                status=exchange_request.status,
                note='Exchange request rejected.',
            )
        serializer = ExchangeRequestDetailSerializer(exchange_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsRequestCreator])
    def cancel(self, request, pk=None):
        exchange_request = self.get_object()
        if exchange_request.status != ExchangeRequest.STATUS_PENDING:
            return Response({'detail': 'Only pending requests can be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            exchange_request.status = ExchangeRequest.STATUS_CANCELLED
            exchange_request.updated_at = timezone.now()
            exchange_request.save(update_fields=['status', 'updated_at'])
            ExchangeEvent.objects.create(
                exchange_request=exchange_request,
                event_type='cancelled',
                previous_status=ExchangeRequest.STATUS_PENDING,
                status=exchange_request.status,
                note='Exchange request cancelled by requester.',
            )
        serializer = ExchangeRequestDetailSerializer(exchange_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsExchangeParticipant])
    def complete(self, request, pk=None):
        exchange_request = self.get_object()
        if exchange_request.status != ExchangeRequest.STATUS_ACCEPTED:
            return Response({'detail': 'Only accepted requests can be completed.'}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            exchange_request.status = ExchangeRequest.STATUS_COMPLETED
            exchange_request.completed_at = timezone.now()
            exchange_request.updated_at = timezone.now()
            exchange_request.save(update_fields=['status', 'completed_at', 'updated_at'])

            exchange_request.requested_item.status = ClothingItem.STATUS_SWAPPED
            exchange_request.offered_item.status = ClothingItem.STATUS_SWAPPED
            exchange_request.requested_item.save(update_fields=['status'])
            exchange_request.offered_item.save(update_fields=['status'])

            ExchangeHistory.objects.create(
                exchange_request=exchange_request,
                final_status=exchange_request.status,
            )
            ExchangeEvent.objects.create(
                exchange_request=exchange_request,
                event_type='completed',
                previous_status=ExchangeRequest.STATUS_ACCEPTED,
                status=exchange_request.status,
                note='Exchange completed and item statuses updated.',
            )
        serializer = ExchangeRequestDetailSerializer(exchange_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsExchangeParticipant])
    def history(self, request, pk=None):
        exchange_request = self.get_object()
        event_serializer = ExchangeEventSerializer(exchange_request.events.all(), many=True)
        history_serializer = ExchangeHistorySerializer(getattr(exchange_request, 'history', None))
        return Response({
            'events': event_serializer.data,
            'history': history_serializer.data,
        }, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != ExchangeRequest.STATUS_PENDING:
            return Response({'detail': 'Only pending requests may be updated.'}, status=status.HTTP_400_BAD_REQUEST)
        if instance.requester != request.user:
            return Response({'detail': 'Only the requester can update the exchange message.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)


class ExchangeHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExchangeHistory.objects.select_related('exchange_request')
    serializer_class = ExchangeHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(
            Q(exchange_request__requester=user) | Q(exchange_request__owner=user)
        )

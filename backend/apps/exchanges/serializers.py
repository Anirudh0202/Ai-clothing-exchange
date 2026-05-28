from django.db import transaction
from rest_framework import serializers

from apps.items.models import ClothingItem
from apps.items.serializers import ClothingItemListSerializer
from apps.accounts.serializers import UserSerializer
from .models import ExchangeEvent, ExchangeHistory, ExchangeRequest


class ExchangeEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeEvent
        fields = ('id', 'event_type', 'previous_status', 'status', 'note', 'created_at')
        read_only_fields = ('id', 'created_at')


class ExchangeHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeHistory
        fields = ('id', 'exchange_request', 'final_status', 'completed_at', 'requester_feedback', 'owner_feedback', 'created_at')
        read_only_fields = ('id', 'exchange_request', 'final_status', 'completed_at', 'created_at')


class ExchangeRequestListSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    owner = UserSerializer(read_only=True)
    requested_item = ClothingItemListSerializer(read_only=True)
    offered_item = ClothingItemListSerializer(read_only=True)

    class Meta:
        model = ExchangeRequest
        fields = (
            'id',
            'requester',
            'owner',
            'requested_item',
            'offered_item',
            'status',
            'message',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'requester', 'owner', 'status', 'created_at', 'updated_at')


class ExchangeRequestDetailSerializer(ExchangeRequestListSerializer):
    events = ExchangeEventSerializer(many=True, read_only=True)
    history = ExchangeHistorySerializer(read_only=True)

    class Meta(ExchangeRequestListSerializer.Meta):
        fields = ExchangeRequestListSerializer.Meta.fields + ('events', 'history',)


class ExchangeRequestCreateSerializer(serializers.ModelSerializer):
    requested_item = serializers.PrimaryKeyRelatedField(queryset=ClothingItem.objects.all())
    offered_item = serializers.PrimaryKeyRelatedField(queryset=ClothingItem.objects.all())
    message = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ExchangeRequest
        fields = ('requested_item', 'offered_item', 'message')

    def validate(self, attrs):
        requester = self.context['request'].user
        requested_item = attrs['requested_item']
        offered_item = attrs['offered_item']

        if requested_item.owner == requester:
            raise serializers.ValidationError('You cannot request your own item.')
        if offered_item.owner != requester:
            raise serializers.ValidationError('Offered item must belong to the requesting user.')
        if requested_item.status != ClothingItem.STATUS_AVAILABLE or offered_item.status != ClothingItem.STATUS_AVAILABLE:
            raise serializers.ValidationError('Both items must be available for exchange.')
        if requested_item == offered_item:
            raise serializers.ValidationError('Requested item and offered item must be different.')

        active_conflict = ExchangeRequest.objects.filter(
            requester=requester,
            requested_item=requested_item,
            offered_item=offered_item,
            status=ExchangeRequest.STATUS_PENDING,
        ).exists()
        if active_conflict:
            raise serializers.ValidationError('An active exchange request for these items already exists.')

        if ExchangeRequest.objects.filter(
            requester=requester,
            offered_item=requested_item,
            requested_item=offered_item,
            status=ExchangeRequest.STATUS_PENDING,
        ).exists():
            raise serializers.ValidationError('A reciprocal pending request already exists.')

        return attrs

    def create(self, validated_data):
        requester = self.context['request'].user
        validated_data['requester'] = requester
        validated_data['owner'] = validated_data['requested_item'].owner
        with transaction.atomic():
            exchange_request = ExchangeRequest.objects.create(**validated_data)
            ExchangeEvent.objects.create(
                exchange_request=exchange_request,
                event_type='created',
                previous_status='',
                status=exchange_request.status,
                note='Exchange request created.',
            )
            return exchange_request


class ExchangeRequestUpdateSerializer(serializers.ModelSerializer):
    message = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ExchangeRequest
        fields = ('message',)

    def validate(self, attrs):
        exchange_request = self.instance
        if exchange_request.status != ExchangeRequest.STATUS_PENDING:
            raise serializers.ValidationError('Only pending requests may be updated.')
        return attrs

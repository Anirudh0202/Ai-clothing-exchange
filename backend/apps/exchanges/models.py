from django.db import models
from django.db.models import Q
from django.utils import timezone


class ExchangeRequest(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_ACCEPTED = 'accepted'
    STATUS_REJECTED = 'rejected'
    STATUS_CANCELLED = 'cancelled'
    STATUS_COMPLETED = 'completed'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_REJECTED, 'Rejected'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_COMPLETED, 'Completed'),
    ]

    requester = models.ForeignKey(
        'accounts.User',
        related_name='exchange_requests',
        on_delete=models.CASCADE,
    )
    owner = models.ForeignKey(
        'accounts.User',
        related_name='incoming_requests',
        on_delete=models.CASCADE,
    )
    requested_item = models.ForeignKey(
        'items.ClothingItem',
        related_name='incoming_exchange_requests',
        on_delete=models.PROTECT,
    )
    offered_item = models.ForeignKey(
        'items.ClothingItem',
        related_name='outgoing_exchange_requests',
        on_delete=models.PROTECT,
    )
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['requester', 'requested_item', 'offered_item'],
                condition=Q(status='pending'),
                name='unique_pending_exchange_request',
            ),
        ]
        verbose_name = 'Exchange Request'
        verbose_name_plural = 'Exchange Requests'

    def __str__(self):
        return f'ExchangeRequest {self.id} ({self.status})'


class ExchangeHistory(models.Model):
    exchange_request = models.OneToOneField(
        ExchangeRequest,
        related_name='history',
        on_delete=models.CASCADE,
    )
    completed_at = models.DateTimeField(default=timezone.now)
    final_status = models.CharField(max_length=20, choices=ExchangeRequest.STATUS_CHOICES)
    requester_feedback = models.TextField(blank=True)
    owner_feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Exchange History'
        verbose_name_plural = 'Exchange Histories'

    def __str__(self):
        return f'History for request {self.exchange_request_id}'


class ExchangeEvent(models.Model):
    exchange_request = models.ForeignKey(
        ExchangeRequest,
        related_name='events',
        on_delete=models.CASCADE,
    )
    event_type = models.CharField(max_length=50)
    previous_status = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Exchange Event'
        verbose_name_plural = 'Exchange Events'

    def __str__(self):
        return f'Event {self.event_type} for request {self.exchange_request_id}'

from django.contrib import admin

from .models import ExchangeEvent, ExchangeHistory, ExchangeRequest


@admin.register(ExchangeRequest)
class ExchangeRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'requester',
        'owner',
        'requested_item',
        'offered_item',
        'status',
        'created_at',
        'updated_at',
    )
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = (
        'requester__email',
        'requester__username',
        'owner__email',
        'owner__username',
        'requested_item__title',
        'offered_item__title',
    )
    raw_id_fields = ('requester', 'owner', 'requested_item', 'offered_item')


@admin.register(ExchangeHistory)
class ExchangeHistoryAdmin(admin.ModelAdmin):
    list_display = ('exchange_request', 'final_status', 'completed_at', 'created_at')
    search_fields = ('exchange_request__id',)
    raw_id_fields = ('exchange_request',)


@admin.register(ExchangeEvent)
class ExchangeEventAdmin(admin.ModelAdmin):
    list_display = ('exchange_request', 'event_type', 'status', 'created_at')
    search_fields = ('exchange_request__id', 'event_type', 'note')
    raw_id_fields = ('exchange_request',)

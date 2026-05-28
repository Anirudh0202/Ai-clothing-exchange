from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ExchangeHistoryViewSet, ExchangeRequestViewSet

router = DefaultRouter()
router.register(r'', ExchangeRequestViewSet, basename='exchange-request')
router.register(r'history', ExchangeHistoryViewSet, basename='exchange-history')

urlpatterns = [
    path('', include(router.urls)),
]

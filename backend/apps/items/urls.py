from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ClothingItemViewSet, ItemImageViewSet, TagViewSet

router = DefaultRouter()
router.register(r'images', ItemImageViewSet, basename='itemimage')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'', ClothingItemViewSet, basename='clothingitem')

urlpatterns = [
    path('', include(router.urls)),
]

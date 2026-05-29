from django.db.models import Q
from rest_framework import filters, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from apps.recommendations.services import get_recommended_items_for_item
from .models import Category, ClothingItem, ItemImage, Tag
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    CategorySerializer,
    ClothingItemCreateUpdateSerializer,
    ClothingItemDetailSerializer,
    ClothingItemListSerializer,
    ItemImageSerializer,
    TagSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.order_by('name')
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


class ClothingItemViewSet(viewsets.ModelViewSet):
    queryset = ClothingItem.objects.all().select_related('owner', 'category').prefetch_related('tags', 'images')
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'brand', 'location']
    ordering_fields = ['created_at', 'updated_at', 'title', 'brand']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ('list',):
            return ClothingItemListSerializer
        if self.action in ('retrieve',):
            return ClothingItemDetailSerializer
        return ClothingItemCreateUpdateSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params
        search = params.get('q')
        category = params.get('category')
        status_param = params.get('status')
        condition = params.get('condition')
        size = params.get('size')
        brand = params.get('brand')
        owner = params.get('owner')
        tags = params.getlist('tag')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(brand__icontains=search)
                | Q(location__icontains=search)
            )
        if category:
            queryset = queryset.filter(category__slug=category)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if condition:
            queryset = queryset.filter(condition=condition)
        if size:
            queryset = queryset.filter(size=size)
        if brand:
            queryset = queryset.filter(brand__icontains=brand)
        if owner:
            queryset = queryset.filter(owner_id=owner)
        if tags:
            queryset = queryset.filter(tags__name__in=tags).distinct()
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def archive(self, request, pk=None):
        item = self.get_object()
        if item.owner != request.user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        item.status = ClothingItem.STATUS_ARCHIVED
        item.save(update_fields=['status'])
        return Response({'detail': 'Item archived.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def recommendations(self, request, pk=None):
        item = self.get_object()
        recommended_items = get_recommended_items_for_item(item, limit=5)
        serializer = ClothingItemListSerializer(recommended_items, many=True, context=self.get_serializer_context())
        return Response(serializer.data)


class ItemImageViewSet(viewsets.ModelViewSet):
    queryset = ItemImage.objects.all().select_related('item')
    serializer_class = ItemImageSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        item = serializer.validated_data['item']
        if item.owner != self.request.user:
            raise permissions.PermissionDenied('You do not own this item.')
        serializer.save()

    def get_queryset(self):
        queryset = super().get_queryset()
        item_id = self.request.query_params.get('item_id')
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        return queryset

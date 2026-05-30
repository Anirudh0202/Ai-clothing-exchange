from django.db import transaction
from rest_framework import serializers

from .models import Category, ClothingItem, ItemImage, Tag


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')
        read_only_fields = ('id',)


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name')
        read_only_fields = ('id',)


class ItemImageSerializer(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(queryset=ClothingItem.objects.all())

    class Meta:
        model = ItemImage
        fields = ('id', 'item', 'image', 'source_url', 'is_primary', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.source_url:
            data['image'] = instance.source_url
        return data


class ClothingItemListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(read_only=True, many=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = ClothingItem
        fields = (
            'id',
            'title',
            'description',
            'brand',
            'size',
            'condition',
            'status',
            'category',
            'tags',
            'location',
            'primary_image',
            'created_at',
            'updated_at',
        )

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        return ItemImageSerializer(primary).data if primary else None


class ClothingItemDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(read_only=True, many=True)
    images = ItemImageSerializer(read_only=True, many=True)
    owner = serializers.SerializerMethodField()

    class Meta:
        model = ClothingItem
        fields = (
            'id',
            'title',
            'description',
            'brand',
            'size',
            'condition',
            'status',
            'category',
            'tags',
            'location',
            'metadata',
            'images',
            'owner',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')

    def get_owner(self, obj):
        return {
            'id': obj.owner.id,
            'email': obj.owner.email,
            'username': obj.owner.username,
        }


class ClothingItemCreateUpdateSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Category.objects.all(),
        required=False,
        allow_null=True,
    )
    tags = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True,
    )
    metadata = serializers.DictField(required=False, allow_null=True)

    class Meta:
        model = ClothingItem
        fields = (
            'id',
            'title',
            'description',
            'brand',
            'size',
            'condition',
            'status',
            'category',
            'tags',
            'location',
            'metadata',
        )
        read_only_fields = ('id',)

    def validate_status(self, value):
        if value not in dict(ClothingItem.STATUS_CHOICES):
            raise serializers.ValidationError('Invalid item status.')
        return value

    def validate(self, attrs):
        if attrs.get('status') == ClothingItem.STATUS_SWAPPED and self.instance is None:
            raise serializers.ValidationError('Cannot create an item already marked as swapped.')
        return attrs

    def create(self, validated_data):
        tag_names = validated_data.pop('tags', [])
        with transaction.atomic():
            item = ClothingItem.objects.create(**validated_data, owner=self.context['request'].user)
            tags = []
            for name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=name.strip().lower())
                tags.append(tag)
            item.tags.set(tags)
            return item

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tags', None)
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            if tag_names is not None:
                tags = []
                for name in tag_names:
                    tag, _ = Tag.objects.get_or_create(name=name.strip().lower())
                    tags.append(tag)
                instance.tags.set(tags)
            instance.save()
            return instance

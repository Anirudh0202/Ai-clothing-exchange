import os
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


def item_image_upload_path(instance, filename):
    extension = filename.split('.')[-1]
    filename = f'{uuid.uuid4().hex}.{extension}'
    return os.path.join('items', str(instance.item.id), filename)


def validate_image_size(image):
    max_size_mb = 5
    content_length = getattr(image, 'size', None)
    if content_length and content_length > max_size_mb * 1024 * 1024:
        raise ValidationError(f'Image size must be under {max_size_mb}MB.')


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'

    def __str__(self):
        return self.name


class ClothingItem(models.Model):
    STATUS_AVAILABLE = 'available'
    STATUS_PENDING = 'pending'
    STATUS_SWAPPED = 'swapped'
    STATUS_ARCHIVED = 'archived'

    STATUS_CHOICES = [
        (STATUS_AVAILABLE, 'Available'),
        (STATUS_PENDING, 'Pending'),
        (STATUS_SWAPPED, 'Swapped'),
        (STATUS_ARCHIVED, 'Archived'),
    ]

    CONDITION_NEW = 'new'
    CONDITION_LIKE_NEW = 'like_new'
    CONDITION_GOOD = 'good'
    CONDITION_FAIR = 'fair'

    CONDITION_CHOICES = [
        (CONDITION_NEW, 'New'),
        (CONDITION_LIKE_NEW, 'Like New'),
        (CONDITION_GOOD, 'Good'),
        (CONDITION_FAIR, 'Fair'),
    ]

    SIZE_CHOICES = [
        ('XS', 'XS'),
        ('S', 'S'),
        ('M', 'M'),
        ('L', 'L'),
        ('XL', 'XL'),
        ('XXL', 'XXL'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='items',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='items',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    brand = models.CharField(max_length=150, blank=True)
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, blank=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default=CONDITION_GOOD)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_AVAILABLE)
    location = models.CharField(max_length=200, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name='items')
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'category']),
            models.Index(fields=['brand']),
            models.Index(fields=['size']),
        ]
        verbose_name = 'Clothing Item'
        verbose_name_plural = 'Clothing Items'

    def __str__(self):
        return self.title


class ItemImage(models.Model):
    item = models.ForeignKey(
        ClothingItem,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to=item_image_upload_path, validators=[validate_image_size])
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
        verbose_name = 'Item Image'
        verbose_name_plural = 'Item Images'

    def save(self, *args, **kwargs):
        if self.is_primary:
            self.__class__.objects.filter(item=self.item, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Image for {self.item.title}'

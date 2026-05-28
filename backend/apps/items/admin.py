from django.contrib import admin

from .models import Category, ClothingItem, ItemImage, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'slug')


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 0
    readonly_fields = ('uploaded_at',)


@admin.register(ClothingItem)
class ClothingItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'category', 'status', 'condition', 'size', 'created_at')
    list_filter = ('status', 'condition', 'size', 'category')
    search_fields = ('title', 'description', 'brand')
    raw_id_fields = ('owner',)
    inlines = [ItemImageInline]
    filter_horizontal = ('tags',)

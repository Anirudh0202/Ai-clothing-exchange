from django.db.models import Q

from apps.items.models import ClothingItem


def get_recommended_items_for_item(item: ClothingItem, limit: int = 5):
    if item is None:
        return []

    base_tags = {tag.name.lower() for tag in item.tags.all()}
    candidate_queryset = (
        ClothingItem.objects.exclude(pk=item.pk)
        .exclude(status=ClothingItem.STATUS_ARCHIVED)
        .select_related('owner', 'category')
        .prefetch_related('tags', 'images')
    )

    filters = Q()
    if item.category_id:
        filters |= Q(category_id=item.category_id)
    if item.brand:
        filters |= Q(brand__iexact=item.brand)
    if item.size:
        filters |= Q(size=item.size)
    if item.condition:
        filters |= Q(condition=item.condition)
    if base_tags:
        filters |= Q(tags__name__in=base_tags)

    if filters:
        candidate_queryset = candidate_queryset.filter(filters).distinct()

    scored_candidates = []
    for candidate in candidate_queryset:
        score = 0

        if item.category_id and candidate.category_id == item.category_id:
            score += 40

        if item.brand and candidate.brand and item.brand.lower() == candidate.brand.lower():
            score += 15

        if item.size and candidate.size and item.size == candidate.size:
            score += 10

        if item.condition and candidate.condition and item.condition == candidate.condition:
            score += 5

        candidate_tags = {tag.name.lower() for tag in candidate.tags.all()}
        score += len(base_tags.intersection(candidate_tags)) * 20

        scored_candidates.append((score, candidate))

    scored_candidates.sort(key=lambda pair: (-pair[0], -int(pair[1].created_at.timestamp())))
    recommendations = [candidate for score, candidate in scored_candidates if score > 0][:limit]

    if len(recommendations) < limit:
        remaining = [candidate for score, candidate in scored_candidates if score == 0]
        recommendations.extend([candidate for candidate in remaining][: limit - len(recommendations)])

    return recommendations

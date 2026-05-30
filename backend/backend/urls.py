from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.urls import include, path


def api_root(request):
    return JsonResponse({
        'auth': '/api/auth/',
        'items': '/api/items/',
        'exchanges': '/api/exchanges/',
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/items/', include('apps.items.urls')),
    path('api/exchanges/', include('apps.exchanges.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

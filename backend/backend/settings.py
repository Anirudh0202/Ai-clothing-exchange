import os
from datetime import timedelta
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent.parent

ENV_PATH = BASE_DIR.parent / '.env'
if ENV_PATH.exists():
    with ENV_PATH.open() as env_file:
        for line in env_file:
            value = line.strip()
            if not value or value.startswith('#'):
                continue
            key, _, raw_value = value.partition('=')
            if key and raw_value and key not in os.environ:
                os.environ.setdefault(key, raw_value)


def get_bool_env(key, default=False):
    value = os.getenv(key, str(default))
    return value.lower() in ('true', '1', 'yes')


def get_list_env(key, default=None):
    raw = os.getenv(key)
    if raw is None:
        return default or []
    return [value.strip() for value in raw.split(',') if value.strip()]


def get_required_env(key):
    value = os.getenv(key)
    if not value:
        raise ImproperlyConfigured(f'{key} environment variable is required.')
    return value


SECRET_KEY = get_required_env('DJANGO_SECRET_KEY')
DEBUG = get_bool_env('DJANGO_DEBUG', False)
ALLOWED_HOSTS = get_list_env('DJANGO_ALLOWED_HOSTS', ['localhost', '127.0.0.1'])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'apps.accounts',
    'apps.items',
    'apps.exchanges',
    'apps.recommendations',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

USE_SQLITE = get_bool_env('DJANGO_USE_SQLITE', False)

# Support DATABASE_URL for platforms like Render/Neon. If DATABASE_URL is present,
# parse it and use it; otherwise fall back to the previous POSTGRES_* envvar logic.
DATABASE_URL = os.getenv('DATABASE_URL')

if USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    if DATABASE_URL:
        parsed = urlparse(DATABASE_URL)
        scheme = parsed.scheme
        if scheme.startswith('sqlite'):
            # sqlite:///relative or sqlite:////absolute
            db_path = parsed.path.lstrip('/')
            if not db_path:
                db_name = BASE_DIR / 'db.sqlite3'
            else:
                db_name = BASE_DIR / db_path
            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': str(db_name),
                }
            }
        else:
            # default to PostgreSQL-compatible engines
            engine = 'django.db.backends.postgresql'
            db_name = parsed.path.lstrip('/') if parsed.path else ''
            db_user = parsed.username or ''
            db_password = parsed.password or ''
            db_host = parsed.hostname or ''
            db_port = str(parsed.port) if parsed.port else ''
            DATABASES = {
                'default': {
                    'ENGINE': engine,
                    'NAME': db_name,
                    'USER': db_user,
                    'PASSWORD': db_password,
                    'HOST': db_host,
                    'PORT': db_port,
                }
            }
    else:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.getenv('POSTGRES_DB', 'clothing_db') if DEBUG else get_required_env('POSTGRES_DB'),
                'USER': os.getenv('POSTGRES_USER', 'clothing_user') if DEBUG else get_required_env('POSTGRES_USER'),
                'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'clothing_password') if DEBUG else get_required_env('POSTGRES_PASSWORD'),
                'HOST': os.getenv('POSTGRES_HOST', 'localhost') if DEBUG else get_required_env('POSTGRES_HOST'),
                'PORT': os.getenv('POSTGRES_PORT', '5432') if DEBUG else get_required_env('POSTGRES_PORT'),
            }
        }

AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'UPDATE_LAST_LOGIN': False,
}

CORS_ALLOWED_ORIGINS = get_list_env('CORS_ALLOWED_ORIGINS', ['http://localhost:3000'])
CORS_ALLOW_ALL_ORIGINS = get_bool_env('CORS_ALLOW_ALL', False)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = get_list_env('CSRF_TRUSTED_ORIGINS', [])

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = get_bool_env('USE_X_FORWARDED_HOST', not DEBUG)
SESSION_COOKIE_SECURE = get_bool_env('SESSION_COOKIE_SECURE', not DEBUG)
CSRF_COOKIE_SECURE = get_bool_env('CSRF_COOKIE_SECURE', not DEBUG)
SECURE_SSL_REDIRECT = get_bool_env('SECURE_SSL_REDIRECT', not DEBUG)
SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000' if not DEBUG else '0'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = get_bool_env('SECURE_HSTS_INCLUDE_SUBDOMAINS', not DEBUG)
SECURE_HSTS_PRELOAD = get_bool_env('SECURE_HSTS_PRELOAD', not DEBUG)

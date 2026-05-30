#!/bin/sh
set -e

python manage.py migrate --noinput

# Run seeding only when there are few or no items to avoid duplicates in production.
# This uses Django's management shell to inspect item count and call the seeder.
python manage.py shell <<'PY'
from apps.items.models import ClothingItem
from django.core.management import call_command
count = ClothingItem.objects.count()
if count < 15:
    print(f'Seeding demo items (current count={count})')
    call_command('seed_clothing_items')
else:
    print(f'Skipping seeding; items count={count}')
PY

python manage.py collectstatic --noinput

if [ "$#" -eq 0 ]; then
  exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000
else
  exec "$@"
fi

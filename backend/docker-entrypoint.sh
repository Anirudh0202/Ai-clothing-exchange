#!/bin/sh
set -e

python manage.py migrate --noinput

# The seed command is idempotent and also repairs demo image records that
# previously pointed at non-persistent local media files.
python manage.py seed_clothing_items

python manage.py collectstatic --noinput

if [ "$#" -eq 0 ]; then
  exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000
else
  exec "$@"
fi

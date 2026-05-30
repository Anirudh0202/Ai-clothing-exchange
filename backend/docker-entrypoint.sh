#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "$#" -eq 0 ]; then
  exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000
else
  exec "$@"
fi

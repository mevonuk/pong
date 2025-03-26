#!/bin/bash
cleanup() {
	echo "Cleaning up..."
	exit 0
}
trap cleanup SIGINT SIGTERM

export PYTHONPATH=${PYTHONPATH}:/project

# collect static files
python3.11 /project/manage.py collectstatic --noinput

# copy static files to web directory
cp -r /project/staticfiles/static/* /var/www/html/static/

# run migrations and makemigrations
python3.11 /project/manage.py makemigrations
python3.11 /project/manage.py migrate

# create superuser using info from .env file
python3.11 /project/manage.py createsuperuser --noinput --username ${DJANGO_SUPERUSER_USERNAME} --email ${DJANGO_SUPERUSER_EMAIL}

# load data into the database using data from fixture - included for testing
python3.11 /project/manage.py loaddata user
python3.11 /project/manage.py loaddata pong_history
python3.11 /project/manage.py loaddata online_status

# for dev(socket not supported)
# python3.11 /project/manage.py runserver 0.0.0.0:8000 &
# for prod(socket support)
daphne backend_project.asgi:application -b 0.0.0.0 -p 8000 &

# run application
DJANGO_PID=$!

wait ${DJANGO_PID}

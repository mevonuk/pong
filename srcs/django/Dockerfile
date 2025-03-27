FROM debian:11

# install dependancies
RUN apt update && apt install -y \
	tar gzip build-essential \
	zlib1g-dev \
	libncurses5-dev \
	libgdbm-dev \
	libnss3-dev \
	libssl-dev \
	libreadline-dev \
	libffi-dev \
	libsqlite3-dev \
	wget \
	libbz2-dev \
	python3 \
	gettext \
	&& apt clean && rm -rf /var/lib/apt/lists/*

# Python installation
RUN wget https://www.python.org/ftp/python/3.11.1/Python-3.11.1.tgz
RUN tar -xvf Python-3.11.1.tgz
RUN cd Python-3.11.1 && ./configure --enable-optimizations && make -j 2 && make altinstall

#install pip for Python3.11
RUN wget https://bootstrap.pypa.io/get-pip.py && python3.11 get-pip.py

# Install Django and Python Dependencies
RUN pip3.11 install django && pip install python-decouple

# Create Django Project and Apps
RUN mkdir project
RUN django-admin startproject backend_project project
RUN cd /project && python3.11 manage.py startapp local_multi_game_app \
	&& python3.11 manage.py startapp local_normal_name_app \
	&& python3.11 manage.py startapp local_tournement_app \
	&& python3.11 manage.py startapp local_ai_game_app \
	&& python3.11 manage.py startapp user_management_app \
	&& python3.11 manage.py startapp pong_history_app \
	&& python3.11 manage.py startapp remote_normal_game_app \
	&& python3.11 manage.py startapp online_status_app

# Expose port 8000 for the Django development server
EXPOSE 8000

RUN apt update && apt install -y postgresql-client

# Install Additional Python Packages
RUN pip install psycopg[binary] channels[daphne] Pillow pyjwt django-channels-jwt-auth-middleware

# Environment Variable for Django Settings
ENV DJANGO_SETTINGS_MODULE=backend_project.settings

# Copy Project Files
COPY ./backend_project /project/backend_project/
COPY ./application/local_multi_game_app /project/local_multi_game_app/
COPY ./application/local_normal_game_app /project/local_normal_game_app/
COPY ./application/local_ai_game_app /project/local_ai_game_app/
COPY ./application/local_tournement_app /project/local_tournement_app/
COPY ./application/pong_history_app /project/pong_history_app/
COPY ./application/user_management_app /project/user_management_app/
COPY ./application/remote_normal_game_app/* /project/remote_normal_game_app/
COPY ./application/online_status_app /project/online_status_app/

# Set up Shell Script
COPY /tools/setups_backend.sh /setups_backend.sh
RUN chmod +x /setups_backend.sh

# Run setup script
ENTRYPOINT [ "/setups_backend.sh" ]

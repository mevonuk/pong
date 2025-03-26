FROM debian:11

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

RUN wget https://www.python.org/ftp/python/3.11.1/Python-3.11.1.tgz

RUN tar -xvf Python-3.11.1.tgz

#install Python 3.11
RUN cd Python-3.11.1 && ./configure --enable-optimizations && make -j 2 && make altinstall

#install pip for Python3.11
RUN wget https://bootstrap.pypa.io/get-pip.py && python3.11 get-pip.py

RUN pip3.11 install django && pip install python-decouple

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

EXPOSE 8000

RUN apt update && apt install -y postgresql-client
RUN pip install psycopg[binary] channels[daphne] Pillow pyjwt django-channels-jwt-auth-middleware

ENV DJANGO_SETTINGS_MODULE=backend_project.settings

#config des urls
COPY ./backend_project /project/backend_project/
COPY ./application/local_multi_game_app /project/local_multi_game_app/
COPY ./application/local_normal_game_app /project/local_normal_game_app/
COPY ./application/local_ai_game_app /project/local_ai_game_app/
COPY ./application/local_tournement_app /project/local_tournement_app/
COPY ./application/pong_history_app /project/pong_history_app/
COPY ./application/user_management_app /project/user_management_app/
COPY ./application/remote_normal_game_app/* /project/remote_normal_game_app/
COPY ./application/online_status_app /project/online_status_app/
COPY /tools/setups_backend.sh /setups_backend.sh
RUN chmod +x /setups_backend.sh

# fichiers de traduction des langues


ENTRYPOINT [ "/setups_backend.sh" ]

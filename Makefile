DC = docker-compose.yml

all: clean creat_v build up 
	make logs c=django

network:
	@echo 'up'
	@docker compose -f $(DC) up -d $(c)

creat_v:
	@echo 'making directories'
	@sudo mkdir -p /home/user/ecole42/transcendence/data/django_volume
	@sudo mkdir -p /home/user/ecole42/transcendence/data/frontend_volume
	@sudo chown -R $(USER) /home/user/ecole42/transcendence/data
	@sudo chmod -R 755 /home/user/ecole42/transcendence/data/django_volume
	@sudo chmod -R 755 /home/user/ecole42/transcendence/data/frontend_volume

build:
	@echo 'building'
	@docker compose -f $(DC) build $(c)

up: network
	@echo 'up'
	@docker compose -f $(DC) up -d $(c)

start:
	@echo 'start'
	@docker compose -f $(DC) start $(c)

down:
	@echo 'down'
	@docker compose -f $(DC) down $(c)

destroy:
	@clear
	@echo 'destroy - down'
	@docker compose -f $(DC) down -v $(c)

stop:
	@echo 'stop'
	@docker compose -f $(DC) stop $(c)

restart:
	@echo 'stop - up'
	@docker compose -f $(DC) stop $(c)
	@docker compose -f $(DC) up -d $(c)

logs:
	@echo 'logs'
	@docker compose -f $(DC) logs --tail=100 -f $(c)

ps:
	@echo 'ps'
	@docker compose -f $(DC) ps

login:
	@echo 'exec'
	@docker compose -f $(DC) exec $(c) /bin/bash

clean: destroy
	@echo 'removing volumes'
	@sudo rm -rf /home/user/ecole42/transcendence/data/django_volume
	@sudo rm -rf /home/user/ecole42/transcendence/data/frontend_volume

prune:
	@echo 'prune unused docker stuff to clear memory'
	@sudo docker system prune --volumes -af

help:
	@echo    "build  : Services are built once and then tagged, by default as project-service."
	@echo    "up     : Builds, (re)creates, starts, and attaches to containers for a service."
	@echo    "start  : Starts existing containers for a service."
	@echo    "down   : Stops containers and removes containers, networks, volumes, and images created by up."
	@echo    "destroy: Remove named volumes declared in the "volumes" section of the Compose file and anonymous volumes attached to containers."
	@echo    "stop   : Stops running containers without removing them. They can be started again with docker compose start."
	@echo    "restart: Restarts existing containers for a service."
	@echo    "logs   : Displays log output from services."
	@echo    "ps     : Lists containers for a Compose project, with current status and exposed ports."
	@echo    "login  : This is the equivalent of docker exec targeting a Compose service."
	@echo    "prune	 : erase unused docker stuff (container, image, etc) to clear memory"

.PHONY: prune help build up start down destroy stop restart logs logs-api ps login-timescale login-api db-shell

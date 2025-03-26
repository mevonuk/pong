FROM debian:11

#install nginx
RUN apt update && apt install curl nginx -y \
		&& apt clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -newkey rsa:2048 \
	-keyout /etc/nginx/ssl/transcendence.key \
	-out /etc/nginx/ssl/transcendence.crt \
	-subj "/C=FR/ST=Ile-de-France/L=Paris/O=42/OU=42/CN=mmahfoud.42.fr/UID=mmahfoud"

COPY  ./conf/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /run/nginx

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]

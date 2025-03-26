FROM debian:11

#install nginx
RUN apt update && apt install curl nginx -y \
		&& apt clean && rm -rf /var/lib/apt/lists/*

# create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate Self-Signed SSL Certificate
# not recommended for production :)
RUN openssl req -x509 -nodes -newkey rsa:2048 \
	-keyout /etc/nginx/ssl/transcendence.key \
	-out /etc/nginx/ssl/transcendence.crt \
	-subj "/C=FR/ST=Ile-de-France/L=Paris/O=42/OU=42/CN=mmahfoud.42.fr/UID=mmahfoud"

#  Copy NGINX Configuration
COPY  ./conf/nginx.conf /etc/nginx/nginx.conf

# Create NGINX Runtime Directory
RUN mkdir -p /run/nginx

# Expose Port 443
EXPOSE 443

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]

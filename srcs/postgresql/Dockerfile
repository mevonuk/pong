# Use a Debian-based image
FROM debian:11

# Install prerequisites
RUN apt-get update && apt-get install -y \
	wget \
	gnupg2 \
	lsb-release

# Add PostgreSQL repository
RUN wget -qO - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
	echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Install PostgreSQL
RUN apt-get update && apt-get install -y \
	postgresql-17 \
	postgresql-contrib-17 && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/*

# Create symbolic link for postgres command
RUN ln -s /usr/lib/postgresql/17/bin/postgres /usr/local/bin/postgres

# Create temporary directory and set permissions
RUN mkdir -p /tmp/postgres && \
	chown postgres:postgres /tmp/postgres

# Copy configuration files to temporary location
COPY ./conf/postgresql.conf /tmp/postgres/
COPY ./conf/pg_hba.conf /tmp/postgres/
RUN chown -R postgres:postgres /tmp/postgres

COPY ./tools/setup_postgres.sh /setup_postgres.sh
RUN chmod +x /setup_postgres.sh

# Switch to postgres user
USER postgres

# Initialize database with clean directory
RUN rm -rf /var/lib/postgresql/data/* && \
	/usr/lib/postgresql/17/bin/initdb -D /var/lib/postgresql/data \
	--encoding=UTF8 \
	--locale=C.UTF-8 && \
	mv /tmp/postgres/postgresql.conf /var/lib/postgresql/data/ && \
	mv /tmp/postgres/pg_hba.conf /var/lib/postgresql/data/ && \
	chmod 600 /var/lib/postgresql/data/pg_hba.conf

EXPOSE 5432

ENTRYPOINT [ "/setup_postgres.sh" ]

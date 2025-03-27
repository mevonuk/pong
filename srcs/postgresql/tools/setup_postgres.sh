#!/bin/bash

cleanup() {
	echo "Cleaning up..."
	kill ${POSTGRES_PID}
	exit 0
}

trap cleanup SIGINT SIGTERM

# Setting Permissions
chown -R postgres:postgres /var/lib/postgresql/data
chmod 0700 /var/lib/postgresql/data
chmod 0700 /var/lib/postgresql/data/*

# Start PostgreSQL
/usr/lib/postgresql/17/bin/postgres -D /var/lib/postgresql/data &
POSTGRES_PID=$!

# Wait for PostgreSQL to Start
until pg_isready -h localhost -p 5432; do
	echo "Waiting for PostgreSQL to start..."
	sleep 1
done

# Create Database and User
psql -U postgres <<EOF
	CREATE DATABASE ${POSTGRES_DB};

	CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';
	ALTER USER ${POSTGRES_USER} WITH LOGIN;

	GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
	\c ${POSTGRES_DB}
	GRANT ALL ON SCHEMA public TO ${POSTGRES_USER};
	GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${POSTGRES_USER};
	GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${POSTGRES_USER};
EOF

echo "PostgreSQL setup completed"

# Wait for PostgreSQL to Finish
wait ${POSTGRES_PID}

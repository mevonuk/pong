FROM debian:11

# Copy Templates and Static Files
COPY ./templates/ /tmp/templates/
COPY ./static/ /tmp/static/

# Copy entrypoint script
COPY ./entrypoint.sh /entrypoint.sh

# Set permissions for script
RUN chmod +x /entrypoint.sh

# set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

FROM debian:11

COPY ./templates/ /tmp/templates/
COPY ./static/ /tmp/static/
COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

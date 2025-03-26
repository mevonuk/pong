#!/bin/bash

# Copy files after volume mount
mkdir -p /var/www/html/static/

cp -r /tmp/templates/* /var/www/html/
cp -r /tmp/static/* /var/www/html/static/

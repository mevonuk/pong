#!/bin/bash

# Copy files after volume mount
mkdir -p /var/www/html/static/

# Copy files into appropriate directories
cp -r /tmp/templates/* /var/www/html/
cp -r /tmp/static/* /var/www/html/static/

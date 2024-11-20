#!/bin/bash
# 启动 nginx
nginx -g "daemon off;" -c /etc/nginx/nginx.conf &
# 启动 gunicorn
gunicorn app:api -b 0.0.0.0:8000 --timeout 600 --workers 4

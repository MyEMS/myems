FROM nginx:1.21.1

# remove the config
RUN rm /etc/nginx/conf.d/default.conf && \
    rm /etc/nginx/nginx.conf && \
    mkdir -p /var/www/html/admin

# copy the config and web codes
COPY nginx.conf /etc/nginx/
COPY . /var/www/html/admin
EXPOSE 8001
CMD ["nginx", "-c /etc/nginx/nginx.conf", "-g 'daemon off;'"]
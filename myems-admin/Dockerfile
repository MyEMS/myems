FROM nginx:latest

RUN apt update && apt install -y nano telnet

# remove the default config
RUN rm /etc/nginx/conf.d/default.conf && \
    rm /etc/nginx/nginx.conf

# create new root folder
RUN mkdir -p /var/www/myems-admin

# copy the config and web codes
COPY nginx.conf /etc/nginx/
COPY . /var/www/myems-admin
EXPOSE 8001
CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
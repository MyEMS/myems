FROM nginx

# remove the config
RUN rm /etc/nginx/conf.d/default.conf && \
    rm /etc/nginx/nginx.conf && \
    mkdir -p /usr/share/nginx/admin

# copy the config and web codes
COPY nginx.conf /etc/nginx/
COPY . /usr/share/nginx/admin
CMD ['nginx', '-c /etc/nginx/nginx.conf', '-g "daemon off;"']
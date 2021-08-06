FROM nginx

# remove the config
RUN rm /etc/nginx/conf.d/default.conf && \
    rm /etc/nginx/nginx.conf && \
    mkdir -p /var/www/html/web

# Note: You should run 'npm run build' in the web direction to generate the production build.
COPY nginx.conf /etc/nginx/
COPY ./build/ /var/www/html/web
EXPOSE 80
CMD ['nginx', '-c /etc/nginx/nginx.conf', '-g "daemon off;"']
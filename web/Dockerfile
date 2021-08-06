FROM nginx

# remove the config
RUN rm /etc/nginx/conf.d/default.conf && \
    rm /etc/nginx/nginx.conf && \
    mkdir -p /usr/share/nginx/web

# copy the config and web codes
# Attention:
# You should run 'npm run build' in the web direction to generate the build direction because this's a react projection.
COPY nginx.conf /etc/nginx/
COPY ./build/ /usr/share/nginx/web
EXPOSE 80
CMD ['nginx', '-c /etc/nginx/nginx.conf', '-g "daemon off;"']
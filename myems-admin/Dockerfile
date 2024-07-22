# 由于运营商网络问题，可能会导致您拉取镜像变慢，使用镜像加速服务
# 阿里云控制台: 容器镜像服务 / 镜像工具 / 镜像加速器

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
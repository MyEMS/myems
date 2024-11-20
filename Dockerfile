FROM python:3.10-slim

RUN apt-get update && apt-get install -y nano telnet && mkdir -p /var/www/myems-admin/upload && mkdir -p /var/www/myems-web && apt-get install -y nginx
WORKDIR /app
COPY . /app

RUN pip install --no-cache-dir -r ./myems-api/requirements.txt &&  pip install --no-cache-dir -r ./myems-aggregation/requirements.txt && pip install --no-cache-dir -r ./myems-cleaning/requirements.txt &&  pip install --no-cache-dir -r ./myems-modbus-tcp/requirements.txt && pip install --no-cache-dir -r ./myems-normalization/requirements.txt

RUN mv ./myems-admin/nginx.conf /etc/nginx/ && mv ./myems-admin/*   /var/www/myems-admin/ && mv ./myems-web/ /var/www
WORKDIR /var/www/myems-web
COPY ./myems-web/build/ .
WORKDIR /app
EXPOSE 8000 8001 80
COPY ./myems-api/ .
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

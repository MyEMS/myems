FROM python:3.10-slim

# RUN apt update && apt install -y nano telnet

# todo: share upload folder with admin container on Docker

RUN mkdir -p /var/www/myems-admin/upload

WORKDIR /app
COPY . /app

# the default command below maybe slow at sometime
RUN pip install --no-cache-dir -r requirements.txt

# use PyPI mirror if above command is slow
# RUN pip install --no-cache-dir -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com

EXPOSE 8000
CMD ["gunicorn", "app:api", "-b", "0.0.0.0:8000", "--timeout", "600", "--workers=4"]
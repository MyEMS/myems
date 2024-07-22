# 由于运营商网络问题，可能会导致您拉取镜像变慢，使用镜像加速服务
# 阿里云控制台: 容器镜像服务 / 镜像工具 / 镜像加速器

FROM python:slim

RUN apt update && apt install -y nano telnet

WORKDIR /app
COPY . /app

# the default command below maybe slow at sometime
RUN pip install --no-cache-dir -r requirements.txt

# use mirror if above command is slow
# RUN pip install --no-cache-dir -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com

CMD ["python", "main.py"]
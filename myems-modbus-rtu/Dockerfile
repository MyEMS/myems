FROM python:3.11-slim

RUN apt update && apt install -y nano

WORKDIR /app
COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

# use mirror if above command is slow
# RUN pip install --no-cache-dir -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com

CMD ["python", "main.py"]

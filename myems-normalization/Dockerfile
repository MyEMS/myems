FROM python:slim

RUN apt update && apt install -y nano telnet

WORKDIR /code
COPY . /code

# the default command below maybe slow at sometime
# RUN pip install -r requirements.txt

# use mirror if above command is slow
RUN pip install -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com

CMD ["python", "main.py"]
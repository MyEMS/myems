FROM python:3.9.6
WORKDIR /code

COPY . /code
RUN pip install -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/
CMD ['python', 'main.py']
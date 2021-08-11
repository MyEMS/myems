FROM python:3.9.6
WORKDIR /code

COPY . /code
RUN pip install -r requirements.txt
EXPOSE 8000
CMD ['gunicorn', 'app:api', '-b 0.0.0.0:8000']
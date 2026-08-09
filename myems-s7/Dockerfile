FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update & apt install -y software-properties-common python3-pip
RUN add-apt-repository ppa:gijzelaar/snap7
RUN apt update & apt install -y libsnap7-dev libsnap7-1

# RUN apt update && apt install -y nano telnet

WORKDIR /app
COPY . /app

# the default command below maybe slow at sometime
RUN pip install --no-cache-dir -r requirements.txt

# use mirror if above command is slow
# RUN pip install --no-cache-dir -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com

CMD ["python", "main.py"]
FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y software-properties-common python3 python3-pip python-is-python3
RUN add-apt-repository -y ppa:gijzelaar/snap7
RUN apt update && apt install -y libsnap7-dev libsnap7-1 \
    && rm -rf /var/lib/apt/lists/*

# RUN apt update && apt install -y nano telnet

WORKDIR /app
COPY . /app

# Ubuntu 24.04 marks the system Python as externally managed (PEP 668).
# the default command below maybe slow at sometime
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# use mirror if above command is slow
# RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com

CMD ["python", "main.py"]

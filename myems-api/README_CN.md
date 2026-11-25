# MyEMS API 服务

## 简介

为 [MyEMS](https://github.com/MyEMS/myems) 组件及第三方应用提供的 RESTful API 服务。

## 开发环境快速运行

在 Linux 上快速运行（不适用于生产环境）：
```bash
cd myems/myems-api
pip install -r requirements.txt
cp example.env .env
sudo chmod +x run.sh
./run.sh
```

在 Windows 上运行：

安装 Python

在命令提示符中查找 Python 路径：
```bash
where python
```
假设结果为 'C:\Users\johnson\AppData\Local\Programs\Python\Python311\python.exe'

使用 waitress 安装并运行：
```bash
pip install waitress
cd myems\myems-api
waitress-serve --listen=0.0.0.0:8000 app:api
```


## 安装

### 安装方式 1：使用 Docker 安装 myems-api

详见 [myems.cn](https://myems.cn/docs/installation/docker-linux#step-2-myems-api)

### 方式 2：在有网络的 Ubuntu Server 上在线安装 myems-api

详见 [myems.cn](https://myems.cn/docs/installation/debian-ubuntu#step-2-myems-api)


## API 列表

请参阅 [API List](https://myems.cn/docs/tutorial/api)

## 参考资料

[1]. http://myems.cn

[2]. https://falconframework.org/

[3]. https://github.com/yohanboniface/falcon-multipart

[4]. http://gunicorn.org

[5]. https://github.com/henriquebastos/python-decouple/

[6]. https://foss.heptapod.net/openpyxl/openpyxl

[7]. https://foss.heptapod.net/openpyxl/et_xmlfile/

[8]. https://docs.pylonsproject.org/projects/waitress/en/latest/

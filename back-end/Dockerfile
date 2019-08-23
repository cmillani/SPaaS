FROM python:3.5.6-jessie

WORKDIR /app
COPY . /app

RUN pip3 install -r requirements.txt

ENTRYPOINT ["python3", "main.py"] 
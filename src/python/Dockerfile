FROM anapsix/alpine-java:8_server-jre

RUN apk update && apk upgrade
RUN apk add python3

RUN apk add --virtual .exasol curl tar perl \
    && cd /usr/local \
    && curl -l https://www.exasol.com/support/secure/attachment/55207/EXASOL_JDBC-6.0.4.tar.gz  | tar zxf - \
    && apk del .exasol

ENV EXAJLOAD_BIN=/usr/local/EXASOL_JDBC-6.0.4/exajload
ENV PATH=$PATH:/usr/local/EXASOL_JDBC-6.0.4

RUN mkdir /app
WORKDIR /app

ADD ./requirements.txt .
RUN apk add --virtual .build g++ python3-dev \
    && pip3 install -r requirements.txt \
    && apk del .build

ADD ./ .

ARG settings="settings"
ENV SETTINGS=$settings

EXPOSE 50020

CMD ["python3", "server.py"]

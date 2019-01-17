FROM alpine:3.8
RUN apk add yarn python3 python3-dev musl-dev linux-headers gcc && pip3 install --upgrade pip
RUN mkdir /app
ADD ui /app/ui
ADD backend /app/backend
RUN cd /app/backend && pip3 install -r requirements.txt
RUN cd /app/ui && yarn install && yarn build && rm -rf node_modules
ADD run.sh /app/run.sh
EXPOSE 5000
CMD ["sh", "/app/run.sh"] 

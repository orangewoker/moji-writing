FROM python:3.12-slim

WORKDIR /app

ENV NODE_ENV=production \
    MOJI_DATA_DIR=/data \
    PORT=8080

COPY index.html styles.css app.js auth.js web-storage.js server.py VERSION ./
COPY assets ./assets

RUN mkdir -p /data

EXPOSE 8080
VOLUME ["/data"]

CMD ["python", "server.py"]

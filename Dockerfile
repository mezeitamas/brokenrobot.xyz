FROM nginx
LABEL maintainer="Tamas Mezei <tamas.mezei@brokenrobot.xyz>"

COPY ./public /website
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

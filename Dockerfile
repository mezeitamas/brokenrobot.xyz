FROM nginxinc/nginx-unprivileged:1.25.1-alpine

COPY ./public /brokenrobot.xyz
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

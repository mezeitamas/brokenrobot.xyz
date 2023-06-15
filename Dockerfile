FROM nginxinc/nginx-unprivileged:stable

COPY ./public /brokenrobot.xyz
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

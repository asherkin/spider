FROM nginx:latest

ADD nginx.conf /etc/nginx.conf

ADD build /usr/local/nginx/html

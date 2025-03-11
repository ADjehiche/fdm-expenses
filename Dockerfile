

# setup to use Ubuntu
FROM ubuntu:20.04


RUN echo "hello world2"

# install dependencies
RUN apt-get update && apt-get install nginx -y


# copy files to nginx website location
COPY . /var/www/

# copy nginx config to nginx site directory
COPY nginxServerConfig /etc/nginx/sites-enabled/default


# open port 80 for tcp
EXPOSE 80/tcp

# will run the web server when this command runs
RUN service nginx restart

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]




# setup to use Ubuntu
FROM ubuntu:20.04

# install dependencies
RUN apt-get update && apt-get install nginx -y


# copy files to nginx website location
COPY . /var/www/expenses

# copy nginx config to nginx site directory
COPY expenses /etc/nginx/sites-enabled/default

# open port 80 for tcp
EXPOSE 80/tcp

# will run the web server when this command runs
RUN service nginx restart


CMD ["/var/www/expenses", "-g", "daemon off;"]
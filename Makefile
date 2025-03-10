run:
	sudo docker run -d -p 80:80 expenses

prune:
	sudo docker system prune
	# sudo nginx -s quit

build:
	sudo docker build . -f Dockerfile -t expenses
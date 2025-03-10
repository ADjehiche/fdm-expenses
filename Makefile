run:
	sudo docker container run --name expenseClaimsContainer -d -p  80:80 expenses

prune:
	sudo docker system prune
	# sudo nginx -s quit

build:
	sudo docker buildx build . -f Dockerfile -t expenses

stop:
	sudo docker container stop expenseClaimsContainer

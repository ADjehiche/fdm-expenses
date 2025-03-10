run:
	sudo docker container run --name expense_app -d -p  80:80 

prune:
	sudo docker system prune
	# sudo nginx -s quit

build:
	sudo docker build . -f Dockerfile -t expenses

kill:
	docker kill expense_app

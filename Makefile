run:
	sudo docker run --name expense_app -d -p  80:80 expenses 

prune:
	sudo docker system prune
	# sudo nginx -s quit

build:
	sudo docker build . -f Dockerfile -t expenses

kill:
	docker rm expense_app
	docker kill expense_app

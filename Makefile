run:
	sudo docker run -d --name expense_app -p 80:80 expenses

prune:
	sudo docker system prune
	# sudo nginx -s quit

build:
	sudo docker build . -f Dockerfile -t expenses

kill:
	docker kill expense_app
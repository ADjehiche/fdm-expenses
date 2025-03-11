run:
	sudo docker run --name expense_app -d -p  80:80 expenses 

prune:
	sudo docker system prune
	# sudo nginx -s quit

build:
	sudo docker build . -f Dockerfile -t expenses

kill:
	docker kill expense_app
	docker rm expense_app

kbr:
	make kill
	make build
	make run

br:
	make build
	make run

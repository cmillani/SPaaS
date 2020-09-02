imagesFolder: 
	mkdir -p images

buildProd:
	@echo "Be sure to set environment variables accordingly"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

startProd:
	@echo "Be sure to set environment variables accordingly"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

loadImages:
	docker load -i ./images/spaas_frontend.tar
	docker load -i ./images/spaas_authserver.tar
	docker load -i ./images/spaas_worker.tar
	docker load -i ./images/spaas_backend.tar

images: imagesFolder
	docker save -o ./images/spaas_frontend.tar spaas_frontend:latest
	docker save -o ./images/spaas_authserver.tar spaas_authserver:latest
	docker save -o ./images/spaas_worker.tar spaas_worker:latest
	docker save -o ./images/spaas_backend.tar spaas_backend:latest

localKeys:
	sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./front-end/local.key -out ./front-end/local.crt -config localhost.conf

serverKeys:
	sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./front-end/server.key -out ./front-end/server.crt -config cadumillani.conf

deploy:
	rsync -Cravpe ssh ./ ec2-user@spaas:/home/ec2-user/spaas/

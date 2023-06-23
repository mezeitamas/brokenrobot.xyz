#!/usr/bin/env make

.PHONY: build_website build_container run_container stop_container tag_container push_container

build_website:
	npm run clean && npm run build

build_container: build_website
	docker build -t brokenrobot.xyz .

run_container: build_container
	docker run -p 8080:8080 --read-only --tmpfs /tmp --name brokenrobot.xyz --rm brokenrobot.xyz

stop_container:
	docker stop brokenrobot.xyz

tag_container: build_container
	docker tag brokenrobot.xyz localhost:5000/brokenrobot.xyz

push_container: tag_container
	docker push localhost:5000/brokenrobot.xyz

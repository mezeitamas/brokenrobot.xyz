#!/usr/bin/env make

.PHONY: build_website build_container run_container

build_website:
	npm run clean && npm run build

build_container: build_website
	docker build -t brokenrobot.xyz .

run_container: build_container
	docker run -p 8080:80 -d --name brokenrobot.xyz --rm brokenrobot.xyz

stop_container:
	docker stop brokenrobot.xyz

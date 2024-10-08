include application/.env
sail := application/vendor/bin/sail

$(eval export $(shell sed -ne 's/ *#.*$$//; /./ s/=.*$$// p' application/.env))

.PHONY: init
init:
	docker run --rm --interactive --tty \
          --volume ${PWD}/application:/app \
          composer install --ignore-platform-reqs

	sudo chown -R $(id -u -n):$(id -g -n) ${PWD}/application/vendor
	cp application/.env.example application/.env

	make up
	sleep 20
	make -j2 backend-install frontend-install
	$(sail) artisan key:generate
	make migrate


.PHONY: backend-install
backend-install:
	docker run --rm --interactive --tty \
              --volume ${PWD}/application:/app \
              composer install --ignore-platform-reqs

.PHONY: frontend-install
frontend-install:
	make frontend-clean
	$(sail) yarn install

.PHONY: restart
restart:
	make down
	make up

.PHONY: up
up:
	$(sail) up -d

.PHONY: down
down:
	$(sail) down

.PHONY: status
status:
	docker compose ps

.PHONY: setup-db
setup-db:
	$(sail) artisan migrate:fresh --seed

.PHONY: seed
seed:
	$(sail) artisan db:seed

.PHONY: migrate
migrate:
	$(sail) artisan migrate

.PHONY: watch
watch:
	$(sail) up -d && $(sail) npx vite

.PHONY: vite
vite:
	$(sail) npx vite

.PHONY: build
build:
	$(sail) npx vite build

.PHONY: sh
sh:
	$(sail) shell $(filter-out $@,$(MAKECMDGOALS))

.PHONY: artisan
artisan:
	$(sail) artisan $(filter-out $@,$(MAKECMDGOALS))

.PHONY: test-backend
test-backend:
	$(sail) php ./vendor/bin/pest


.PHONY: frontend-clean
frontend-clean:
	rm -rf application/node_modules 2>/dev/null || true
	$(sail) yarn cache clean

.PHONY: rm
rm:
	$(sail) down -v

.PHONY: logs
logs:
	docker logs --follow catalystexplore.com

.PHONY: image-build
image-build:
	docker build \
	--build-arg=WWWGROUP=1000 \
	--build-arg=WWWUSER=$UID \
	--build-arg=GITHUB_PACKAGE_REGISTRY_TOKEN=${GITHUB_PACKAGE_REGISTRY_TOKEN} \
	-f ./docker/Dockerfile.dev \
	-t catalystexplorer \
	application/.

include ./application/.env
export

sail := ./application/vendor/bin/sail
compose := docker-compose exec -T catalystexplorer.com
nodeVersion := 20

.PHONY: init
init:
	cp application/.env.example application/.env

	docker run --rm --interactive --tty \
		--volume ${PWD}:/app \
		--workdir /app \
		--user root \
		node:18-alpine yarn install --ignore-engine

	docker run --rm --interactive --tty \
		--volume ${PWD}:/app \
		--workdir /app \
		--user root \
		node:${nodeVersion}-alpine yarn install --ignore-engine

	docker run --rm --interactive --tty \
		--volume ${PWD}:/app \
		--workdir /app \
		--user root \
		node:${nodeVersion}-alpine yarn install --ignore-engine

	docker run --rm --interactive --tty \
		--volume ${PWD}/application:/app \
		--workdir /app \
		--user root \
		node:${nodeVersion}-alpine yarn install --ignore-engine


	docker run --rm --interactive --tty \
          --volume ${PWD}/application:/app \
          composer install --ignore-platform-reqs

	sudo chown -R $(id -u -n):$(id -g -n) ${PWD}/application/vendor
 
	make up
	sleep 10
	$(compose) artisan key:generate
	make migrate
	$(compose) yarn husky init

.PHONY: artisan
artisan:
	$(compose) artisan $(filter-out $@,$(MAKECMDGOALS))

.PHONY: backend-install
backend-install:
	docker run --rm --interactive --tty \
              --volume ${PWD}/application:/app \
              composer install --ignore-platform-reqs

.PHONY: build
build:
	$(compose) yarn build

.PHONY: tsc
tsc:
	$(compose) yarn tsc

.PHONY: db-setup
db-setup:
	$(sail) artisan migrate:fresh --seed

.PHONY: db-seed
db-seed:
	$(sail) artisan db:seed

.PHONY: down
down:
	$(sail) down

.PHONY: devtools-install
devtools-install:
	docker run --rm --interactive --tty \
		--volume ${PWD}:/app \
		--workdir /app \
		--user root \
		node:${nodeVersion}-alpine yarn install --ignore-engine
		$(sail) up -d
		npx husky init

.PHONY: frontend-install
frontend-install:
	make frontend-clean
	docker run --rm --interactive --tty \
		--volume ${PWD}/application:/app \
		--workdir /app \
		--user root \
		node:${nodeVersion}-alpine yarn install --ignore-engine

.PHONY: frontend-clean
frontend-clean:
	rm -rf application/node_modules 2>/dev/null || true

.PHONY: image-build
image-build:
	docker build \
	--build-arg=WWWGROUP=1000 \
	--build-arg=WWWUSER=1000 \
	--build-arg=GITHUB_PACKAGE_REGISTRY_TOKEN=${GITHUB_PACKAGE_REGISTRY_TOKEN} \
	-f ./docker/Dockerfile.dev \
	-t catalystexplorer \
	./docker/.

.PHONY: logs
lint-backend:
	$(sail) pint

.PHONY: logs
lint-frontend:
	$(sail) yarn lint

.PHONY: logs
logs:
	docker logs --follow catalystexplore.com

.PHONY: migrate
migrate:
	$(sail) php artisan migrate

.PHONY: restart
restart:
	make down
	make up

.PHONY: rm
rm:
	$(sail) down -v

.PHONY: sh
sh:
	$(sail) shell $(filter-out $@,$(MAKECMDGOALS))

.PHONY: commitlint
commitlint:
	npx --no -- commitlint --edit $1

.PHONY: status
status:
	docker compose ps

.PHONY: up
up:
	$(sail) up -d --remove-orphans

.PHONY: vite
vite:
	$(sail) npx vite

.PHONY: watch
watch:
	docker compose  up -d --remove-orphans && $(sail) npx vite --force

.PHONY: test-backend
test-backend:
	docker-compose -f docker-compose.testing.yml up -d && \
    sleep 3 && \
	docker-compose -f docker-compose.testing.yml exec catalystexplorer.com vendor/bin/pest --group=arch && \
	sleep 3 && \
 	docker-compose -f docker-compose.testing.yml down --volumes

.PHONY: cypress-install
cypress-install:
	docker compose run --rm catalystexplorer.cypress.headless install

.PHONY: cypress-run
cypress-run:
	docker compose run --rm catalystexplorer.cypress.headless run --project /app

.PHONY: test-e2e
test-e2e:
	make watch & \
	sleep 10 && \
	make cypress-run

.PHONY: cypress-open-linux
cypress-open-linux:
	docker compose run --rm \
		-e DISPLAY=${DISPLAY} \
		-v /tmp/.X11-unix:/tmp/.X11-unix \
		catalystexplorer.cypress.gui open --project /app

.PHONY: cypress-open-mac
cypress-open-mac:
	@echo "📱 Starting Cypress with Electron..."
	cd application && ELECTRON_NO_ATTACH_CONSOLE=true yarn cypress open

.PHONY: cypress-open-windows
cypress-open-windows:
	docker compose run --rm catalystexplorer.cypress.gui open --project /app --browser chrome

.PHONY: cypress-clean
cypress-clean:
	@echo "🧹 Cleaning Cypress cache..."
	rm -rf application/cypress/videos
	rm -rf application/cypress/screenshots
	rm -rf application/cypress/downloads
	@echo "✨ Cypress cache cleaned"
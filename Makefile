include ./application/.env
export

sail := ./application/vendor/bin/sail
compose := docker-compose exec -T catalystexplorer.com
nodeVersion := 20

.PHONY: init
init:
	cp ./application/.env.example ./application/.env
	chmod +x ./scripts/clone-carp.sh
	chmod +x ./scripts/remove-carp.sh

	docker run --rm --interactive --tty \
		--volume ${PWD}:/app \
		--workdir /app \
		--user root \
		node:20-alpine yarn install --ignore-engine

	docker run --rm --interactive --tty \
		--volume ${PWD}/application:/app \
		--workdir /app \
		--user root \
		node:${nodeVersion}-alpine yarn install --ignore-engine


	docker run --rm --interactive --tty \
          --volume ${PWD}/application:/app \
          composer install --ignore-platform-reqs

	sudo chown -R $(id -u -n):$(id -g -n) ${PWD}/application/vendor
	./scripts/clone-carp.sh
	chmod +x ./carp/scripts/entrypoint.sh
	make up
	sleep 10
	$(compose) php artisan key:generate
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
	$(compose)  npx tsc

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
	make up
	npx husky init
	echo 'npx --no -- commitlint --edit $$1' > .husky/commit-msg
	chmod +x .husky/_/commit-msg
	printf 'make lint-backend\ngit add -A\nmake tsc\nmake test-backend' > .husky/pre-commit
	chmod +x .husky/pre-commit

.PHONY: frontend-install
frontend-install:
	make frontend-clean
	docker run --rm --interactive --tty \
		--volume ${PWD}/application:/app \
		--workdir /app \
		--user root \
		node:${nodeVersion}-alpine yarn install --ignore-engine --unsafe-perm=true

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
	$(sail) pint app

.PHONY: logs
lint-frontend:
	$(sail) yarn lint

.PHONY: logs
logs:
	docker logs --follow catalystexplorer.com

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

# .PHONY: commitlint
# commitlint:
# 	npx --no -- commitlint --edit $1

.PHONY: status
status:
	docker compose ps

.PHONY: up
up:
	$(sail) up -d --remove-orphans

.PHONY: vite
vite:
	$(sail) npx vite --force

.PHONY: watch
watch:
	docker compose  up -d --remove-orphans && $(sail) npx vite --force -- --unsafe-perm=true

.PHONY: test-backend
test-backend:
	docker-compose -f docker-compose.testing.yml up -d && \
    sleep 3 && \
	docker-compose -f docker-compose.testing.yml exec -T catalystexplorer_test.com vendor/bin/pest --group=arch && \
	sleep 3 && \
 	docker-compose -f docker-compose.testing.yml down --volumes

.PHONY: test-arch
test-arch:
	make test-backend && \
	make up 

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
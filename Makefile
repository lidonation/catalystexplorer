include ./application/.env
export

sail := ./application/vendor/bin/sail
compose := docker compose exec -T catalystexplorer.com
nodeVersion := 24.3.0
COMPOSE_FLAGS ?=

.PHONY: init
init:
	cp ./application/.env.example ./application/.env
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

		docker run --rm -it \
		-v ${PWD}/application:/app \
		composer bash -c "composer config --global github-protocols https && composer install --ignore-platform-reqs"

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

.PHONY: ts-transform
ts-transform:
	$(sail) artisan typescript:transform

.PHONY: db-schema
db-schema:
	$(sail) node --loader ts-node/esm resources/js/scripts/generateDbSchema.ts

.PHONY: db-forward-preview
db-forward-preview:
	kubect port-forward

	

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
	docker-compose ps

.PHONY: up
up:
	$(sail) up -d --remove-orphans $(COMPOSE_FLAGS)

.PHONY: up-ext
up-ext:
	$(sail) up -d --remove-orphans $(filter-out $@,$(MAKECMDGOALS))

.PHONY: vite
vite:
	@echo "Starting Vite with increased memory limit..."
	$(sail) node --max-old-space-size=4096 ./node_modules/.bin/vite --force

.PHONY: watch
watch:
	docker-compose up -d --remove-orphans $(COMPOSE_FLAGS) && $(sail) npx vite --force -- --unsafe-perm=true

.PHONY: watch-ext
watch-ext:
	docker-compose up -d --remove-orphans $(filter-out $@,$(MAKECMDGOALS)) && $(sail) npx vite --force -- --unsafe-perm=true
.PHONY: test-backend
test-backend:
	docker compose -f docker-compose.testing.yml up -d && \
    sleep 3 && \
	docker compose -f docker-compose.testing.yml exec -T catalystexplorer_test.com vendor/bin/pest --group=arch --parallel && \
	sleep 3 && \
 	docker-compose -f docker-compose.testing.yml down --volumes
.PHONY: test-arch
test-arch:
	make test-backend && \
	make up 

.PHONY: test-e2e
test-e2e:
	@echo "Starting End-to-End Testing Workflow..."
	@echo "Stopping Allure service if running..."
	@docker compose stop catalystexplorer.allure 2>/dev/null || true
	@echo "Cleaning previous test results..."
	@rm -rf ./application/allure-results ./application/allure-report ./application/allure-reports ./application/playwright-report 2>/dev/null || true
	@echo "Creating fresh directories..."
	@mkdir -p ./application/allure-results ./application/allure-reports
	@echo "Starting Allure reporting service..."
	@docker compose up -d catalystexplorer.allure
	@echo "Waiting for Allure service to be ready..."
	@sleep 5
	@echo "Installing Playwright browsers (if not already installed)..."
	@cd ./application && npx playwright install --with-deps
	@echo "Running Playwright E2E tests...
	@cd ./application && \
	if [ -n "$(FILE)" ]; then \
		npx playwright test $(FILE); \
	else \
		npx playwright test; \
	fi; \
	TEST_EXIT_CODE=$$?; \
	echo "Test reports are being generated automatically by Allure service..."; \
	echo "Access your test reports at: http://localhost:5050/allure-docker-service/projects/default/reports/latest/index.html?redirect=false";

.PHONY: test-e2e-stop
test-e2e-stop:
	@echo "Stopping Allure reporting service..."
	@docker compose stop catalystexplorer.allure


.PHONY: image-build-playwright
image-build-playwright:
	docker build \
		-f docker/Dockerfile.playwright \
		-t catalystexplorer-playwright \
		.


.PHONY: seed-index
seed-index:
	$(sail)	artisan db:seed --class=SearchIndexSeeder

.PHONY: create-index import-index flush-index

MODELS = App\\Models\\Voter App\\Models\\BookmarkCollection App\\Models\\ProjectSchedule App\\Models\\Community  App\\Models\\Proposal App\\Models\\CatalystProfile App\\Models\\IdeascaleProfile App\\Models\\Group App\\Models\\Review App\\Models\\MonthlyReport App\\Models\\Transaction App\\Models\\VoterHistory

create-index:
	@model_filter="$(filter-out $@,$(MAKECMDGOALS))"; \
	model_filter="$$(echo $$model_filter | head -n1)"; \
	if [ -z "$$model_filter" ]; then \
		models="$(MODELS)"; \
	else \
		models="$$(echo $(MODELS) | tr ' ' '\n' | grep -i "$$model_filter")"; \
		echo "$$models";\
	fi; \
	for model in $$models; do \
		$(sail) artisan cx:create-search-index "$$model"; \
	done

%:
	@:

import-index:
	@model_filter="$(filter-out $@,$(MAKECMDGOALS))"; \
	model_filter="$$(echo $$model_filter | head -n1)"; \
	if [ -z "$$model_filter" ]; then \
		models="$(MODELS)"; \
	else \
		models="$$(echo $(MODELS) | tr ' ' '\n' | grep -i "$$model_filter")"; \
		echo "$$models";\
	fi; \
	for model in $$models; do \
		$(sail) artisan scout:import "$$model"; \
	done
%:
	@:

flush-index:
	@model_filter="$(filter-out $@,$(MAKECMDGOALS))"; \
	model_filter="$$(echo $$model_filter | head -n1)"; \
	if [ -z "$$model_filter" ]; then \
		models="$(MODELS)"; \
	else \
		models="$$(echo $(MODELS) | tr ' ' '\n' | grep -i "$$model_filter")"; \
		echo "$$models";\
	fi; \
	for model in $$models; do \
		$(sail) artisan scout:flush "$$model"; \
	done
%:
	@:

.PHONY: delete-index

INDEXES = cx_bookmark_collections cx_proposals cx_communities cx_catalyst_profiles cx_ideascale_profiles cx_monthly_reports cx_review cx_groups cx_transactions cx_communities cx_voter_histories

delete-index:
	@index_filter="$(filter-out $@,$(MAKECMDGOALS))"; \
	for index in $(INDEXES); do \
		if [ -z "$$index_filter" ] || echo $$index | grep -i "$$index_filter" > /dev/null; then \
			$(sail) artisan scout:delete-index "$$index"; \
		fi \
	done
%:
	@:
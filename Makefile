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

.PHONY: ts-transform
ts-transform:
	$(sail) artisan typescript:transform

.PHONY: db-schema
db-schema:
	$(sail) node --loader ts-node/esm resources/js/scripts/generateDbSchema.ts

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


.PHONY: seed-index
seed-index:
	$(sail)	artisan db:seed --class=SearchIndexSeeder

.PHONY: create-index import-index flush-index

MODELS = App\\Models\\ProjectSchedule App\\Models\\Community  App\\Models\\Proposal App\\Models\\IdeascaleProfile App\\Models\\Group App\\Models\\Review App\\Models\\MonthlyReport App\\Models\\Transaction App\\Models\\VoterHistory

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

INDEXES = cx_proposals cx_communities cx_ideascale_profiles cx_monthly_reports cx_review cx_groups cx_transactions cx_communities cx_voter_histories

delete-index:
	@index_filter="$(filter-out $@,$(MAKECMDGOALS))"; \
	for index in $(INDEXES); do \
		if [ -z "$$index_filter" ] || echo $$index | grep -i "$$index_filter" > /dev/null; then \
			$(sail) artisan scout:delete-index "$$index"; \
		fi \
	done
%:
	@:
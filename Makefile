.PHONY: help setup code-setup install install-backend install-frontend build dev up down stop \
        logs logs-backend logs-frontend test generate-api shell curl-check \
        frontend-dev frontend-build frontend-install deploy

# Default HTTP port for the backend (override: make up PORT=9090)
PORT ?= 8081
export PORT

## help:                list available commands
help:
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## //'

# ---------------------------------------------------------------------------
# Whole project (Docker Compose)
# ---------------------------------------------------------------------------

## setup:               initial project setup (install dependencies and build images)
setup: install build
	@echo "✓ Project setup complete"
	@echo "  Run 'make up' to start the application"

## code-setup:          setup code environment (for Hexlet CI compatibility)
code-setup:
	docker build -t calendar-slot-code:local -f Dockerfile .

## install:             install backend + frontend dependencies
install: install-backend install-frontend

## install-backend:     install backend PHP dependencies (inside the container)
install-backend:
	docker-compose run --rm backend composer install

## install-frontend:    install frontend npm dependencies (locally)
install-frontend:
	cd frontend && npm install

## build:               build all Docker images (backend + frontend)
build:
	docker-compose build

## dev / up:            start the whole stack in the background
dev: up
up:
	docker-compose up -d

## down:                stop and remove the stack
down:
	docker-compose down

## stop:                stop containers without removing them
stop:
	docker-compose stop

## logs:                follow logs of all services
logs:
	docker-compose logs -f

## logs-backend:        follow backend logs
logs-backend:
	docker-compose logs -f backend

## logs-frontend:       follow frontend logs
logs-frontend:
	docker-compose logs -f frontend

## test:                run the PHPUnit backend test suite (inside the container)
test:
	docker-compose run --rm -e APP_ENV=test backend php vendor/bin/phpunit

## generate-api:        compile TypeSpec -> OpenAPI and sync it into the backend
generate-api:
	npm run generate:api
	cp openapi/schema/openapi.yaml backend/public/openapi.yaml

## shell:               open a shell inside the backend container
shell:
	docker-compose run --rm backend sh

## curl-check:          quick smoke test against the running API
curl-check:
	curl -fsS http://localhost:$(PORT)/api/event-types && echo

# ---------------------------------------------------------------------------
# Frontend (local, without Docker)
# ---------------------------------------------------------------------------

## frontend-install:    install frontend dependencies
frontend-install:
	cd frontend && npm install

## frontend-dev:        run the Vite dev server locally (http://localhost:5173)
frontend-dev:
	cd frontend && npm run dev

## frontend-build:      type-check and build the frontend for production
frontend-build:
	cd frontend && npm run build

# ---------------------------------------------------------------------------
# Deploy
# ---------------------------------------------------------------------------

## deploy:              build images and (re)start the whole stack in the background
deploy: generate-api build up
	@echo "Stack is up. Backend: http://localhost:$(PORT)  Frontend: http://localhost:5173"

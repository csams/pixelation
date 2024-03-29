SHELL := /usr/bin/env bash -e
.DEFAULT_GOAL := build

.PHONY: default
default: build ;

.PHONY: build
build: require-go ## build the thing
	go mod tidy
	go build -o ./bin/pixelate main.go

.PHONY: web
web:
	cd web && npm run build && cd ..

.PHONY: run
run:
	./bin/pixelate --serve

.PHONY: test
test: WHAT ?= ./...
test: build require-go
	go test -v $(WHAT)

.PHONY: docs require-asciidoc
docs: ## build the docs
	@mkdir -p docs/html
	@find docs/adoc -type f -name "*.adoc" | xargs -n 1 asciidoctor
	@mv docs/adoc/*.html docs/html
	@find docs/html -type f

.PHONY: clean
clean: ## clean out the binaries
	@rm -rf ./bin/*

.PHONY: require-%
require-%:
	@if ! command -v $* 1> /dev/null 2>&1; then echo "$* not found in \$$PATH"; exit 1; fi

.PHONY: help
help: ## Show this help.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

#!/usr/bin/env bash
.PHONY: help lint
help: ## Display this help screen
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==============================================================================
# Application Tasks
# ==============================================================================

run: ## Start the dev server
	@npx eleventy --serve

test: ## Run the tests
	@npm test

build: ## Build the project
	@npm run build

lint: ## Run JavaScript syntax linter
	@node scripts/lint.js

import: ## Import music files from Downloads
	@mv /mnt/d/Downloads/*.mid /mnt/d/Downloads/*.mxl data/musescore/ 2>/dev/null || true

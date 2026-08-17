.PHONY: help run stop tail url test build lint import

LOG_DIR := .logs
PID_FILE := $(LOG_DIR)/eleventy.pid

help: ## Display this help screen
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==============================================================================
# Application Tasks
# ==============================================================================

run: ## Start the dev server in the background (logs to .logs/YYYY-MM-DD.log)
	@mkdir -p $(LOG_DIR)
	@find $(LOG_DIR) -name '*.log' -mtime +7 -delete
	@log="$(LOG_DIR)/$$(date +%Y-%m-%d).log"; \
	if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "Already running (pid $$(cat $(PID_FILE)))."; \
		echo "Logging to $$log"; \
		$(MAKE) --no-print-directory url LOG=$$log; \
		exit 0; \
	fi; \
	nohup npx eleventy --serve >> "$$log" 2>&1 & echo $$! > $(PID_FILE); \
	echo "Started eleventy (pid $$(cat $(PID_FILE)))"; \
	echo "Logging to $$log"; \
	$(MAKE) --no-print-directory url LOG=$$log

url:
	@log="$(LOG)"; \
	if [ -z "$$log" ]; then log=$$(ls -1t $(LOG_DIR)/*.log 2>/dev/null | head -n 1); fi; \
	url=""; \
	i=0; \
	while [ $$i -lt 40 ]; do \
		if [ -n "$$log" ]; then \
			url=$$(grep -oE 'https?://[^[:space:]]+' "$$log" 2>/dev/null | tail -n 1); \
		fi; \
		if [ -n "$$url" ]; then break; fi; \
		i=$$((i + 1)); \
		sleep 0.15; \
	done; \
	if [ -z "$$url" ]; then url="http://localhost:8080/"; fi; \
	echo "$$url"

stop: ## Stop the detached dev server
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		kill $$(cat $(PID_FILE)); \
		echo "Stopped pid $$(cat $(PID_FILE))"; \
		rm -f $(PID_FILE); \
	else \
		rm -f $(PID_FILE); \
		echo "No detached server is running."; \
	fi

tail: ## Print the last 30 lines of the newest log
	@latest=$$(ls -1t $(LOG_DIR)/*.log 2>/dev/null | head -n 1); \
	if [ -z "$$latest" ]; then \
		echo "No log files in $(LOG_DIR)/"; \
		exit 1; \
	fi; \
	echo "==> $$latest"; \
	tail -n 30 "$$latest"

test: ## Run tests (compact). VERBOSE=1 for full logs
	@VERBOSE=$(VERBOSE) npm test

build: ## Build the project
	@npm run build

lint: ## Run JavaScript syntax linter
	@node scripts/lint.js

import: ## Import music files from Downloads
	@mv /mnt/d/Downloads/*.mid /mnt/d/Downloads/*.mxl data/musescore/ 2>/dev/null || true

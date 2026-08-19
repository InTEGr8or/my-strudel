.PHONY: help start stop restart tail url test build lint import

LOG_DIR := .logs
PID_FILE := $(LOG_DIR)/eleventy.pid
URL_FILE := $(LOG_DIR)/url
PORT := 8080
REPO := $(abspath .)

help: ## Display this help screen
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==============================================================================
# Application Tasks
# ==============================================================================

# Kill the pid-file process and any other `eleventy --serve` whose cwd is this repo.
define stop_eleventy
	if [ -f $(PID_FILE) ]; then \
		pid=$$(cat $(PID_FILE)); \
		if [ -n "$$pid" ]; then \
			pkill -P $$pid 2>/dev/null || true; \
			kill $$pid 2>/dev/null || true; \
		fi; \
		rm -f $(PID_FILE); \
	fi; \
	for pid in $$(ps -eo pid=,args= | awk '/eleventy --serve/ && !/awk/ {print $$1}'); do \
		cwd=$$(readlink -f /proc/$$pid/cwd 2>/dev/null || true); \
		if [ "$$cwd" = "$(REPO)" ]; then \
			echo "Stopping leftover eleventy pid $$pid"; \
			kill $$pid 2>/dev/null || true; \
		fi; \
	done; \
	sleep 0.25
endef

start: ## Start the dev server in the background on :8080
	@mkdir -p $(LOG_DIR)
	@find $(LOG_DIR) -name '*.log' -mtime +7 -delete
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		if ss -tlnp 2>/dev/null | grep -q ':$(PORT) ' || netstat -tln 2>/dev/null | grep -q ':$(PORT) '; then \
			echo "Already running (pid $$(cat $(PID_FILE))) on http://localhost:$(PORT)/"; \
			echo "http://localhost:$(PORT)/" > $(URL_FILE); \
			echo "http://localhost:$(PORT)/"; \
			exit 0; \
		fi; \
		echo "Pid file is stale or not on port $(PORT); restarting."; \
		$(MAKE) --no-print-directory stop; \
	fi
	@$(stop_eleventy)
	@log="$(LOG_DIR)/$$(date +%Y-%m-%d).log"; \
	printf '\n=== start %s port=%s ===\n' "$$(date -Iseconds)" "$(PORT)" >> "$$log"; \
	nohup npx eleventy --serve --port=$(PORT) >> "$$log" 2>&1 & echo $$! > $(PID_FILE); \
	echo "Started eleventy (pid $$(cat $(PID_FILE)))"; \
	echo "Logging to $$log"; \
	echo "http://localhost:$(PORT)/" > $(URL_FILE); \
	$(MAKE) --no-print-directory url LOG=$$log

restart: stop start ## Stop leftover servers, then start a fresh one on :8080

url:
	@log="$(LOG)"; \
	if [ -z "$$log" ]; then log=$$(ls -1t $(LOG_DIR)/*.log 2>/dev/null | head -n 1); fi; \
	url=""; \
	i=0; \
	while [ $$i -lt 40 ]; do \
		if [ -n "$$log" ]; then \
			url=$$(grep -oE 'https?://localhost:$(PORT)[^[:space:]]*' "$$log" 2>/dev/null | tail -n 1); \
			if [ -z "$$url" ]; then url=$$(grep -oE 'https?://[^[:space:]]+' "$$log" 2>/dev/null | tail -n 1); fi; \
		fi; \
		if [ -n "$$url" ]; then break; fi; \
		i=$$((i + 1)); \
		sleep 0.15; \
	done; \
	if [ -z "$$url" ]; then url="http://localhost:$(PORT)/"; fi; \
	echo "$$url" > $(URL_FILE); \
	echo "$$url"

stop: ## Stop the detached server and leftover Eleventy for this repo
	@$(stop_eleventy)
	@echo "Stopped Eleventy for $(REPO)."

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

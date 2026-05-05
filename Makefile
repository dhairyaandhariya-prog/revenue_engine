STACK ?= all
ORG_WORKSPACE ?= nexus
ENVIRONMENT ?= staging
REGION ?= us-central1

IAC_SCRIPT := $(CURDIR)/scripts/run_infra_updates.sh
APP_DIR    := $(CURDIR)/src

ifeq ($(STACK),org)
RUN_ARGS := org
else ifeq ($(STACK),env)
RUN_ARGS := env $(REGION) $(ENVIRONMENT)
else
RUN_ARGS := all $(REGION) $(ENVIRONMENT)
endif

.PHONY: install
install:
	cd $(APP_DIR) && bun install

.PHONY: run
run: install
	cd $(APP_DIR) && bun run dev

.PHONY: infra-plan
infra-plan:
	ORG_WORKSPACE=$(ORG_WORKSPACE) TERRAFORM_ACTION=plan $(IAC_SCRIPT) $(RUN_ARGS)

.PHONY: infra-apply
infra-apply:
	ORG_WORKSPACE=$(ORG_WORKSPACE) TERRAFORM_ACTION=apply $(IAC_SCRIPT) $(RUN_ARGS)

.PHONY: fmt
fmt:
	@terraform fmt -recursive iac/
	@bunx prettier --write "**/*.{md,json,yaml,yml}" "!bun.lock" "!src/**" --ignore-path .gitignore
	@cd $(APP_DIR) && bun run format

.PHONY: clean
clean:
	rm -rf iac/org/.terraform iac/env/.terraform
	rm -f iac/org/.terraform.lock.hcl iac/env/.terraform.lock.hcl
	rm -f iac/org/tfplan iac/env/tfplan
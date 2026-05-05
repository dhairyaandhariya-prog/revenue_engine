#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IAC_DIR="${IAC_DIR:-$SCRIPT_DIR/../iac}"

TERRAFORM_ACTION="${TERRAFORM_ACTION:-plan}"
ORG_WORKSPACE="${ORG_WORKSPACE:-prism}"
ENVIRONMENT="${ENVIRONMENT:-staging}"
REGION="${REGION:-us-central1}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

cleanup_plans() {
  echo -e "${YELLOW}Cleaning up plan files...${NC}"
  rm -f "${IAC_DIR}/org/tfplan" "${IAC_DIR}/env/tfplan"
}
trap cleanup_plans EXIT

usage() {
  echo -e "${RED}Usage:${NC} $0 [all|org|env] [region] [environment]" >&2
  echo "  ${YELLOW}all${NC} — org (${ORG_WORKSPACE}) then env (${ORG_WORKSPACE}.<region>.<environment>)" >&2
  echo "  ${YELLOW}org${NC} — org stack only" >&2
  echo "  ${YELLOW}env${NC} — env stack only; pass region then environment (or use REGION / ENVIRONMENT)" >&2
  echo "  ${YELLOW}TERRAFORM_ACTION=apply${NC} — plan to tfplan then apply tfplan. Default is plan-only." >&2
  echo "  ${YELLOW}ORG_WORKSPACE${NC} — Terraform workspace prefix for org stack (default: prism)." >&2
  exit 1
}

run_terraform() {
  local stack_dir="$1"
  local workspace="$2"
  local tf_root="${IAC_DIR}/${stack_dir}"
  local var_rel="terraform.${workspace}.tfvars"
  local var_file="${tf_root}/workspaces/${var_rel}"

  echo ""
  echo -e "${CYAN}--- Processing:${NC} ${BLUE}${stack_dir}${NC} (workspace ${BLUE}${workspace}${NC}) ${CYAN}---${NC}"

  if [[ ! -f "${var_file}" ]]; then
    echo -e "${RED}Expected var-file at ${var_file}${NC}" >&2
    echo -e "${YELLOW}Copy e.g. workspaces/terraform.${workspace}.tfvars.example to workspaces/terraform.${workspace}.tfvars${NC}" >&2
    exit 1
  fi

  cd "${tf_root}"

  echo -e "${YELLOW}Initializing Terraform...${NC}"
  terraform init -upgrade -reconfigure

  echo -e "${YELLOW}Selecting workspace:${NC} ${BLUE}${workspace}${NC}"
  terraform workspace select -or-create "${workspace}"

  case "${TERRAFORM_ACTION}" in
  plan)
    echo -e "${YELLOW}Running Terraform plan...${NC}"
    terraform plan -var-file="workspaces/${var_rel}"
    ;;
  apply)
    echo -e "${YELLOW}Running Terraform plan (saved plan)...${NC}"
    terraform plan -var-file="workspaces/${var_rel}" -out=tfplan
    echo -e "${YELLOW}Applying Terraform plan...${NC}"
    terraform apply tfplan
    ;;
  *)
    echo -e "${RED}TERRAFORM_ACTION must be plan or apply, got: ${TERRAFORM_ACTION}${NC}" >&2
    exit 1
    ;;
  esac

  echo -e "${GREEN}✓ Completed: ${stack_dir}${NC}"
}

TARGET="${1:-all}"

case "${TARGET}" in
all | env)
  REGION="${2:-${REGION}}"
  ENVIRONMENT="${3:-${ENVIRONMENT}}"
  ;;
esac

echo -e "${CYAN}==========================================${NC}"
echo -e "${BLUE}Terraform pipeline${NC} ${CYAN}(${TERRAFORM_ACTION})${NC}"
echo -e "${YELLOW}Target:${NC} ${TARGET}"
echo -e "${YELLOW}Org workspace:${NC} ${ORG_WORKSPACE}"
case "${TARGET}" in
org)
  echo -e "${YELLOW}Note:${NC} Region and environment are only used when Target is ${YELLOW}all${NC} or ${YELLOW}env${NC}."
  ;;
*)
  echo -e "${YELLOW}Region:${NC} ${REGION}"
  echo -e "${YELLOW}Environment:${NC} ${ENVIRONMENT}"
  echo -e "${YELLOW}Env workspace:${NC} ${ORG_WORKSPACE}.${REGION}.${ENVIRONMENT}"
  ;;
esac
echo -e "${CYAN}==========================================${NC}"

case "${TARGET}" in
all)
  echo ""
  echo -e "${CYAN}Step 1:${NC} ${BLUE}Org${NC} stack (workspace ${YELLOW}${ORG_WORKSPACE}${NC})..."
  run_terraform "org" "${ORG_WORKSPACE}"
  echo ""
  echo -e "${CYAN}Step 2:${NC} ${BLUE}Env${NC} stack (workspace ${YELLOW}${ORG_WORKSPACE}.${REGION}.${ENVIRONMENT}${NC})..."
  run_terraform "env" "${ORG_WORKSPACE}.${REGION}.${ENVIRONMENT}"
  ;;
org)
  echo ""
  echo -e "${CYAN}Step 1:${NC} ${BLUE}Org${NC} stack only..."
  run_terraform "org" "${ORG_WORKSPACE}"
  ;;
env)
  echo ""
  echo -e "${CYAN}Step 1:${NC} ${BLUE}Env${NC} stack only..."
  run_terraform "env" "${ORG_WORKSPACE}.${REGION}.${ENVIRONMENT}"
  ;;
-h | --help | help)
  usage
  ;;
*)
  usage
  ;;
esac

echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${GREEN}✓ Terraform pipeline completed successfully${NC}"
echo -e "${CYAN}==========================================${NC}"

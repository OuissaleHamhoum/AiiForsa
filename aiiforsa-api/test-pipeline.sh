#!/bin/bash

# Azure DevOps Pipeline Local Testing Script
# This script helps validate the pipeline configuration locally before deploying to Azure DevOps

set -e

echo "🚀 AIIFORSA API - Azure DevOps Pipeline Local Test"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    local missing_deps=()

    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    fi

    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi

    if ! command -v docker &> /dev/null; then
        missing_deps+=("Docker")
    fi

    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("Docker Compose")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_error "Please install missing dependencies and try again."
        exit 1
    fi

    print_success "All dependencies are installed"
}

# Check Node.js version
check_node_version() {
    print_status "Checking Node.js version..."

    local node_version=$(node --version | sed 's/v//')
    local required_version="20.0.0"

    if ! [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]; then
        print_error "Node.js version $node_version is not supported. Required: >= $required_version"
        exit 1
    fi

    print_success "Node.js version $node_version is supported"
}

# Check if required files exist
check_files() {
    print_status "Checking required files..."

    local required_files=(
        "package.json"
        "Dockerfile.production"
        "azure-pipelines.yml"
        "src/main.ts"
        "src/app.module.ts"
    )

    local missing_files=()

    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done

    if [ ${#missing_files[@]} -ne 0 ]; then
        print_error "Missing required files: ${missing_files[*]}"
        exit 1
    fi

    print_success "All required files are present"
}

# Run linting
run_lint() {
    print_status "Running ESLint..."

    if npm run lint; then
        print_success "ESLint passed"
    else
        print_error "ESLint failed"
        exit 1
    fi
}

# Run unit tests
run_unit_tests() {
    print_status "Running unit tests..."

    if npm run test; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi
}

# Test Docker build
test_docker_build() {
    print_status "Testing Docker build..."

    local image_name="aiiforsa-api:test-$(date +%s)"

    if docker build -f Dockerfile.production -t "$image_name" .; then
        print_success "Docker build successful"

        # Clean up test image
        docker rmi "$image_name" &> /dev/null || true
    else
        print_error "Docker build failed"
        exit 1
    fi
}

# Test docker-compose configuration
test_docker_compose() {
    print_status "Testing Docker Compose configuration..."

    if docker-compose -f docker-compose.production.yml config; then
        print_success "Docker Compose configuration is valid"
    else
        print_error "Docker Compose configuration is invalid"
        exit 1
    fi
}

# Validate environment variables
validate_env_vars() {
    print_status "Validating environment variables..."

    if [ -f ".env.production" ]; then
        print_success "Production environment file exists"

        # Check for required variables
        local required_vars=(
            "NODE_ENV"
            "DATABASE_URL"
            "JWT_SECRET"
            "REDIS_PASSWORD"
        )

        local missing_vars=()

        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" .env.production; then
                missing_vars+=("$var")
            fi
        done

        if [ ${#missing_vars[@]} -ne 0 ]; then
            print_warning "Missing required environment variables: ${missing_vars[*]}"
            print_warning "Please check .env.production.example for reference"
        else
            print_success "All required environment variables are present"
        fi
    else
        print_warning "Production environment file (.env.production) not found"
        print_warning "Copy from .env.production.example and configure"
    fi
}

# Check Azure Pipelines YAML syntax
validate_pipeline_yaml() {
    print_status "Validating Azure Pipelines YAML..."

    if command -v python3 &> /dev/null; then
        if python3 -c "import yaml; yaml.safe_load(open('azure-pipelines.yml'))"; then
            print_success "Azure Pipelines YAML syntax is valid"
        else
            print_error "Azure Pipelines YAML syntax is invalid"
            exit 1
        fi
    else
        print_warning "Python3 not available, skipping YAML validation"
        print_warning "Please ensure azure-pipelines.yml is valid YAML"
    fi
}

# Run security checks
run_security_checks() {
    print_status "Running basic security checks..."

    # Check for hardcoded secrets
    local secret_patterns=(
        "password.*=.*[^$]"
        "secret.*=.*[^$]"
        "key.*=.*[^$]"
    )

    local found_secrets=false

    for pattern in "${secret_patterns[@]}"; do
        if grep -r -i "$pattern" src/ --include="*.ts" | grep -v "process.env" | grep -v "configService.get" > /dev/null; then
            found_secrets=true
            break
        fi
    done

    if [ "$found_secrets" = true ]; then
        print_warning "Potential hardcoded secrets found in source code"
        print_warning "Please ensure all secrets are loaded from environment variables"
    else
        print_success "No hardcoded secrets found in source code"
    fi
}

# Main execution
main() {
    echo ""

    check_dependencies
    echo ""

    check_node_version
    echo ""

    check_files
    echo ""

    run_lint
    echo ""

    run_unit_tests
    echo ""

    test_docker_build
    echo ""

    test_docker_compose
    echo ""

    validate_env_vars
    echo ""

    validate_pipeline_yaml
    echo ""

    run_security_checks
    echo ""

    print_success "🎉 All local pipeline tests passed!"
    echo ""
    print_status "Next steps:"
    echo "  1. Commit and push your changes to trigger the Azure DevOps pipeline"
    echo "  2. Monitor the pipeline execution in Azure DevOps"
    echo "  3. Check the deployment status in Azure Portal"
    echo "  4. Test the deployed API endpoints"
    echo ""
    print_status "For detailed Azure DevOps setup, see AZURE_DEVOPS_SETUP.md"
}

# Run main function
main "$@"
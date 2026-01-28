# Azure DevOps Pipeline Setup Guide

This guide explains how to set up and configure the Azure DevOps pipeline for deploying the AIIFORSA API to Azure Container Services.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Azure Resources Setup](#azure-resources-setup)
3. [Azure DevOps Configuration](#azure-devops-configuration)
4. [Pipeline Variables](#pipeline-variables)
5. [Service Connections](#service-connections)
6. [Deployment Environments](#deployment-environments)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

## Prerequisites

### Azure Account & Subscription
- Active Azure subscription
- Contributor or Owner role on the subscription
- Azure CLI installed locally (for testing)

### Azure DevOps Organization
- Azure DevOps organization created
- Project created within the organization
- Repository imported/cloned

### Required Azure CLI Extensions
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install Container App extension
az extension add --name containerapp --upgrade

# Login to Azure
az login
```

## Azure Resources Setup

### 1. Create Azure Container Registry (ACR)

```bash
# Set variables
ACR_NAME="aiiforsaacr"
RESOURCE_GROUP="aiiforsa-rg"
LOCATION="eastus"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Container Registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)
echo "ACR Login Server: $ACR_LOGIN_SERVER"
```

### 2. Create Azure Container App Environment (Production)

```bash
# Create Container App Environment
ENVIRONMENT_NAME="aiiforsa-env"

az containerapp env create \
  --name $ENVIRONMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

### 3. Create Azure Database for PostgreSQL (Optional - for production)

```bash
# Create PostgreSQL server
DB_SERVER_NAME="aiiforsa-postgres"
ADMIN_USER="aiiforsa_admin"
ADMIN_PASSWORD="StrongPassword123!"

az postgres flexible-server create \
  --name $DB_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password $ADMIN_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16

# Create database
az postgres flexible-server db create \
  --server-name $DB_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --database-name aiiforsa_prod
```

### 4. Create Azure Cache for Redis (Optional - for production)

```bash
# Create Redis cache
REDIS_NAME="aiiforsa-redis"

az redis create \
  --name $REDIS_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Basic \
  --vm-size c0
```

## Azure DevOps Configuration

### 1. Create New Pipeline

1. Go to your Azure DevOps project
2. Navigate to **Pipelines** → **Create Pipeline**
3. Select **Azure Repos Git** (YAML)
4. Select your repository
5. Choose **Existing Azure Pipelines YAML file**
6. Select `azure-pipelines.yml` from the root
7. Click **Continue** → **Run**

### 2. Configure Pipeline Permissions

The pipeline needs permissions to deploy to Azure. Configure this in the pipeline settings:

1. Go to **Pipelines** → Select your pipeline → **Edit**
2. Click on the **...** menu → **Manage security**
3. Ensure the pipeline has **User permissions** for:
   - Create releases
   - Manage releases
   - View release pipelines

## Pipeline Variables

### Required Variables (Set in Pipeline Variables)

Go to **Pipelines** → Select your pipeline → **Edit** → **Variables**

#### Database Configuration
```
DATABASE_URL = postgresql://user:password@host:5432/database?schema=public
```

#### Redis Configuration
```
REDIS_HOST = your-redis-host.redis.cache.windows.net
REDIS_PORT = 6380
REDIS_PASSWORD = your-redis-access-key
```

#### JWT Configuration
```
JWT_SECRET = your-32-character-jwt-secret
JWT_EXPIRATION_TIME = 15m
JWT_REFRESH_EXPIRATION_TIME = 7d
```

#### CORS Configuration
```
CORS_ORIGIN = https://your-frontend-domain.com
```

#### Email Configuration
```
MAIL_HOST = smtp.gmail.com
MAIL_PORT = 587
MAIL_USER = your-email@gmail.com
MAIL_PASSWORD = your-app-password
MAIL_FROM = AIIFORSA <noreply@aiiforsa.com>
```

#### Rate Limiting Configuration
```
THROTTLE_SHORT_LIMIT = 5
THROTTLE_MEDIUM_LIMIT = 30
THROTTLE_LONG_LIMIT = 100
```

#### Security Configuration
```
BCRYPT_ROUNDS = 12
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = 900
```

### Variable Groups (Recommended for Secrets)

Create a variable group for sensitive data:

1. Go to **Pipelines** → **Library**
2. Click **+ Variable group**
3. Name it `aiiforsa-secrets`
4. Add variables (mark as secret):
   - `DATABASE_URL`
   - `REDIS_PASSWORD`
   - `JWT_SECRET`
   - `MAIL_PASSWORD`

Link the variable group to your pipeline:

1. Edit pipeline → **Variables** tab
2. Click **Link variable group**
3. Select `aiiforsa-secrets`

## Service Connections

### Azure Resource Manager Connection

1. Go to **Project Settings** → **Service connections**
2. Click **New service connection**
3. Select **Azure Resource Manager**
4. Choose **Service principal (automatic)**
5. Select your subscription and resource group
6. Name it `aiiforsa-subscription`
7. Grant access permission to all pipelines

### Docker Registry Connection

1. Go to **Project Settings** → **Service connections**
2. Click **New service connection**
3. Select **Docker Registry**
4. Choose **Azure Container Registry**
5. Select your Azure subscription
6. Select your ACR (`aiiforsaacr`)
7. Name it `aiiforsa-acr-connection`
8. Grant access permission to all pipelines

## Deployment Environments

### Development Environment
- **Target**: Azure Container Instances
- **Resource Group**: `aiiforsa-dev-rg`
- **Container Name**: `aiiforsa-api-dev`
- **CPU**: 1 core
- **Memory**: 2GB
- **Scaling**: Manual (single instance)

### Production Environment
- **Target**: Azure Container Apps
- **Resource Group**: `aiiforsa-rg`
- **Container App**: `aiiforsa-api`
- **Environment**: `aiiforsa-env`
- **CPU**: 0.5 cores (scales to 5 cores)
- **Memory**: 1GB (scales to 5GB)
- **Scaling**: HTTP concurrency (1-10 instances)

## Pipeline Stages Explained

### 1. Build Stage
- **Linting**: ESLint code quality checks
- **Unit Tests**: Jest unit test execution
- **Build**: TypeScript compilation
- **Docker Build**: Multi-stage production image
- **Push**: Push to Azure Container Registry

### 2. Deploy Development Stage
- **Trigger**: Only on `develop` branch pushes
- **Target**: Azure Container Instances
- **Environment**: Development settings
- **URL**: `http://aiiforsa-api-dev.{region}.azurecontainer.io:4050`

### 3. Deploy Production Stage
- **Trigger**: Only on `main` branch pushes
- **Target**: Azure Container Apps
- **Environment**: Production settings
- **URL**: `https://aiiforsa-api.{guid}.{region}.azurecontainerapps.io`

### 4. Post-Deployment Tests
- **Health Checks**: Automated API health verification
- **Retries**: Multiple attempts with backoff
- **Failure Handling**: Pipeline fails if health checks fail

## Monitoring & Troubleshooting

### Pipeline Logs
View detailed logs in Azure DevOps:
1. Go to **Pipelines** → Select pipeline run
2. Click on each stage/job to view logs
3. Check **Agent job** logs for detailed output

### Common Issues

#### 1. Authentication Failures
```
Error: The user '' is not authorized to perform this operation
```
**Solution**: Check service connection permissions and Azure role assignments.

#### 2. Docker Build Failures
```
Error: buildx failed with: error: failed to solve
```
**Solution**: Check Dockerfile syntax and ensure all dependencies are available.

#### 3. Deployment Timeouts
```
Error: Container app deployment timed out
```
**Solution**: Increase timeout in pipeline or check Azure resource quotas.

#### 4. Health Check Failures
```
Error: Health check failed after 15 attempts
```
**Solution**: Check application logs and ensure database connectivity.

### Azure Resource Monitoring

#### Container Apps
```bash
# View container app logs
az containerapp logs show \
  --name aiiforsa-api \
  --resource-group aiiforsa-rg \
  --follow
```

#### Container Instances
```bash
# View container logs
az container logs \
  --resource-group aiiforsa-dev-rg \
  --name aiiforsa-api-dev
```

### Pipeline Metrics
Monitor pipeline performance in Azure DevOps:
- **Pipeline duration**
- **Success/failure rates**
- **Stage-by-stage timing**
- **Resource utilization**

## Cost Optimization

### Azure Container Apps (Production)
- **CPU**: 0.5 cores base, scales to 5 cores
- **Memory**: 1GB base, scales to 5GB
- **Scaling**: Based on HTTP concurrency (100 requests)
- **Estimated cost**: $50-200/month (depending on traffic)

### Azure Container Instances (Development)
- **CPU**: 1 core
- **Memory**: 2GB
- **Always on**: For development testing
- **Estimated cost**: $20-50/month

### Azure Container Registry
- **SKU**: Basic
- **Storage**: Included storage
- **Estimated cost**: $5-10/month

## Security Considerations

### Secrets Management
- Use Azure Key Vault for production secrets
- Rotate secrets regularly
- Use managed identities where possible
- Avoid hardcoding secrets in code

### Network Security
- Use Azure Firewall for production
- Implement NSG rules
- Use private endpoints for databases
- Enable Azure Defender

### Access Control
- Use Azure RBAC for resource access
- Implement least privilege principle
- Regular access reviews
- Enable Azure AD authentication

## Backup & Disaster Recovery

### Database Backups
Azure Database for PostgreSQL provides automatic backups:
- **Retention**: 7-35 days
- **Point-in-time restore**: Available
- **Geo-redundant**: Optional

### Container Images
ACR provides:
- **Geo-replication**: For disaster recovery
- **Retention policies**: Automatic cleanup
- **Security scanning**: Vulnerability assessment

### Pipeline Backup
- **Repository**: Git provides version control
- **Pipeline definitions**: Stored in YAML
- **Variable groups**: Can be exported/imported

## Next Steps

1. **Set up monitoring**: Implement Application Insights
2. **Configure alerts**: Set up failure notifications
3. **Add manual approvals**: For production deployments
4. **Implement blue-green deployments**: For zero-downtime updates
5. **Add integration tests**: More comprehensive post-deployment testing

## Support

For issues with this pipeline:
1. Check Azure DevOps documentation
2. Review Azure CLI documentation
3. Check Azure Container Apps documentation
4. Open an issue in the repository

---

**Last Updated**: November 2024
**Pipeline Version**: 1.0
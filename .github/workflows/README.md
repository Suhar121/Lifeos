# GitHub Actions Deployment Secrets

To enable automated deployment to Azure, add the following secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):

## 🌐 Frontend (Azure Static Web Apps)
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: The deployment token from the Azure Static Web App portal.

## ⚙️ Backend (Azure Container Apps)
- `AZURE_CREDENTIALS`: A JSON object containing a Service Principal with access to your Resource Group.
- `AZURE_CONTAINER_REGISTRY`: The name of your Azure Container Registry (e.g., `lifeosacr`).
- `AZURE_CONTAINER_APP_NAME`: The name of your Azure Container App (e.g., `lifeos-backend`).
- `AZURE_RESOURCE_GROUP`: The name of the Azure Resource Group containing your services.

### How to get `AZURE_CREDENTIALS`:
Run this in your local terminal (Azure CLI) to generate the JSON:
```bash
az ad sp create-for-rbac --name "LifeOS-Github-Deploy" --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP_NAME> \
  --sdk-auth
```

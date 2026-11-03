# Deploy with Azure Pipelines

1. Create an Azure Container Registry and an App Service with a `staging` slot.
2. Set App Service settings `MONGO_URI`, `API_TOKEN` and `WEBSITES_PORT=3000` for the container.
3. Create registry and Azure resource service connections for the pipeline.
4. Create the `deployment-settings` variable group with the [required variables](../reference/configuration.md). Mark `jiraBasicAuth` secret.
5. Create the Azure Pipelines `Staging` environment and set `reviewerEmails` to the manual validation recipients.
6. Register [`azure-pipelines.yml`](../../azure-pipelines.yml) as the pipeline and push to `main`.

```text
CI -> Staging -> Smoke -> TesterReview -> ApproveProduction -> Production
```


# Deploy with Azure Pipelines

1. Create an Azure Container Registry and an App Service with a `staging` slot.
2. Create registry and Azure resource service connections for the pipeline.
3. Create the `deployment-settings` variable group with the [required variables](../reference/configuration.md). Mark `jiraBasicAuth` secret.
4. Create the Azure Pipelines `Staging` environment and set `reviewerEmails` to the manual validation recipients.
5. Register [`azure-pipelines.yml`](../../azure-pipelines.yml) as the pipeline and push to `main`.

```text
CI -> Staging -> Smoke -> TesterReview -> ApproveProduction -> Production
```

`TesterReview` accepts Jira status `Done`, fails on `Rejected` and stops after 12 checks. `ApproveProduction` requires manual validation. `Production` swaps the staging slot into production.

# Azure deployment

`azure-pipelines.yml` builds a Docker image, deploys to the App Service `staging` slot, and waits for Jira and manual approval before swapping slots.

- Create the `deployment-settings` variable group with the values below.
- Grant the ACR and Azure service connections access to the target resources.
- Create the `staging` slot and set runtime `MONGO_URI` and `API_TOKEN` as App Service settings.
- Configure the `Staging` environment; the manual gate sends notices to `reviewerEmails`.
- Set the Jira issue to `Done` to pass `TesterReview`; `Rejected` or a one-hour timeout blocks promotion.

| Variable | What |
| --- | --- |
| `acrServiceConnection` | ACR service connection |
| `imageRepository` | Image repository in ACR |
| `registryHost` | ACR login server |
| `azureServiceConnection` | Azure subscription service connection |
| `webAppName` | App Service name |
| `resourceGroup` | App Service resource group |
| `stagingUrl` | HTTPS URL of the staging slot |
| `jiraIssueUrl` | Jira REST issue creation endpoint |
| `jiraProjectKey` | Jira project key |
| `jiraBasicAuth` | Secret base64-encoded Jira account and API token |
| `reviewerEmails` | Manual approval notification recipients |

## Verify

Queue `azure-pipelines.yml` from `main`, confirm the staging `/readyz` response, then check Jira approval and the slot swap in the Azure DevOps run.

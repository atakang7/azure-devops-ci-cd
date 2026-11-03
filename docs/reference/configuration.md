# Configuration

## Runtime

Copy [`.env.example`](../../.env.example) for local runs. `API_TOKEN` must have at least 24 characters.

| Variable | Default | Use |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | HTTP bind address; Docker sets `0.0.0.0` |
| `PORT` | `3000` | HTTP port |
| `MONGO_URI` | none | MongoDB connection URI |
| `DB_HOST` | none | Legacy fallback for `MONGO_URI` |
| `API_TOKEN` | none | Shared HTTP authentication secret |
| `OPEN_API_KEY` | none | Speech transcription and chat API credential |
| `TELEGRAM_API_BASE_URL` | none | Telegram API base URL |
| `TELEGRAM_BOT_TOKEN` | none | Telegram bot token |
| `TELEGRAM_BOT_CHAT_ID` | none | Alert destination |

## Azure variable group

The [pipeline](../../azure-pipelines.yml) reads the `deployment-settings` variable group. All values are supplied by the Azure project.

| Variable | Use |
| --- | --- |
| `acrServiceConnection` | Container registry service connection |
| `imageRepository` | Container image repository |
| `registryHost` | ACR login server |
| `azureServiceConnection` | Azure resource connection |
| `webAppName` | App Service name |
| `resourceGroup` | App Service resource group |
| `stagingUrl` | HTTPS URL of the staging slot |
| `jiraIssueUrl` | Jira issue creation endpoint |
| `jiraBasicAuth` | Secret Basic auth value for Jira |
| `jiraProjectKey` | Jira project for review issues |
| `reviewerEmails` | Manual validation recipients |

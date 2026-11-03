# Azure DevOps gated deployment

This repo contains a Node.js hotel API and an Azure DevOps pipeline that checks a staging release before promoting it to production. The hotel routes supply real database and HTTP work for the release checks.

## Quick start

Use Node.js 22 and Docker with a POSIX shell. MongoDB 7 runs locally; the API binds to `127.0.0.1:3000`.

```sh
docker run --rm -d --name hospitality-mongo -p 127.0.0.1:27017:27017 mongo:7
npm ci
cp .env.example .env
node -e "const fs=require('node:fs'),c=require('node:crypto'),p='.env';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace(/^API_TOKEN=.*/m,'API_TOKEN='+c.randomBytes(32).toString('hex')))"
npm start
```

Open `http://127.0.0.1:3000/`. The browser prompts for HTTP Basic authentication: username `operator`, password the generated `API_TOKEN` in `.env`. API clients can use `Authorization: Bearer <API_TOKEN>`. The health endpoints do not require a token.

In another terminal:

```sh
curl -fsS http://127.0.0.1:3000/healthz
curl -fsS http://127.0.0.1:3000/readyz
curl -fsS -u "operator:$(sed -n 's/^API_TOKEN=//p' .env)" http://127.0.0.1:3000/hotels
```

## Configuration

Copy `.env.example` for local use. In containers and Azure App Service, supply values through the runtime environment or a secrets store, not the image.

| Variable | Use |
| --- | --- |
| `MONGO_URI` | MongoDB connection string; required |
| `API_TOKEN` | Shared token of at least 24 characters; required |
| `HOST`, `PORT` | Listen address and port; local defaults `127.0.0.1` and `3000` |
| `OPEN_API_KEY` | Optional OpenAI key for the voice assistant |
| `TELEGRAM_API_BASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_CHAT_ID` | Optional error notifications; all three must be set |

`/docs` serves the OpenAPI UI behind the same authentication as the API. Basic credentials should only cross localhost or HTTPS.

## Verify changes

With the MongoDB container running:

```sh
MONGO_URI=mongodb://127.0.0.1:27017/nevotek_ci \
  API_TOKEN=local-test-token-longer-than-24-chars npm test
npm run build
```

The integration tests **delete the `nevotek_ci` database** during cleanup. `npm run build` checks JavaScript syntax; it does not produce compiled output. GitHub Actions runs the tests against MongoDB 7, checks HTTP readiness, exercises the browser UI and smoke-tests a Docker image. Screenshots are uploaded as workflow artifacts.

## Delivery

`azure-pipelines.yml` is the maintained Azure definition:

```text
CI + MongoDB tests -> ACR image -> App Service staging slot
-> /readyz check -> Jira review -> manual approval -> production slot swap
```

Create an Azure variable group named `deployment-settings`:

| Variable | Use |
| --- | --- |
| `acrServiceConnection` | ACR service connection |
| `imageRepository`, `registryHost` | Image name and ACR login host |
| `azureServiceConnection`, `webAppName`, `resourceGroup` | Azure deployment target |
| `stagingUrl` | HTTPS address of the staging slot |
| `jiraIssueUrl` | Jira issue creation endpoint |
| `jiraProjectKey` | Jira project key for approval tickets |
| `jiraBasicAuth` | Secret: base64 of Jira account email and API token |
| `reviewerEmails` | Recipients of the manual approval request |

Create an App Service staging slot and authorize the service connections. Set up a `Staging` environment and a `Production` approval policy in Azure DevOps. The pipeline also uses a `ManualValidation` job after the Jira issue reaches `Done`; `Rejected` or a one-hour timeout stops promotion.

## Limits

The API uses one shared token and does not implement user accounts or scoped permissions. It is suitable for a local demo or a restricted environment, not a public multi-tenant deployment. The speech endpoint calls an external service and needs a separate API key.

GitHub CI tests local code and containers. It does not verify access to your Azure registry, Jira instance or App Service slots. Those release stages require real service connections and must be exercised in your Azure project.

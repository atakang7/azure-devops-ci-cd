# Azure DevOps CI/CD reference

A staged release pipeline built around a Node.js hospitality demo. The emphasis is on **gating production promotion**, not the size of the sample application.

[Pipeline definition](azure-pipelines.yml) · [Architecture overview](index.html) · [Backend integration test](tests/server.integration.test.js)

## Delivery flow

```text
Commit → CI + MongoDB tests → versioned ACR image → staging slot
        → /readyz smoke check → Jira review → manual approval → slot swap
```

A failed stage blocks its successors. Only `azure-pipelines.yml` is the maintained Azure pipeline; the earlier drafts were retired.

## Run locally

Requires Node.js 22 and MongoDB 7. All API routes except `/healthz` and `/readyz` require authentication.

```sh
docker run --rm -d --name hospitality-mongo -p 127.0.0.1:27017:27017 mongo:7
npm ci
cp .env.example .env
# Replace API_TOKEN with a random, long secret before exposing the service
npm start
```

Default binding is `127.0.0.1:3000`. Programmatic clients send `Authorization: Bearer <API_TOKEN>`. The browser-facing hotel demo also accepts HTTP Basic username `operator` and the same token as its password, for **local or TLS-protected use only**.

For a container, set `HOST=0.0.0.0`, `MONGO_URI` and `API_TOKEN` through the runtime secret configuration. Never bake tokens into images or source.

## Verify functionality

```sh
MONGO_URI=mongodb://127.0.0.1:27017/nevotek_ci \
  API_TOKEN=replace-with-a-local-ci-secret-longer-than-24 \
  npm test
npm run build
```

The integration test **only accepts the isolated `nevotek_ci` database**, which it deletes during cleanup. CI boots real MongoDB, executes HTTP CRUD and authorization tests, then starts the actual process and checks liveness and readiness.

`/healthz` checks that the process answers HTTP; `/readyz` reports database connectivity. Browser screenshots for the static architecture and hotel demo are retained as CI artifacts.

## Azure / Jira setup

Create a restricted Azure variable group named `deployment-settings` with these entries:

| Variable | Meaning |
| --- | --- |
| `acrServiceConnection` | ACR registry service connection |
| `imageRepository`, `registryHost` | Repository and ACR login host |
| `azureServiceConnection`, `webAppName`, `resourceGroup` | Deployment target |
| `stagingUrl` | HTTPS staging URL for readiness |
| `jiraIssueUrl` | Jira issue creation endpoint |
| `jiraBasicAuth` | **Secret**: base64 of account:API token |
| `reviewerEmails` | Authorized production approvers |

Configure a `Staging` environment and an approval policy for `Production`. Grant only necessary privileges to the service connections. A manual validation stage provides an additional gate.

## Limits

- The Azure service connections, registry, staging deployment, Jira review and slot swap require external accounts; GitHub CI **does not simulate them or establish that they succeeded**.
- The hotel app is an **internal/demo API**. Shared-token authentication is unsuitable for a public multi-tenant service; use a real identity provider, TLS, scoped roles and audited writes before external deployment.
- Speech transcription requires a separately configured OpenAI API key. Browser audio permissions and the external transcription service are not proven by the local integration suite.
- Redis, duplicate pipeline drafts, hardcoded administrator credentials and unused dependencies were removed from the maintained implementation.

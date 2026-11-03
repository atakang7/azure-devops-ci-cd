# azure-devops-ci-cd

A Node.js hospitality API used to test a staged Azure DevOps release with Jira review and manual production approval.

```text
+--------+  HTTP   +----------+  queries  +---------+
| client | ------> | index.js | --------> | MongoDB |
+--------+         +----------+           +---------+
                        |
                        | HTTPS
                        v
                   +------------+
                   | Speech API |
                   +------------+
```

## Quick start

Requires Node.js 22 and MongoDB 7.

```sh
docker run -d --rm --name hospitality-mongo -p 127.0.0.1:27017:27017 mongo:7
npm ci
cp .env.example .env
npm start
```

The server binds to `127.0.0.1:3000`. Replace the example `API_TOKEN` before exposing it beyond loopback.

## Layout

| Path | What it is |
| --- | --- |
| [./](README.md) | Express app, routes, controllers, models and EJS views |
| [scripts/](scripts/README.md) | Database fixtures and browser checks |
| [docs/](docs/README.md) | Release instructions, configuration and API documentation |

## Docs

- [Deploy with Azure Pipelines](docs/how-to/deploy.md)
- [Runtime and release variables](docs/reference/configuration.md)
- [HTTP interface](docs/reference/http-api.md)
- [Architecture](docs/explanation/architecture.md)

## Limits

- Azure release stages need external service connections, registry, App Service and Jira.
- HTTP authentication uses one shared token without per-user authorization.
- Speech requests need an external API credential.

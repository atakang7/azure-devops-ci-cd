# Azure DevOps gated deployment

A Node.js hotel API with MongoDB-backed routes and an Azure release pipeline that gates production on staging checks and human review.

```text
+--------+  HTTP   +----------+  dispatch  +-------------+
| client | ------> | index.js | ---------> | routes/*.js |
+--------+         +----------+            +-------------+
                                                |
                                              calls
                                                v
                                        +------------------+
                                        | controllers/*.js |
                                        +------------------+
                                                |
                                              calls
                                                v
                                        +-------------+
                                        | models/*.js |
                                        +-------------+
                                                |
                                           reads/writes
                                                v
                                        +-----------+
                                        | MongoDB 7 |
                                        +-----------+
```

```text
+-------------------+
| CI                |
+-------------------+
         |
     image (ACR)
         v
+-------------------+
| Staging           |
+-------------------+
         |
     HTTP /readyz
         v
+-------------------+
| Smoke             |
+-------------------+
         |
     check passed
         v
+-------------------+
| TesterReview      |
+-------------------+
         |
     Jira Done
         v
+-------------------+
| ApproveProduction |
+-------------------+
         |
    manual approval
         v
+-------------------+
| Production        |
+-------------------+
```

## Run

Requires Node.js 22, Docker and a POSIX shell.

```sh
docker run --rm -d --name hospitality-mongo -p 127.0.0.1:27017:27017 mongo:7
npm ci
cp .env.example .env
node -e "const fs=require('fs');fs.writeFileSync('.env',fs.readFileSync('.env','utf8').replace(/^API_TOKEN=.*/m,'API_TOKEN='+require('crypto').randomBytes(32).toString('hex')))"
npm start
```

Open `http://127.0.0.1:3000/` with Basic username `operator` and password `API_TOKEN` from `.env`.

In another terminal:

```sh
curl -fsS http://127.0.0.1:3000/readyz
MONGO_URI=mongodb://127.0.0.1:27017/nevotek_ci API_TOKEN=local-test-token-longer-than-24-chars npm test
npm run build
```

## Config

| Variable | Default | What |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | HTTP bind address |
| `PORT` | `3000` | HTTP port |
| `MONGO_URI` | none | MongoDB connection string (required) |
| `API_TOKEN` | none | Shared auth token, at least 24 characters (required) |
| `OPEN_API_KEY` | none | Optional voice transcription |
| `TELEGRAM_API_BASE_URL` | none | Telegram endpoint; see `.env.example` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_CHAT_ID` | none | Optional notifications |

Azure service connections and deployment variables: [docs/azure.md](docs/azure.md).

## Limits

- The API has one shared token, not user-level authorization.
- Tests delete the `nevotek_ci` database; do not point them at production data.
- GitHub CI checks code and containers, not live Azure or Jira resources.

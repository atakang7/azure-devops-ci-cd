Part of [azure-devops-ci-cd](../README.md)

# Browser checks

The seed script inserts one hotel fixture; the browser script checks the architecture page and hotel views.

## Run

Start MongoDB and the API with the isolated `nevotek_ci` database. Use the token from [runtime configuration](../docs/reference/configuration.md).

```sh
npm install --no-save --no-package-lock playwright-core@1.58.2
MONGO_URI=mongodb://127.0.0.1:27017/nevotek_ci node scripts/seed-browser.mjs
API_TOKEN=replace-with-random-secret-at-least-24-chars CHROME_PATH=/usr/bin/google-chrome node scripts/browser-e2e.cjs
```

## Test

```sh
MONGO_URI=mongodb://127.0.0.1:27017/nevotek_ci API_TOKEN=replace-with-random-secret-at-least-24-chars npm test
```

## Config

| Variable | Default | Use |
| --- | --- | --- |
| `MONGO_URI` | none | MongoDB URI ending in `/nevotek_ci` |
| `API_TOKEN` | none | Bearer token sent to the API |
| `CHROME_PATH` | `/usr/bin/google-chrome` | Chromium executable |

## Interfaces

`seed-browser.mjs` writes hotel, app, food and user documents to MongoDB. `browser-e2e.cjs` reads `index.html` and HTTP pages on port 3000; it writes PNG files and `checks.json` under `browser-evidence/`.

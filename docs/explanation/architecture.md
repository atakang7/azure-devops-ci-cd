# Architecture

The application is one Express process. The routers in [`routes/`](../../routes/) call handlers in [`controllers/`](../../controllers/), which use Mongoose models and the shared connection in [`apis/db/cosmosDB.js`](../../apis/db/cosmosDB.js). EJS pages are rendered by the same process.

`/healthz` reports whether HTTP is responding; `/readyz` checks the Mongoose connection state. The staging smoke stage calls `/readyz` before the review stages run.

GitHub Actions tests the API against MongoDB, checks browser pages and builds a runtime image. Azure Pipelines builds an ACR image tagged with `Build.BuildId`, deploys a staging slot, waits for Jira review and manual validation, then swaps the slot.

The shared HTTP token permits local and internal testing. The API has no user-specific roles or permissions at the HTTP boundary.

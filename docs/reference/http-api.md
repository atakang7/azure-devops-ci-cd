# HTTP interface

The process listens on `HOST:PORT`. Every route except `/healthz` and `/readyz` requires `Authorization: Bearer <API_TOKEN>` or HTTP Basic with username `operator` and password `API_TOKEN`.

| Method | Path | Response |
| --- | --- | --- |
| GET | `/healthz` | `200` with process status |
| GET | `/readyz` | `200` if MongoDB is connected, otherwise `503` |
| GET | `/` | EJS hotel listing |
| GET | `/dashboard/:id` | EJS hotel dashboard |
| POST | `/:id/visit` | Create client visit |
| GET | `/docs` | Swagger UI |
| GET, POST | `/users`, `/hotels`, `/foods`, `/rooms`, `/apps` | List or create documents |
| GET, PUT, DELETE | `/users/:id`, `/hotels/:id`, `/foods/:id`, `/rooms/:id` | Read, change or delete a document |
| GET, PATCH, DELETE | `/apps/:id` | Read, change or delete an app |
| POST | `/chatbot/get-chatbot-response` | Transcribe audio and return chat answer |

The chatbot accepts multipart form fields `audio` and `hotelId`. Audio is limited to 10 MiB. Missing speech credentials return `503`; provider failures return `502`.

Unknown routes return `404`; unauthenticated requests return `401`.

# Vision UI (Vite + React)

A lightweight console for exercising the `/api/face-match` and `/api/description-search` endpoints. Built with Vite, React, and Tailwind so you can upload a video/reference image, describe outfits in natural language, and inspect the returned clips inline.

## Getting started

```bash
cd vision-app/frontend
npm install
npm run dev
```

The dev server boots at `http://localhost:5173` by default. It hot-reloads React components, Tailwind styles, and the API helper modules.

## Environment configuration

Create a `.env` file (or copy `.env.example`) to configure how the client reaches your FastAPI backend:

```dotenv
VITE_API_BASE_URL=
VITE_PROXY_TARGET=http://127.0.0.1:8000
```

- Leave `VITE_API_BASE_URL` empty during local development to rely on the Vite proxy (see below). Set it to `https://your-fastapi-host.com` when deploying the static build so network calls go directly to the backend.
- `VITE_PROXY_TARGET` controls where Vite forwards `/api/*` calls while running `npm run dev`. It defaults to the common FastAPI port `8000`.

The React app always POSTs multipart payloads containing the uploaded video, optional reference image, and text description. Basic toasts surface errors if the backend replies with non-2xx status codes.

## Proxying to FastAPI during development

When you run `npm run dev`, the Vite server automatically proxies browser requests to `/api/*` into `VITE_PROXY_TARGET`. That lets you run FastAPI on `http://127.0.0.1:8000` (or any host:port you specify) without fiddling with CORS during development.

1. Start your FastAPI server locally, e.g. `uvicorn app.main:app --reload --port 8000`.
2. Ensure `.env` (or your shell) exports `VITE_PROXY_TARGET=http://127.0.0.1:8000` and keep `VITE_API_BASE_URL` blank.
3. Run `npm run dev` and open the Vite URL. When you click **Run face match** or **Search by description**, the browser talks to Vite (`/api/...`) which then proxies to FastAPI.

For production builds (`npm run build`), host the generated `dist/` folder behind any static server (Cloudflare Pages, Netlify, etc.) and set `VITE_API_BASE_URL` to your public FastAPI domain so the compiled bundle knows where to send requests.

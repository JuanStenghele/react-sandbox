# React Sandbox

Example web frontend for testing and learning new stuff. Developed in TypeScript using React. It is the UI for the [FastAPI Sandbox](https://github.com/juan-stenghele/fastapi-sandbox) backend.

## Requirements

- Node.js (v24.16.0 OK)

## How to run

Install the dependencies:

```bash
npm install
```

The frontend expects the [FastAPI Sandbox](https://github.com/juan-stenghele/fastapi-sandbox) backend to be running. The required environment variables are already set in `.env.development` for local development, so no changes are needed:

- `VITE_BACKEND_BASE_URL=http://localhost:8000`
- `VITE_OIDC_AUTHORITY=http://localhost:8080/fastapi-sandbox`
- `VITE_OIDC_CLIENT_ID=fastapi-sandbox`

Start the development server:

```bash
npm run dev
```

The app will be running on `http://localhost:5173/`.

### Auth

The app uses OAuth 2.0 with the Authorization Code flow + PKCE, implemented with `react-oidc-context` / `oidc-client-ts`. In production, Auth0 acts as the identity provider. Locally, [mock-oauth2-server](https://github.com/navikt/mock-oauth2-server) replaces it: it implements the same protocol, issues real JWTs and exposes a JWKS endpoint, so the application code is identical in both environments. This avoids hitting a real Auth0 tenant during development and system tests and avoids adding an external dependency to the local stack.

#### mock-oauth2-server

`.env.development` credentials are prepared to use this service, so no changes are needed. Make sure the [FastAPI Sandbox](https://github.com/juan-stenghele/fastapi-sandbox) stack is running, then click `SIGN IN` on the login page and enter any user.

#### Auth0

Update the credentials in the `.env.development` file to use Auth0.

- `VITE_OIDC_AUTHORITY=https://<your-tenant>.us.auth0.com`: Get your tenant on the top left of the Auth0 dashboard or in `Applications > [Your App] > Settings > Domain`.
- `VITE_OIDC_CLIENT_ID=<your-client-id>`: Found in `Applications > [Your App] > Settings > Client ID`.

Make sure the Auth0 application is configured as a single-page application with `http://localhost:5173` in the allowed callback, logout and web origins.

## Tests

To run the tests execute:

```bash
npm run test
```

To run the linter execute:

```bash
npm run lint
```

To build the app for production execute:

```bash
npm run build
```

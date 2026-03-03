# Sentry + GitHub Integration Setup

## 1. Create a Sentry Project

1. Go to [sentry.io](https://sentry.io) and create an organization (or use an existing one)
2. Create two projects: one **Python (FastAPI)** and one **React**
3. Copy the **DSN** from each project's **Settings > Client Keys (DSN)**

## 2. Configure Environment Variables

Add the DSNs to your `.env` file:

```env
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0        # backend
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/1   # frontend
```

## 3. Connect Sentry to GitHub

1. In Sentry, go to **Settings > Integrations > GitHub**
2. Click **Install** and authorize your GitHub organization
3. Select the repositories you want to link

This enables:

- **Commit tracking** — Sentry links errors to the commit that introduced them
- **Suspect commits** — automatically identifies which commit likely caused an issue
- **Issue linking** — link Sentry issues to GitHub issues
- **Stack trace links** — click through from Sentry errors directly to source code

## 4. Enable Source Maps (Frontend)

For readable frontend stack traces, upload source maps in your CI/CD:

```bash
npx @sentry/cli sourcemaps inject --org <org> --project <project> ./dist
npx @sentry/cli sourcemaps upload --org <org> --project <project> ./dist
```

Or use the [Vite plugin](https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/uploading/vite/):

```ts
// vite.config.ts
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    sentryVitePlugin({
      org: "<org>",
      project: "<project>",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

## 5. Verify

Trigger a test error in either layer and confirm it appears in Sentry with commit info and source context.

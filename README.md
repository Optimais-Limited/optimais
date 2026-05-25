# Optimais Limited Website

Static, responsive landing page for Optimais Limited with interactive content panels, contact information, and a Scholarships, Grants & Fellowships resource hub.

## Project Structure

- `index.html` - Main website, embedded CSS, and JavaScript.
- `brand_assets/` - Optimais logo assets.
- `package.json` - Local run and deployment scripts.
- `netlify.toml` - Netlify deployment configuration.
- `vercel.json` - Vercel deployment configuration.

## Requirements

- Node.js is optional but useful for deployment platforms.
- Python 3 is used by the local preview script.

No npm dependencies are required.

## Run Locally

```bash
cd optimais
npm run dev
```

Open:

```text
http://localhost:4173
```

You can also open `index.html` directly in a browser, but the local server is closer to deployed behavior.

## Build

```bash
npm run build
```

This is a static site, so the build command is intentionally a no-op.

## Updating Scholarship Opportunities

Scholarships, grants, fellowships, research programs, and funded training entries are stored in the `opportunities` array near the bottom of `index.html`.

Each entry supports:

- `title`
- `level`
- `region`
- `field`
- `deadline`
- `funding`
- `summary`
- `link`

Use `deadline: "rolling"` for rolling opportunities, or an ISO date like `2026-08-30`.

## Deploy on Netlify

1. Push the `optimais` folder to a Git repository.
2. In Netlify, create a new site from the repository.
3. Use these settings:
   - Base directory: `optimais` if this folder is inside a larger repo.
   - Build command: `npm run build`
   - Publish directory: `.`
4. Deploy.

The included `netlify.toml` already defines the build and publish settings.

## Deploy on Vercel

1. Push the `optimais` folder to a Git repository.
2. In Vercel, import the repository.
3. Use these settings:
   - Root directory: `optimais` if this folder is inside a larger repo.
   - Build command: `npm run build`
   - Output directory: `.`
4. Deploy.

The included `vercel.json` defines the static output configuration.

## Environment Variables

No environment variables are required for the current static version.

If the contact form is later connected to a form API, email service, CRM, or database, add the required variables in Netlify or Vercel project settings instead of hard-coding secrets.

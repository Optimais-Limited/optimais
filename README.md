# Optimais Limited Website

Static, responsive landing page for Optimais Limited with interactive content panels, contact information, and a Scholarships, Grants & Fellowships Finder.

## Project Structure

- `index.html` - Main website, embedded CSS, and JavaScript.
- `data/scholarships.json` - Admin-friendly scholarship source and opportunity data.
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

## Scholarship Finder

The Scholarships, Grants & Fellowships Finder lets users:

- Browse curated opportunity sources by category.
- Search by provider, title, field, country/region, keyword, or funding type.
- Filter by degree level, country/region, field, deadline, and funding type.
- Submit a profile and receive recommended scholarship sources and official links.

The finder currently uses manually curated JSON data. It does not assume that source websites have public APIs.

Future integrations can replace or enrich `data/scholarships.json` with:

- Approved API integrations.
- RSS feed ingestion.
- Internal database records.
- Approved scraping tools run outside the static website.

## Updating Scholarship Data

Scholarships, grants, fellowships, research programs, and funded training source entries are stored in:

```text
data/scholarships.json
```

Each entry supports:

```json
{
  "title": "Program or source title",
  "provider": "Provider name",
  "source": "https://official-website.example",
  "levels": ["Bachelor's", "Master's", "PhD", "Postdoc", "Professional Training"],
  "countries": ["Africa", "Nigeria", "Global"],
  "fields": ["Engineering", "AI & Data", "Climate"],
  "deadline": "rolling",
  "fundingTypes": ["Fully funded", "Fellowship"],
  "summary": "Short description shown on the card.",
  "keywords": ["search", "matching", "terms"]
}
```

Use `deadline: "rolling"` for rolling opportunities, or an ISO date like `2026-08-30`.

Use official provider URLs in `source`. Users are shown a disclaimer to verify deadlines, eligibility, application requirements, and instructions on official scholarship websites.

## Included Source Websites

The initial JSON data includes source entries for:

- Opportunities for Africans
- ScholarshipAir
- ScholarshipSet
- Association of African Universities Scholarships & Grants
- Mastercard Foundation Scholars Program
- Chevening Scholarships
- Commonwealth Scholarships
- DAAD Scholarships
- Erasmus Mundus Joint Masters
- Fulbright Foreign Student Program
- Joint Japan/World Bank Graduate Scholarship Program
- World Bank Africa Fellowship Program
- Science for Africa Foundation
- SSRC African Peacebuilding and Developmental Dynamics Fellowships
- Yale Young African Scholars Resources

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

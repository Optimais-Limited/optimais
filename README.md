# Optimais Limited Platform

Next.js backend architecture for the Optimais Limited website, scholarship finder, admin CMS, contact workflows, newsletter, authentication, saved scholarships, application tracker, and AI-assisted tools.

## Stack

- Next.js App Router
- Next.js API routes
- Prisma ORM
- PostgreSQL on Supabase
- NextAuth credentials authentication
- Zod validation
- OpenAI API via `OPENAI_API_KEY`
- Vercel-ready deployment

## Security Note

Do not store personal account passwords in the app. ChatGPT account email/password credentials are not used for integrations. AI features use an OpenAI API key stored in environment variables.

## Project Structure

- `app/api/*` - Backend API routes.
- `app/admin/*` - Responsive admin dashboard and CRUD pages.
- `components/admin/*` - Admin UI shell and reusable CRUD client.
- `lib/prisma.ts` - Prisma client singleton.
- `lib/auth.ts` - NextAuth configuration.
- `lib/validators.ts` - Zod request validation schemas.
- `prisma/schema.prisma` - Database schema.
- `prisma/seed.ts` - Admin user seed script.
- `data/scholarships.json` - Static curated scholarship source data used by the public finder.
- `.env.example` - Required environment variables.

## Backend Modules

- Contact form handling: `POST /api/contact`
- Newsletter subscriptions: `POST /api/newsletter`
- Scholarship opportunities: `GET/POST /api/scholarships`
- Scholarship CRUD by ID: `GET/PUT/DELETE /api/scholarships/:id`
- Blog/insights CMS: `GET/POST /api/blog`
- Blog CRUD by ID: `PUT/DELETE /api/blog/:id`
- Authentication: `/api/auth/*`
- Saved scholarships: `GET/POST /api/saved-scholarships`
- Application tracker: `GET/POST /api/application-tracker`
- AI tools: `POST /api/ai`
- Admin stats: `GET /api/admin/stats`

Admin pages are under `/admin`.

## Local Development

Install dependencies:

```bash
npm install
```

Copy environment variables:

```bash
cp .env.example .env
```

Run the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:4173
```

## Supabase Database Setup

1. Create a Supabase project.
2. Open Project Settings -> Database.
3. Copy the pooled connection string into `DATABASE_URL`.
4. Copy the direct connection string into `DIRECT_URL`.
5. Keep both values secret.

Example:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

`DATABASE_URL` is used by the app at runtime. `DIRECT_URL` is used by Prisma migrations.

## Environment Variables

Required:

```env
DATABASE_URL=""
DIRECT_URL=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:4173"
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4-mini"
```

Generate a strong `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Prisma

Generate the Prisma client:

```bash
npm run prisma:generate
```

Create and run a migration:

```bash
npm run prisma:migrate
```

For a quick schema sync during early development:

```bash
npm run db:push
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

Seed the first admin:

```bash
npm run seed
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before seeding.

## AI Features

`POST /api/ai` supports:

- `scholarship-recommender`
- `research-assistant`
- `government-search`
- `proposal-writer`
- `infrastructure-planner`
- `recommendations`

Request shape:

```json
{
  "feature": "proposal-writer",
  "prompt": "Draft a renewable energy proposal outline.",
  "context": {
    "country": "Nigeria",
    "sector": "solar mini-grid"
  }
}
```

The route uses `OPENAI_API_KEY` and `OPENAI_MODEL`. It does not use ChatGPT account credentials.

## Scholarship Data

The public finder still reads curated data from:

```text
data/scholarships.json
```

The database-backed scholarship admin uses `ScholarshipOpportunity` in Prisma. You can keep both during migration:

- Use JSON for fast public curated source updates.
- Use PostgreSQL for admin-managed opportunity records.
- Later, replace JSON loading with `GET /api/scholarships` when the database has enough entries.

Future integrations can import from APIs, RSS feeds, or approved scraping tools into PostgreSQL.

## Deployment on Vercel

1. Create a Supabase project and run Prisma migrations.
2. Push the repo to your Git provider.
3. Import the project into Vercel.
4. If this folder is inside a larger repo, set the Vercel root directory to `optimais`.
5. Add environment variables in Vercel Project Settings.
6. Use:
   - Build command: `npm run build`
   - Install command: `npm install`
7. Deploy.

Do not expose `.env` or credentials in Git.

## Deployment on Netlify

The included `netlify.toml` uses the official Next.js plugin.

1. Set the project base directory to `optimais` if needed.
2. Add the same environment variables in Netlify.
3. Build command: `npm run build`
4. Publish directory: `.next`

## Testing Locally

Recommended checks:

```bash
npm run prisma:generate
npm run build
npm run dev
```

Then test:

- `/api/contact`
- `/api/newsletter`
- `/api/scholarships`
- `/admin`
- `/api/ai` with `OPENAI_API_KEY` set

## Notes

No auto-deploy or GitHub push is performed by this project setup.

# 🚀 Deployment Guide — Platinum Construction Cleaning

This guide walks you through deploying the app to **Vercel** with **Supabase** (PostgreSQL database).

## Architecture

```
GitHub (repo) ──▶ Vercel (Next.js app) ──▶ Supabase (PostgreSQL DB)
```

---

## Step 1 — Create the Supabase Database

1. Go to **[supabase.com](https://supabase.com)** and sign up / log in (free tier is fine).
2. Click **New Project**:
   - **Name**: `platinum-cleaning`
   - **Database Password**: create a strong password and SAVE IT
   - **Region**: `US East` (or closest to Florida)
   - **Plan**: Free
3. Wait ~2 minutes for provisioning to finish.
4. Go to **Project Settings → Database → Connection string (URI)**.
5. Copy the connection string. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
   Replace `[YOUR-PASSWORD]` with the password you saved.

> **Note:** For serverless (Vercel), use the **Connection Pooler** URL (port `6543`):
> ```
> postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
> ```

---

## Step 2 — Push the code to GitHub

```bash
# From the project root directory
git add -A
git commit -m "Production ready: Supabase + Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/platinum-cleaning.git
git push -u origin main
```

> If the repo doesn't exist on GitHub yet, create it first at **[github.com/new](https://github.com/new)** (name it `platinum-cleaning`, leave it empty).

---

## Step 3 — Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New → Project**.
3. Import the `platinum-cleaning` repository.
4. Vercel will auto-detect Next.js. **Before clicking Deploy**, expand **Environment Variables** and add these:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres` *(your Supabase pooler URL)* |
   | `NEXTAUTH_SECRET` | Generate one with: `openssl rand -base64 32` *(run in terminal)* |
   | `NEXTAUTH_URL` | `https://your-app-name.vercel.app` *(your Vercel URL, add after first deploy if unsure)* |

5. Click **Deploy**. Wait ~3 minutes for the build to finish.

---

## Step 4 — Initialize the Production Database

After the first deploy succeeds, you need to create the tables and seed the admin user + pricing data:

1. **Create the tables** — run this locally (your `.env` must point to Supabase temporarily):
   ```bash
   # Edit .env: set DATABASE_URL to your Supabase connection string
   bun run db:push
   ```
   *(This creates all tables in Supabase. `--accept-data-loss` is safe for first-time setup.)*

2. **Seed the data** (admin user + pricing matrix + services):
   ```bash
   bun prisma/seed-prod.ts
   ```
   This creates:
   - **Admin user**: `admin@platinumcleaning.com` / `admin123`
   - **Pricing matrix**: 4 rate combinations (Residential/Commercial × Rough/Final)
   - **Additional services**: Debris removal, Window sticker removal

3. **(Optional) Change the admin password** after first login at `/admin/login`.

---

## Step 5 — Set the Production URL

1. After deploy, Vercel gives you a URL like `https://platinum-cleaning.vercel.app`.
2. Go to **Vercel Project Settings → Environment Variables**.
3. Update `NEXTAUTH_URL` to `https://platinum-cleaning.vercel.app`.
4. Trigger a redeploy (Deployments → Redeploy).

---

## ✅ Verify

Visit your live site:
- **Public site**: `https://your-app.vercel.app/` — the estimate calculator should work.
- **Admin login**: `https://your-app.vercel.app/admin/login`
  - Email: `admin@platinumcleaning.com`
  - Password: `admin123`

Create a test quote from the public site → it should appear in the admin dashboard.

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Hosting | Vercel (serverless) |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js v4 (Credentials provider) |
| PDF | @react-pdf/renderer |
| Styling | Tailwind CSS 4 + shadcn/ui |
| ORM | Prisma 6 |

---

## 📝 Local Development

To keep working locally with SQLite (faster than Supabase):

1. Keep a `.env` with `DATABASE_URL="file:./dev.db"` for local dev.
2. Temporarily switch `prisma/schema.prisma` provider to `sqlite` for local work.
3. **Before deploying**, ensure the schema is set to `postgresql` and commit.

**OR** (recommended) — connect your local dev directly to Supabase:
```bash
# .env
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```
Then run `bun run db:push` once, and develop against the real DB.

---

## Troubleshooting

**Build fails on Vercel with Prisma error**
→ The `postinstall` script runs `prisma generate` automatically. If it still fails, ensure `DATABASE_URL` env var is set in Vercel.

**"No pricing found" error**
→ You forgot to run the seed. Run `bun prisma/seed-prod.ts` locally with your Supabase `DATABASE_URL`.

**Admin login fails**
→ Run the seed script again to recreate the admin user.

**PDF download returns 401**
→ You must be logged in to `/admin` to download PDFs (route is protected).

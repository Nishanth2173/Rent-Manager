# Automatic Rent Generation — Cron Setup Guide

The app has a cron endpoint at:
```
GET/POST https://your-app.vercel.app/api/cron/generate-rent
```

This endpoint generates rent records for ALL active tenants and marks overdue ones.
You need to call it **once a month automatically** without any login.

---

## Option 1: Vercel Cron (Easiest — Already Configured)

`vercel.json` already has:
```json
{ "path": "/api/cron/generate-rent", "schedule": "0 0 1 * *" }
```

> ⚠️ Vercel Cron requires the **Pro plan** ($20/mo).
> For free hosting, use one of the options below.

---

## Option 2: cron-job.org (100% Free ✅ Recommended)

1. Go to https://cron-job.org → Sign up free
2. Click **Create Cronjob**
3. Fill in:
   - **Title:** RentFlow Auto Rent
   - **URL:** `https://your-app.vercel.app/api/cron/generate-rent`
   - **Schedule:** Custom → Day of month: `1`, Hour: `0`, Minute: `0`
     (Runs on 1st of every month at midnight)
4. Under **Headers**, add:
   - Header name: `x-cron-secret`
   - Header value: your `CRON_SECRET` from `.env`
5. Save → Enable

That's it. Runs automatically forever, no login needed.

---

## Option 3: GitHub Actions (Free with GitHub ✅)

Create `.github/workflows/cron.yml` in your repo:

```yaml
name: Monthly Rent Generation

on:
  schedule:
    - cron: '0 0 1 * *'   # 1st of every month at midnight UTC
  workflow_dispatch:        # Allow manual trigger from GitHub UI

jobs:
  generate-rent:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger rent generation
        run: |
          curl -X GET \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://your-app.vercel.app/api/cron/generate-rent
```

Then go to GitHub repo → Settings → Secrets → Actions → Add:
- Name: `CRON_SECRET`
- Value: same as your `.env` CRON_SECRET

**Benefits:**
- 100% free
- You can manually trigger from GitHub Actions tab anytime
- Logs stored in GitHub

---

## Option 4: EasyCron (Free tier available)

1. Go to https://www.easycron.com → Sign up
2. Add cron job:
   - URL: `https://your-app.vercel.app/api/cron/generate-rent`
   - Schedule: `0 0 1 * *`
   - HTTP Headers: `x-cron-secret: your-secret`

---

## Testing Your Cron Endpoint

You can manually test it anytime:

```bash
# Without secret (if CRON_SECRET not set)
curl https://your-app.vercel.app/api/cron/generate-rent

# With secret
curl -H "x-cron-secret: your-secret" \
  https://your-app.vercel.app/api/cron/generate-rent
```

Expected response:
```json
{
  "success": true,
  "totalTenants": 5,
  "recordsCreated": 5,
  "overdueUpdated": 2,
  "executionMs": 342,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## My Recommendation

**Use cron-job.org** — it's completely free, no credit card, reliable, and takes 2 minutes to set up.

Or if you already use GitHub, use **GitHub Actions** — even easier since your code is already there.

---

## What happens when cron runs

1. Fetches all ACTIVE tenants across all landlords
2. For each tenant, creates a rent record for the current month (if not already exists)
3. Marks any PENDING records past their due date as OVERDUE
4. Returns a JSON summary of what was done

The owner doesn't need to be logged in. It runs in the background silently.

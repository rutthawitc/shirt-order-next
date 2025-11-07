# Upstash Redis - Quick Start (5 Minutes)

The fastest way to get Redis working with your Vercel deployment.

## Step 1: Create Upstash Account (1 min)

1. Go to: **https://console.upstash.com**
2. Click **"Sign up"** (use GitHub for fastest signup)
3. Verify email if required

## Step 2: Create Redis Database (2 min)

1. Click **"Create Database"**
2. Fill in:
   - **Name**: `shirt-order-redis`
   - **Type**: Regional
   - **Region**: `ap-southeast-1` (Singapore - closest to Thailand)
   - **TLS**: ✅ Enabled
3. Click **"Create"**

## Step 3: Copy Your Redis URL (1 min)

On the database details page:

1. Find the **"Connect your database"** section
2. Click on **"ioredis"** tab
3. Copy the connection string that looks like:
   ```
   redis://default:AbC123...@region-name-12345.upstash.io:6379
   ```

## Step 4: Add to Vercel (1 min)

### Option A: Using Vercel CLI
```bash
vercel env add REDIS_URL
# Paste your Redis URL when prompted
# Select: Production, Preview, Development (all)
```

### Option B: Using Vercel Dashboard
1. Go to: **https://vercel.com/dashboard**
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Set:
   - **Key**: `REDIS_URL`
   - **Value**: (paste your Upstash URL)
   - **Environments**: Check all boxes
6. Click **"Save"**

## Step 5: Redeploy

```bash
# Trigger a new deployment for the env var to take effect
git commit --allow-empty -m "Trigger redeploy with Redis"
git push
```

Or click **"Redeploy"** in Vercel dashboard.

## ✅ Done!

Check your deployment logs. You should see:
```
[Redis] Connected successfully
[Redis] Ready to accept commands
```

## Test It

1. Go to your admin dashboard: `https://yourdomain.com/admin`
2. Click **"Toggle Order Status"**
3. Refresh the page
4. Status should persist! 🎉

## Free Tier Limits

- 10,000 commands/day (more than enough!)
- 256 MB storage
- No credit card required

## Troubleshooting

**Not connecting?**
- Check the `REDIS_URL` in Vercel env vars (no typos?)
- Make sure you redeployed after adding the variable
- Check Vercel logs for error messages

**Still not working?**
- See detailed troubleshooting in [REDIS_SETUP.md](./REDIS_SETUP.md)

---

Need more details? See [REDIS_SETUP.md](./REDIS_SETUP.md)

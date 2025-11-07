# Redis Setup Guide

This guide explains how to set up Redis for the Shirt Order Next application. We recommend using **Upstash Redis** for Vercel deployments due to its serverless-optimized architecture and generous free tier.

## Why Upstash Redis?

- ✅ **Free Tier**: 10,000 commands/day, sufficient for most applications
- ✅ **Serverless Optimized**: Built for edge computing and serverless functions
- ✅ **Low Latency**: Global edge network with multiple regions
- ✅ **Vercel Integration**: Native integration with Vercel
- ✅ **No Cold Starts**: Instant connections, no connection pooling needed
- ✅ **Pay-as-you-go**: Scale automatically with your application

## Option 1: Upstash Redis (Recommended)

### Step 1: Create Upstash Account

1. Go to [Upstash Console](https://console.upstash.com)
2. Sign up with GitHub, Google, or email
3. Verify your email if required

### Step 2: Create a Redis Database

1. Click **"Create Database"** button
2. Configure your database:
   - **Name**: `shirt-order-redis` (or your preferred name)
   - **Type**: Select **Regional** (cheaper) or **Global** (faster globally)
   - **Region**: Choose closest to your users
     - For Thailand/Asia: `ap-southeast-1` (Singapore)
     - For US: `us-east-1` (Virginia)
     - For Europe: `eu-west-1` (Ireland)
   - **TLS**: Keep enabled (recommended)
   - **Eviction**: Select **No Eviction** (default)

3. Click **"Create"**

### Step 3: Get Your Redis URL

After creating the database, you'll see the database details page:

1. Scroll to **"REST API"** section
2. Copy the **"UPSTASH_REDIS_REST_URL"** (for REST API)

   **OR**

   Scroll to **"Redis Clients"** section and copy the connection string format:
   ```
   redis://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:PORT
   ```

**Example:**
```
redis://default:AZBgASQgYmY4Nzc5MmYtNjQyZC00MTVjLWJm...@usw1-stirring-puma-12345.upstash.io:6379
```

### Step 4: Configure Environment Variables

#### For Local Development

Add to your `.env.local` file:

```env
# Upstash Redis
REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
```

#### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Key**: `REDIS_URL`
   - **Value**: Your Upstash Redis URL (from Step 3)
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for changes to take effect

### Step 5: Test the Connection

1. Deploy or redeploy your application
2. Check the logs in Vercel:
   - Look for `[Redis] Connected successfully`
   - Look for `[Redis] Ready to accept commands`
3. Test the order toggle feature in admin dashboard

## Option 2: Redis Cloud (Alternative)

If you prefer Redis Cloud (formerly Redis Labs):

### Step 1: Create Redis Cloud Account

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Sign up for a free account
3. Verify your email

### Step 2: Create Database

1. Click **"New Database"**
2. Select **Free Plan** (30MB, sufficient for this app)
3. Configure:
   - **Cloud Provider**: AWS, GCP, or Azure
   - **Region**: Choose closest to your Vercel region
   - **Database Name**: `shirt-order-db`
4. Click **"Activate"**

### Step 3: Get Connection Details

1. Go to your database dashboard
2. Copy the **Endpoint** (hostname and port)
3. Copy the **Default user password**
4. Format as: `redis://default:PASSWORD@ENDPOINT:PORT`

**Example:**
```
redis://default:abc123XYZ@redis-12345.c1.us-east-1-2.ec2.redns.redis-cloud.com:12345
```

### Step 4: Configure Environment Variables

Same as Upstash (see Option 1, Step 4)

## Option 3: Local Redis (Development Only)

For local development and testing:

### Install Redis

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Windows:**
- Download from [Redis for Windows](https://github.com/tporadowski/redis/releases)
- Or use WSL2 and follow Ubuntu instructions

### Configure Environment Variables

Add to `.env.local`:
```env
REDIS_URL=redis://localhost:6379
```

**Note:** This only works locally and won't work on Vercel deployment.

## Testing Your Redis Connection

### Method 1: Check Application Logs

After deployment, check Vercel logs for:

```
✅ Success messages:
[Redis] Connected successfully
[Redis] Ready to accept commands

❌ Error messages:
[Redis] REDIS_URL not provided - using in-memory fallback
[Redis] Connection error: <error message>
[Redis] Failed to connect: <error message>
```

### Method 2: Test Order Toggle Feature

1. Log in to admin dashboard
2. Click the **"Toggle Order Status"** button
3. Refresh the main order page
4. Verify the status changed

If Redis is working, the status will persist. If using in-memory fallback, status resets on serverless function restart.

### Method 3: Manual Redis Test (Upstash)

Using Upstash Console:

1. Go to your database dashboard
2. Click **"CLI"** tab
3. Run test commands:
   ```redis
   SET ordersClosed "true"
   GET ordersClosed
   ```
4. Should return: `"true"`

## Troubleshooting

### Issue: "REDIS_URL not provided" Warning

**Solution:**
- Verify `REDIS_URL` is set in Vercel environment variables
- Redeploy after adding the variable
- Check variable is enabled for the correct environment (Production/Preview)

### Issue: Connection Timeout Errors

**Solution:**
- Verify Redis endpoint is accessible
- Check if Redis database is active (not paused)
- Ensure TLS is enabled in connection string if required
- Try changing Redis region closer to Vercel deployment

### Issue: Authentication Failed

**Solution:**
- Double-check password in connection string
- Ensure no extra spaces or special characters are escaped
- For Upstash, regenerate the password if needed

### Issue: In-Memory Fallback Being Used

**Symptoms:**
- Order toggle status resets after deployment
- Logs show "using in-memory fallback"

**Solution:**
- This means Redis connection failed or URL not provided
- Check Vercel logs for specific error messages
- Verify `REDIS_URL` environment variable is set correctly
- Ensure Redis server is running and accessible

### Issue: ENOTFOUND or DNS Resolution Errors

**Solution:**
- Check the Redis endpoint hostname is correct
- Verify DNS is resolving (try ping from your local machine)
- For Redis Cloud, ensure database is active (free tier may pause inactive databases)
- Try using REST API connection instead of direct Redis protocol

## Upstash Redis Free Tier Limits

| Feature | Free Tier Limit |
|---------|----------------|
| Daily Commands | 10,000 |
| Max Connections | 100 concurrent |
| Max Database Size | 256 MB |
| Data Persistence | Included |
| TLS/SSL | Included |
| REST API | Included |

**For this application:**
- Each order toggle: ~2 commands (GET + SET)
- Expected daily usage: <1,000 commands for typical use
- **Free tier is more than sufficient** 🎉

## Upgrade Options

If you exceed free tier limits:

**Upstash Redis:**
- **Pay-as-you-go**: $0.2 per 100K commands
- **Pro**: Starting at $10/month for higher limits

**Redis Cloud:**
- **Fixed Plans**: Starting at $5/month for 250MB
- **Flexible Plans**: Pay for what you use

## Best Practices

1. **Monitor Usage**: Check Upstash dashboard regularly
2. **Set Alerts**: Enable email alerts for approaching limits
3. **Use TTL**: Set expiration on temporary data (not needed for this app)
4. **Connection Pooling**: Already handled by our implementation
5. **Error Handling**: Already implemented with graceful fallback

## Next Steps

After setting up Redis:

1. ✅ Set `REDIS_URL` in Vercel
2. ✅ Redeploy your application
3. ✅ Check logs for successful connection
4. ✅ Test order toggle feature
5. ✅ Monitor Upstash dashboard for usage
6. 🎉 Enjoy persistent order status!

## Alternative: Run Without Redis

The application will work without Redis using in-memory storage:

**Pros:**
- No external dependencies
- No cost
- Simpler setup

**Cons:**
- Order toggle status resets on serverless function restart
- Each Vercel region has separate state
- Not suitable for production use

To use in-memory mode, simply don't set the `REDIS_URL` environment variable.

---

## Support

- **Upstash Docs**: https://docs.upstash.com/redis
- **Redis Cloud Docs**: https://docs.redis.com/latest/rc/
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables

For issues with this application, check the main [README.md](./README.md) or open an issue on GitHub.

# Database Setup Guide

This guide explains how to set up the Supabase database for the Shirt Order Next application.

## Prerequisites

- A Supabase account ([supabase.com](https://supabase.com))
- A Supabase project created

## Setup Instructions

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project at https://app.supabase.com
   - Navigate to **SQL Editor** in the left sidebar

2. **Execute the Schema**
   - Click **New Query**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste into the SQL editor
   - Click **Run** or press `Ctrl/Cmd + Enter`

3. **Verify Tables Created**
   - Navigate to **Table Editor** in the left sidebar
   - You should see two tables:
     - `orders`
     - `order_items`

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push --db-url your-connection-string < supabase-schema.sql
```

## Database Schema Overview

### Tables

#### 1. `orders` Table
Stores customer order information.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key (auto-increment) |
| name | VARCHAR(255) | Customer name |
| address | TEXT | Delivery address (required if not pickup) |
| is_pickup | BOOLEAN | Whether customer will pickup at event |
| total_price | DECIMAL(10,2) | Total order amount in THB |
| slip_image | TEXT | URL to payment slip image |
| status | VARCHAR(50) | Order status (see values below) |
| created_at | TIMESTAMP | Auto-generated creation time |
| updated_at | TIMESTAMP | Auto-updated modification time |

**Status Values:**
- `pending` - รอตรวจสอบ (Waiting for verification)
- `confirmed` - ยืนยันการชำระเงิน (Payment confirmed)
- `processing` - กำลังจัดส่ง (Processing/Shipping)
- `completed` - จัดส่งแล้ว (Delivered)
- `cancelled` - ยกเลิก (Cancelled)

#### 2. `order_items` Table
Stores individual items in each order.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key (auto-increment) |
| order_id | BIGINT | Foreign key to orders.id |
| design | VARCHAR(10) | Shirt design ('1', '2', '3', or '4') |
| size | VARCHAR(10) | Shirt size (S to 6XL) |
| quantity | INTEGER | Quantity (1-5) |
| price_per_unit | DECIMAL(10,2) | Price per item in THB |
| created_at | TIMESTAMP | Auto-generated creation time |

**Design Values:**
- `'1'` - Long sleeve work shirt (750 THB)
- `'2'` - Short sleeve work shirt (700 THB)
- `'3'` - Combo pack (1,100 THB)
- `'4'` - Souvenir shirt (500 THB)

**Size Values:**
- `S`, `M`, `L`, `XL`, `2XL`, `3XL`, `4XL`, `5XL`, `6XL`

### Indexes

Performance indexes are created on:
- `orders.status`
- `orders.created_at`
- `orders.is_pickup`
- `order_items.order_id`
- `order_items.design`
- `order_items.size`

### Views

Two helpful views are created:

1. **`orders_summary`** - Orders with item counts
2. **`size_distribution`** - Size distribution across all orders

## Environment Variables

After creating the database, update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in:
- Supabase Dashboard → Project Settings → API

## Row Level Security (RLS)

The schema includes commented-out RLS policies. To enable them:

1. Uncomment the RLS section in `supabase-schema.sql`
2. Customize the policies based on your authentication setup
3. Run the SQL commands in Supabase SQL Editor

⚠️ **Note:** Currently, the application does NOT use RLS. API routes are publicly accessible. Consider implementing proper authentication and RLS for production use.

## Testing the Setup

### 1. Check Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('orders', 'order_items');
```

### 2. View Table Structure

```sql
-- Orders table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Order items table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;
```

### 3. Insert Test Data (Optional)

Uncomment the sample data section in `supabase-schema.sql` to insert test orders.

### 4. Query Test Data

```sql
-- Get all orders with items
SELECT o.*,
       json_agg(oi.*) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;
```

## Common Queries

### Get Orders by Status

```sql
SELECT * FROM orders
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Get Inventory Needs

```sql
SELECT design, size, SUM(quantity) as total_needed
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN ('pending', 'confirmed', 'processing')
GROUP BY design, size
ORDER BY design, size;
```

### Get Revenue by Status

```sql
SELECT status,
       COUNT(*) as order_count,
       SUM(total_price) as total_revenue
FROM orders
GROUP BY status;
```

### Get Recent Orders (Last 24 Hours)

```sql
SELECT * FROM orders
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Troubleshooting

### Issue: Tables Not Created
- Check for SQL syntax errors in the output
- Ensure you have proper permissions in Supabase
- Try creating tables one at a time

### Issue: Foreign Key Constraint Errors
- Make sure `orders` table is created before `order_items`
- Check that `order_id` references exist when inserting items

### Issue: Connection Errors
- Verify your Supabase URL and anon key
- Check that your IP is allowed in Supabase settings
- Ensure your Supabase project is active

### Issue: "violates check constraint valid_design" Error
If you see an error like `violates check constraint "valid_design"` when creating orders:

1. **Cause**: The `shirt_designs` table contains designs with invalid IDs (e.g., '001', '002') that don't match the constraint `design IN ('1', '2', '3', '4')`
2. **Fix**: Run the migration in `fix-shirt-design-ids.sql`:
   - Go to Supabase SQL Editor
   - Create a new query
   - Copy the contents of `fix-shirt-design-ids.sql`
   - Click Run
3. **Verify**: After running the migration, check that only designs with valid IDs exist:
   ```sql
   SELECT id, name, price FROM shirt_designs;
   ```
   Should show only designs with IDs: '1', '2', '3', '4'

### Issue: "null value in column back_image violates not-null constraint" Error
If you see this error when creating shirt designs:

1. **Cause**: The `shirt_designs` table was created with `back_image` as `NOT NULL`, but the back image is now optional
2. **Fix**: Run the migration in `update-back-image-nullable.sql`:
   - Go to Supabase SQL Editor
   - Create a new query
   - Copy the contents of `update-back-image-nullable.sql`
   - Click Run
3. **Why**: This allows creating shirt designs with only a front image, supporting single-sided designs or designs where the back image isn't ready yet

## Migration Notes

This schema replaces the previous setup that may have used:
- ~~Vercel KV~~ → Now using Redis (ioredis)
- Manual table creation → Now using this SQL schema

## Security Recommendations

1. **Enable RLS** - Uncomment and customize RLS policies
2. **Add Authentication** - Implement proper auth for admin routes
3. **Limit Public Access** - Restrict which API routes are public
4. **Add API Keys** - Use API keys for sensitive operations
5. **Audit Logging** - Consider adding audit trail tables

## Next Steps

After setting up the database:

1. ✅ Run the SQL schema in Supabase
2. ✅ Update environment variables
3. ✅ Test the connection with `npm run dev`
4. ✅ Create a test order through the application
5. ✅ Verify data appears in Supabase Table Editor
6. ⚠️ Consider implementing RLS and authentication
7. ⚠️ Back up your database regularly

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/

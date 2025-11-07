# Migration Summary - Dynamic Shirt Design Management

This document summarizes the changes made to convert the shirt order system from static designs to dynamic database-driven designs.

## Overview

The system has been migrated from using hardcoded shirt designs in `src/constants/shirt-designs.ts` to a fully dynamic system where:
1. Shirt designs are stored in Supabase
2. Images are uploaded to and served from Cloudinary
3. Admins can add, edit, and delete designs through a web interface
4. Prices and design information are fetched from the database in real-time

Additionally, LINE Notify has been replaced with Telegram Bot API for notifications.

## Database Changes

### New Table: `shirt_designs`

Run the SQL migration file to create the table:

```bash
# Execute this in Supabase SQL Editor
supabase-shirt-designs-schema.sql
```

**Table Structure:**
- `id` (VARCHAR) - Design ID (e.g., '1', '2', '3')
- `name` (VARCHAR) - Design name in Thai
- `price` (DECIMAL) - Price in THB
- `description` (TEXT) - Design description
- `front_image` (TEXT) - Cloudinary URL for front image
- `back_image` (TEXT) - Cloudinary URL for back image
- `is_active` (BOOLEAN) - Whether design is available
- `display_order` (INTEGER) - Sort order
- `created_at` / `updated_at` (TIMESTAMP) - Timestamps

The migration includes initial data for existing designs (1-4).

## New Features

### 1. Admin Design Management Page

**Location:** `/admin/designs`

**Features:**
- View all shirt designs with thumbnails
- Add new designs with image upload
- Edit existing designs (update prices, descriptions, images)
- Delete/deactivate designs
- Reorder designs (display_order)
- Real-time preview of changes

**Access:** Protected by the same admin authentication as the dashboard

### 2. API Endpoints

#### GET `/api/shirt-designs`
- Fetches all active designs
- Returns transformed format compatible with ShirtDesign interface
- Public endpoint (used by order form)

#### POST `/api/shirt-designs`
- Creates new shirt design
- Uploads images to Cloudinary (folder: `shirt-designs`)
- Requires FormData with: id, name, price, description, frontImage, backImage, displayOrder

#### GET `/api/shirt-designs/[id]`
- Fetches single design by ID

#### PUT `/api/shirt-designs/[id]`
- Updates existing design
- Can update text fields and/or images
- Images are optional (only upload if changing)

#### DELETE `/api/shirt-designs/[id]`
- Soft delete (sets is_active = false)
- Design remains in database but won't appear in order form

### 3. Dynamic Order Form

**Changes to `ShirtOrderForm.tsx`:**
- Fetches designs from `/api/shirt-designs` on component mount
- No longer uses `SHIRT_DESIGNS` constant
- Displays designs dynamically based on database content
- Supports any number of designs (not limited to 4)

### 4. Dynamic Pricing

**Changes to `/api/orders/route.ts`:**
- Fetches current prices from database when order is created
- No more hardcoded `PRICE_MAP`
- Ensures orders always use current pricing

### 5. Telegram Notifications

**Changes to `src/lib/telegram.ts`:**
- Replaces LINE Notify completely
- Fetches design names from database for notifications
- Sends HTML-formatted messages with emojis
- Supports test/production environments

## Updated Files

### Modified Files:
1. **`.env.example`** - Updated environment variables for Telegram
2. **`src/app/actions/orders.ts`** - Telegram import
3. **`src/app/api/orders/route.ts`** - Dynamic pricing from database
4. **`src/components/ShirtOrderForm.tsx`** - Fetch designs dynamically
5. **`src/config/env.ts`** - Removed lineNotifyToken
6. **`src/types/order.ts`** - Added DBShirtDesign interface
7. **`CLAUDE.md`** - Updated documentation

### Deleted Files:
1. **`src/lib/line-notify.ts`** - Replaced by telegram.ts
2. **`src/types/line-notify.ts`** - No longer needed

### New Files:
1. **`supabase-shirt-designs-schema.sql`** - Database migration
2. **`src/app/admin/designs/page.tsx`** - Admin management UI
3. **`src/app/api/shirt-designs/route.ts`** - GET/POST endpoints
4. **`src/app/api/shirt-designs/[id]/route.ts`** - GET/PUT/DELETE endpoints
5. **`src/lib/shirt-designs.ts`** - Helper functions
6. **`src/lib/telegram.ts`** - Telegram Bot API
7. **`src/types/telegram.ts`** - Telegram types
8. **`CLAUDE.md`** - AI documentation
9. **`MIGRATION_SUMMARY.md`** - This file

## Setup Instructions

### 1. Run Database Migration

```sql
-- In Supabase SQL Editor, run:
-- File: supabase-shirt-designs-schema.sql
```

This will:
- Create the `shirt_designs` table
- Add indexes for performance
- Insert initial data for designs 1-4
- Set up auto-update triggers

### 2. Update Environment Variables

Update your `.env.local` file:

```env
# Remove these (LINE Notify):
# LINE_NOTIFY_TOKEN=...
# TEST_LINE_NOTIFY_TOKEN=...

# Add these (Telegram):
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
TEST_TELEGRAM_BOT_TOKEN=your-test-bot-token
TEST_TELEGRAM_CHAT_ID=your-test-chat-id
```

**Getting Telegram Credentials:**
1. Create bot: Talk to [@BotFather](https://t.me/botfather) → `/newbot`
2. Get chat ID: Talk to [@userinfobot](https://t.me/userinfobot)

### 3. Test the System

1. **Start dev server:**
   ```bash
   yarn dev
   ```

2. **Test order form:**
   - Visit `http://localhost:3000`
   - Verify designs load from database
   - Create a test order

3. **Test admin panel:**
   - Visit `http://localhost:3000/admin/designs`
   - Try adding a new design (design ID '5')
   - Upload test images
   - Verify design appears in order form

4. **Test Telegram:**
   - Place an order
   - Check if notification arrives in Telegram
   - Update order status in admin dashboard
   - Verify status update notification

## Migration Notes

### Backwards Compatibility

The old `src/constants/shirt-designs.ts` file is **still used** for one thing:
- `SIZES` array (S, M, L, XL, etc.)

You may want to move sizes to the database in the future, but for now they remain static.

### Image Migration

Existing images are referenced by relative paths (`/images/shirts/design-X/...`). These work because:
1. Initial migration inserts these paths
2. Next.js serves them from `public/` folder

**For new designs:** Images are uploaded to Cloudinary and stored as full URLs.

**Optional:** You can migrate existing images to Cloudinary by:
1. Uploading them manually to Cloudinary
2. Updating the database URLs via admin panel

### Design ID Format

Design IDs are **strings** ('1', '2', '3'), not numbers. This maintains compatibility with existing orders in the database.

When adding new designs, use string IDs: '5', '6', '7', etc.

## Testing Checklist

- [ ] Database migration executed successfully
- [ ] Environment variables updated
- [ ] Order form displays designs from database
- [ ] Can add new design via admin panel
- [ ] Can edit existing design
- [ ] Can delete design (soft delete)
- [ ] New design appears in order form
- [ ] Order creation uses current database prices
- [ ] Telegram notification sent on new order
- [ ] Telegram notification sent on status update
- [ ] Design names in notifications match database

## Rollback Plan

If you need to rollback:

1. **Revert code changes:**
   ```bash
   git checkout main
   ```

2. **No database rollback needed** - the new table won't interfere with the old code

3. **Update environment variables** - restore LINE_NOTIFY_TOKEN if needed

## Future Enhancements

1. **Move sizes to database** - Make size options dynamic per design
2. **Design variants** - Support color/style variations
3. **Inventory management** - Track stock levels
4. **Design categories** - Group designs by type
5. **Bulk image upload** - Upload multiple designs at once
6. **Image optimization** - Auto-resize and compress uploads
7. **Design preview** - Show design before publishing
8. **Design scheduling** - Set start/end dates for designs

## Support

For issues or questions:
1. Check the database table exists: `SELECT * FROM shirt_designs;`
2. Verify Cloudinary credentials in `.env.local`
3. Check browser console for API errors
4. Review server logs for upload errors

---

**Created:** 2025-01-07
**Branch:** `north-tt-shirt`
**Author:** Claude Code

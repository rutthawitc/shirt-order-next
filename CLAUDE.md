# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 15 e-commerce order management system for the Tiger Thailand Meeting 2025 event. Customers can browse 4 shirt designs, place orders with payment slips, and choose delivery methods. Administrators manage orders through a dashboard with Telegram notifications.

## Essential Commands

### Development
```bash
yarn dev              # Standard development server (localhost:3000)
yarn dev:test         # Development with NODE_ENV=development flag
```

### Production
```bash
yarn build           # Production build
yarn build:test      # Build with NODE_ENV=development flag
yarn start           # Start production server
yarn start:test      # Start with test environment
```

### Package Management
This project uses **Yarn 1.22.22** (specified in packageManager). Use `yarn` not `npm`.

## Architecture & Data Flow

### 1. State Management Architecture
The application uses a **distributed state management pattern** with Redis:

- **Redis (ioredis)**: Stores global order acceptance status (orders open/closed)
- **Supabase (PostgreSQL)**: Persistent storage for orders and order items
- **Fallback behavior**: Redis client has graceful degradation - if Redis is unavailable, the app continues functioning with in-memory fallback

Key file: [src/lib/redis.ts](src/lib/redis.ts) implements lazy connection with error handling and automatic reconnection.

### 2. Image Upload Flow
Images follow a specific upload and storage pattern:

1. Customer uploads payment slip (File object in browser)
2. File is sent via FormData to `/api/orders` POST endpoint
3. Server converts to Buffer and streams to Cloudinary
4. Cloudinary returns secure_url
5. URL stored in Supabase `orders.slip_image`

Key files:
- [src/app/api/orders/route.ts](src/app/api/orders/route.ts) - Upload handling
- [src/lib/cloudinary.ts](src/lib/cloudinary.ts) - Cloudinary client configuration

### 3. Notification System
Telegram Bot integration sends real-time notifications:

- **New orders**: Triggered after successful order creation with order details and payment slip image
- **Status updates**: Triggered via Server Action when admin changes order status

**Environment-aware notifications**:
- Uses `TEST_TELEGRAM_BOT_TOKEN` and `TEST_TELEGRAM_CHAT_ID` when NODE_ENV=development
- Uses `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in production
- Notification messages prefixed with `🧪 [ทดสอบ]` in test mode
- Messages formatted with HTML for better readability

Key file: [src/lib/telegram.ts](src/lib/telegram.ts)

### 4. Admin Authentication Pattern
Simple cookie-based authentication (NOT using NextAuth):

- Login form submits to `/api/admin/login`
- Server validates against `ADMIN_PASSWORD` environment variable
- Sets `admin_authenticated` cookie on success
- [middleware.ts](middleware.ts) protects all `/admin/*` routes (except `/admin/login`)
- No JWT, no sessions, no user database

**Security note**: This is a minimal auth implementation. Password is plain text in env vars. Consider upgrading for production.

### 5. Order Status Workflow
Orders follow a 5-stage lifecycle managed through Server Actions:

```
pending → confirmed → processing → completed
                ↓
            cancelled
```

Status updates trigger:
1. Supabase update via [src/app/actions/orders.ts](src/app/actions/orders.ts) `updateOrderStatus()`
2. Telegram notification to admin
3. Page revalidation using `revalidatePath('/admin', 'page')`

### 6. Product Pricing System
Shirt designs have fixed prices defined in multiple locations:

- [src/constants/shirt-designs.ts](src/constants/shirt-designs.ts) - Client-side display
- [src/app/api/orders/route.ts](src/app/api/orders/route.ts) - Server-side validation (PRICE_MAP)

**Design IDs and prices** (as of Jan 2025):
- '1': 750 THB (Long sleeve work shirt)
- '2': 700 THB (Short sleeve work shirt)
- '3': 1100 THB (Combo pack)
- '4': 500 THB (Souvenir shirt)

**Important**: When changing prices, update BOTH locations to maintain consistency.

### 7. Database Schema Relationships

```
orders (parent)
  ├── id (BIGSERIAL PK)
  ├── status (VARCHAR: pending|confirmed|processing|completed|cancelled)
  └── slip_image (TEXT: Cloudinary URL)

order_items (child)
  ├── order_id (FK → orders.id)
  ├── design (VARCHAR: '1'|'2'|'3'|'4')
  ├── size (VARCHAR: S|M|L|XL|2XL|3XL|4XL|5XL|6XL)
  └── price_per_unit (DECIMAL)
```

- One-to-many relationship: One order has many items
- No RLS policies enabled (see security considerations)
- Indexes on: status, created_at, order_id, design, size

Database setup guide: [DATABASE_SETUP.md](DATABASE_SETUP.md)

### 8. Combo Products System
The application supports **combo products** - bundled shirt designs that are sold together but tracked individually for inventory purposes.

#### How It Works
When a customer orders a combo product (e.g., Design #3 - Combo Pack), the system:
1. Shows and charges for the combo as a single product
2. Stores the order with the combo design ID in the database
3. Automatically splits the combo into component products during export/reporting

**Example**: Design #3 (เสื้อแขนสั้น +เสื้อแขนยาว แพคคู่) splits into:
- 1x Design #1 (Long sleeve work shirt)
- 1x Design #2 (Short sleeve work shirt)

#### Database Schema

```
shirt_designs
  ├── is_combo (BOOLEAN) - Flag indicating if design is a combo product

shirt_combo_components (new table)
  ├── combo_design_id (VARCHAR FK → shirt_designs.id)
  ├── component_design_id (VARCHAR FK → shirt_designs.id)
  └── quantity_multiplier (INT) - How many of this component per combo
```

**Migration file**: [add-combo-products.sql](add-combo-products.sql)

#### Key Files
- [src/lib/combo-products.ts](src/lib/combo-products.ts) - Utility functions for fetching and processing combo relationships
- [src/app/api/orders/export/route.ts](src/app/api/orders/export/route.ts) - Export logic that splits combos into components
- [src/types/order.ts](src/types/order.ts) - TypeScript interfaces (ComboComponent, DBShirtDesign with is_combo)

#### Utility Functions

```typescript
// Fetch all combo relationships from database
const comboMap = await getComboRelationships()
// Returns: Map { '3' => [{ component: '1', multiplier: 1 }, { component: '2', multiplier: 1 }] }

// Check if a design is a combo
const isCombo = await isComboProduct('3')  // Returns: true

// Get components for a specific combo
const components = await getComboComponents('3')
// Returns: [{ component: '1', multiplier: 1 }, { component: '2', multiplier: 1 }]

// Expand combo items for inventory reporting
const expanded = await expandComboItems(orderItems)
```

#### Adding New Combo Products

1. **Insert combo relationship in database** (via Supabase SQL Editor):
   ```sql
   -- Mark the design as a combo
   UPDATE shirt_designs SET is_combo = TRUE WHERE id = '5';

   -- Define the components
   INSERT INTO shirt_combo_components (combo_design_id, component_design_id, quantity_multiplier)
   VALUES
     ('5', '1', 2),  -- Combo #5 includes 2x Design #1
     ('5', '4', 1);  -- Combo #5 includes 1x Design #4
   ```

2. **No code changes needed** - The export and reporting logic automatically picks up the new combo from the database.

#### Important Notes
- **Combo products are filtered out** of the size summary sheet in Excel exports - only component designs appear
- **Quantity multipliers** allow flexible combos (e.g., 2x Design 1 + 1x Design 2)
- **Foreign key constraints** ensure data integrity - components must reference valid designs
- **Cascade deletion** - If a design is deleted, related combo components are automatically removed
- **Graceful degradation** - If combo fetch fails, the system continues without combo splitting

#### Design Decisions
- **Database-driven configuration**: No code changes needed for new combos (previously hardcoded)
- **Split at export time**: Combos remain as single items in orders table for customer clarity
- **Component-only inventory**: Excel size summary shows only components, not combo products

## Key Technical Patterns

### Environment Configuration
Centralized in [src/config/env.ts](src/config/env.ts):
- All required env vars accessed through `env` object
- `env.isTestEnvironment` determines test/production behavior
- Throws at import time if required vars missing

### Form Handling
- **React Hook Form** + **Zod** validation for all forms
- Type-safe form submission with proper error handling
- FormData for file uploads (payment slips)

### Server Components & Actions
- Pages use React Server Components (Next.js 15 App Router)
- Admin status updates use Server Actions (see [src/app/actions/orders.ts](src/app/actions/orders.ts))
- API routes for CRUD operations (see [src/app/api/orders/route.ts](src/app/api/orders/route.ts))

### Component Library
- **shadcn/ui** components in [src/components/ui/](src/components/ui/)
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Configuration in [components.json](components.json)

## Development Notes

### Thai Language UI
All customer-facing text is in Thai. When modifying UI text:
- Maintain Thai language for customer pages
- Admin dashboard uses Thai
- Status labels have Thai translations (see [src/lib/telegram.ts](src/lib/telegram.ts) `getStatusLabel()`)

### Test Environment Features
When `NODE_ENV=development`:
- Uses `TEST_TELEGRAM_BOT_TOKEN` and `TEST_TELEGRAM_CHAT_ID` for notifications
- Shows test environment banner on pages (see `TestEnvironmentBanner` component)
- Notifications prefixed with `🧪 [ทดสอบ]`

### Image Assets
Shirt design images located in `public/images/shirts/`:
```
design-1/  → Long sleeve (front.jpg, back.jpg)
design-2/  → Short sleeve (front.jpg, back.jpg)
design-3/  → Combo pack (front.jpg, back.jpg)
design-4/  → Souvenir (front.jpg, back.jpg)
```

### Admin Features
- Excel export endpoint: `/api/orders/export`
- Generates 3 sheets: Orders, Order Items, Size Summary
- Uses `xlsx` library for generation
- Toggle order acceptance: `/api/orders/toggle-status` (reads/writes to Redis)

## Security Considerations

⚠️ **Current Limitations**:
- No API authentication on public order endpoints
- Admin password stored as plain text in environment variable
- No rate limiting on order creation
- No CSRF protection
- Row Level Security (RLS) not enabled in Supabase

When implementing security improvements:
1. Add API authentication layer before order endpoints
2. Implement proper session management (consider NextAuth.js)
3. Enable RLS policies (commented in database schema)
4. Add rate limiting using Redis or Upstash Rate Limit
5. Validate and sanitize all user inputs (Zod validation already in place)

## Common Development Tasks

### Adding a New Shirt Design
1. Add design to [src/constants/shirt-designs.ts](src/constants/shirt-designs.ts)
2. Update PRICE_MAP in [src/app/api/orders/route.ts](src/app/api/orders/route.ts)
3. Update type definitions in [src/types/order.ts](src/types/order.ts)
4. Add images to `public/images/shirts/design-X/`
5. Update Telegram notification text in [src/lib/telegram.ts](src/lib/telegram.ts) `getDesignName()`

### Modifying Order Status Values
1. Update database status column constraint (if needed)
2. Update TypeScript types in [src/types/order.ts](src/types/order.ts)
3. Update status label mappings in [src/lib/telegram.ts](src/lib/telegram.ts)
4. Update admin dashboard status display logic

### Debugging Redis Issues
- Check connection logs in server console
- Redis client implements graceful degradation
- If Redis fails, order toggle feature won't persist across server restarts
- Use `getRedis()` function to get current Redis instance

### Testing Payment Slip Uploads
- Use test images < 10MB (Cloudinary free tier limit)
- Supported formats: JPG, PNG, GIF
- Check Cloudinary dashboard for uploaded images
- Cloudinary folder: `shirt-order-slips/`

## TypeScript Notes

- Strict mode enabled
- Type definitions in `src/types/` directory
- Key types:
  - `Order`: Complete order with items
  - `OrderItem`: Cart item before submission
  - `DBOrderItem`: Database order item with price
  - `ShirtDesign`: Product catalog item
  - `CreateOrderItem`: Order item for API submission

## Deployment Configuration

- Uses standalone output mode (`output: "standalone"` in [next.config.ts](next.config.ts))
- Compatible with Docker, Vercel, Netlify, AWS Amplify
- Cloudinary remote pattern configured for `res.cloudinary.com/dbkdy9jfe/**`
- Requires environment variables configured in deployment platform

## External Service Dependencies

1. **Supabase**: PostgreSQL database (required)
2. **Cloudinary**: Image hosting (required)
3. **Redis**: State management (optional, falls back to in-memory)
4. **Telegram Bot API**: Push notifications (optional, fails gracefully)

Service clients initialized in `src/lib/` directory.

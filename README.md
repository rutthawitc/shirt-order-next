# 🎽 Shirt Order Next

A modern e-commerce order management system for the **Tiger Thailand Meeting 2025** event, built with Next.js 15 and React 19. This application enables customers to browse shirt designs, place orders, upload payment slips, and choose delivery methods, while providing administrators with a comprehensive dashboard for order management.

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.16-38B2AC?style=flat-square&logo=tailwind-css)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Security Considerations](#-security-considerations)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Customer Features
- 🛍️ **Product Catalog**: Browse 4 shirt designs with front/back images
- 📏 **Size Selection**: Sizes from S to 6XL with visual size guides
- 🧮 **Smart Cart**: Dynamic price calculation and quantity selection (1-5 per item)
- 🚚 **Delivery Options**: Choose between event pickup or free home delivery
- 💳 **Payment System**: Bank transfer with payment slip upload
- 📱 **Responsive Design**: Fully mobile-friendly Thai language interface
- ⏰ **Order Status**: Real-time order acceptance status

### Admin Features
- 🔐 **Secure Login**: Password-protected admin dashboard
- 📊 **Order Management**: View and manage all orders in a sortable table
- 🔄 **Status Updates**: 5-stage order status workflow with LINE notifications
- 🖼️ **Payment Verification**: View payment slips in modal dialogs
- 📤 **Excel Export**: Export orders to Excel with 3 sheets (orders, items, size summary)
- 🎚️ **Order Toggle**: Open/close order acceptance system-wide
- 🔔 **LINE Integration**: Automatic notifications for new orders and status updates

### Technical Features
- ⚡ **Next.js 15 App Router**: Modern React Server Components
- 🎨 **shadcn/ui**: Beautiful, accessible component library
- 🗄️ **Supabase**: PostgreSQL database with real-time capabilities
- 💾 **Redis**: Distributed state management for order status
- ☁️ **Cloudinary**: Cloud-based image storage and optimization
- 📨 **LINE Notify**: Real-time notifications to LINE messenger
- ✅ **Type Safety**: Full TypeScript with strict mode
- 🎯 **Form Validation**: React Hook Form + Zod schema validation

## 🛠 Tech Stack

### Frontend
- **Next.js 15.1.0** - React framework with App Router
- **React 19.0.0** - UI library with concurrent features
- **TypeScript 5.7.2** - Type-safe JavaScript
- **Tailwind CSS 3.4.16** - Utility-first CSS framework
- **shadcn/ui** - Component library based on Radix UI
- **React Hook Form 7.54.0** - Form state management
- **Zod 3.24.1** - Schema validation
- **TanStack Table 8.20.5** - Powerful table component

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database
- **Redis (ioredis)** - Session state management
- **Cloudinary** - Image hosting and optimization

### Integrations
- **LINE Notify API** - Push notifications
- **Vercel Speed Insights** - Performance monitoring

### Development Tools
- **ESLint 9.16.0** - Code linting
- **Autoprefixer** - CSS vendor prefixes
- **PostCSS** - CSS processing

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17.0 or higher
- **Yarn** 1.22.22 (preferred) or npm
- **Git** for version control

You'll also need accounts for:
- [Supabase](https://supabase.com) - Database
- [Cloudinary](https://cloudinary.com) - Image storage
- [LINE Notify](https://notify-bot.line.me/) - Notifications (optional)
- Redis server or [Upstash](https://upstash.com) - State management

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rutthawitc/shirt-order-next.git
   cd shirt-order-next
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values (see [Environment Variables](#-environment-variables))

4. **Set up the database**

   Follow the instructions in [DATABASE_SETUP.md](./DATABASE_SETUP.md)

5. **Run the development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ============================================
# Database - Supabase
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ============================================
# State Management - Redis
# ============================================
# Production Redis URL (e.g., Upstash, AWS ElastiCache)
REDIS_URL=redis://default:password@host:port

# ============================================
# Image Storage - Cloudinary
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# Notifications - LINE Notify
# ============================================
# Production LINE Notify token
LINE_NOTIFY_TOKEN=your-production-token

# Development/Test LINE Notify token
TEST_LINE_NOTIFY_TOKEN=your-test-token

# ============================================
# Admin Authentication
# ============================================
# Password for admin dashboard access
ADMIN_PASSWORD=your-secure-admin-password

# ============================================
# Optional Configuration
# ============================================
# API base URL (defaults to current domain)
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Node environment (development, production, test)
NODE_ENV=development
```

### How to Get Your Keys

**Supabase:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to Settings → API
4. Copy the URL and anon/public key

**Cloudinary:**
1. Go to [Cloudinary Console](https://console.cloudinary.com)
2. Dashboard will show your Cloud Name, API Key, and API Secret

**LINE Notify:**
1. Go to [LINE Notify](https://notify-bot.line.me/my/)
2. Click "Generate token"
3. Select the chat room and generate

**Redis:**
1. For Upstash: [Upstash Console](https://console.upstash.com) → Create database → Copy Redis URL
2. For local: Use `redis://localhost:6379`

## 💾 Database Setup

The application uses **Supabase (PostgreSQL)** as its database.

### Quick Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the SQL schema**:
   - Open your Supabase Dashboard
   - Navigate to SQL Editor
   - Copy the contents of `supabase-schema.sql`
   - Paste and execute

3. **Verify tables created**:
   - Go to Table Editor
   - You should see `orders` and `order_items` tables

For detailed instructions, troubleshooting, and schema documentation, see [DATABASE_SETUP.md](./DATABASE_SETUP.md).

### Database Schema

```
orders
├── id (BIGSERIAL PRIMARY KEY)
├── name (VARCHAR)
├── address (TEXT)
├── is_pickup (BOOLEAN)
├── total_price (DECIMAL)
├── slip_image (TEXT)
├── status (VARCHAR) [pending, confirmed, processing, completed, cancelled]
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

order_items
├── id (BIGSERIAL PRIMARY KEY)
├── order_id (BIGINT FK → orders.id)
├── design (VARCHAR) ['1', '2', '3', '4']
├── size (VARCHAR) [S, M, L, XL, 2XL, 3XL, 4XL, 5XL, 6XL]
├── quantity (INTEGER)
├── price_per_unit (DECIMAL)
└── created_at (TIMESTAMP)
```

## 🔴 Redis Setup (Recommended for Production)

The application uses Redis to store the order toggle status (open/closed). While Redis is **optional** (it will fall back to in-memory storage), it's **highly recommended** for production deployments.

### Why Redis?

- ✅ **Persistent State**: Order status survives serverless function restarts
- ✅ **Shared State**: All Vercel regions share the same status
- ✅ **Free Tier Available**: Upstash offers generous free tier

### Quick Setup (5 minutes)

**Recommended: Upstash Redis (Free Tier)**

1. **Create Account**: Go to [Upstash Console](https://console.upstash.com)
2. **Create Database**: Choose Regional, select `ap-southeast-1` (Singapore)
3. **Copy Redis URL**: Get connection string from dashboard
4. **Add to Vercel**: Settings → Environment Variables → Add `REDIS_URL`
5. **Redeploy**: Trigger new deployment

📖 **Detailed Guides:**
- **Quick Start**: See [UPSTASH_QUICK_START.md](./UPSTASH_QUICK_START.md) - 5-minute setup
- **Full Guide**: See [REDIS_SETUP.md](./REDIS_SETUP.md) - Comprehensive documentation

### Without Redis (In-Memory Fallback)

The application will work without Redis, but:
- ⚠️ Order toggle status resets when serverless functions restart
- ⚠️ Each Vercel region maintains separate state
- ⚠️ Not recommended for production use

Simply leave `REDIS_URL` unset to use in-memory storage.

## 🏃 Running the Application

### Development Mode

```bash
# Standard development mode
yarn dev

# Development mode with test environment flag
yarn dev:test

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
yarn build

# Start production server
yarn start

# Or build and start for testing
yarn build:test
yarn start:test
```

### Accessing the Admin Dashboard

1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Enter the password from `ADMIN_PASSWORD` environment variable
3. You'll be redirected to the admin dashboard

## 📁 Project Structure

```
shirt-order-next/
├── public/
│   └── images/
│       └── shirts/              # Shirt design images
│           ├── design-1/        # Long sleeve (750 THB)
│           ├── design-2/        # Short sleeve (700 THB)
│           ├── design-3/        # Combo pack (1,100 THB)
│           └── design-4/        # Souvenir (500 THB)
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── admin/               # Admin dashboard pages
│   │   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── api/                 # API routes
│   │   │   ├── orders/          # Order CRUD operations
│   │   │   └── admin/           # Admin authentication
│   │   ├── actions/             # Server Actions
│   │   │   └── orders.ts
│   │   ├── thank-you/           # Order closed page
│   │   ├── page.tsx             # Main order form
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── ShirtOrderForm.tsx   # Main customer form
│   │   ├── AdminDashboard.tsx   # Admin interface
│   │   └── ...
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── supabase.ts          # Database client
│   │   ├── redis.ts             # State management
│   │   ├── cloudinary.ts        # Image storage
│   │   └── line-notify.ts       # Notifications
│   │
│   ├── types/                   # TypeScript definitions
│   ├── constants/               # App constants
│   ├── config/                  # Configuration
│   └── hooks/                   # Custom React hooks
│
├── middleware.ts                # Admin route protection
├── supabase-schema.sql          # Database schema
├── DATABASE_SETUP.md            # Database setup guide
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
└── package.json
```

## 🌐 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | Fetch all orders with items |
| `POST` | `/api/orders` | Create new order |
| `GET` | `/api/orders/export` | Export orders to Excel |
| `GET` | `/api/orders/toggle-status` | Get order acceptance status |
| `POST` | `/api/orders/toggle-status` | Toggle order acceptance |
| `POST` | `/api/admin/login` | Admin authentication |

### Server Actions

| Action | Description |
|--------|-------------|
| `updateOrderStatus(orderId, newStatus)` | Update order status and send LINE notification |

### Order Status Values

- `pending` - รอตรวจสอบ (Waiting for verification)
- `confirmed` - ยืนยันการชำระเงิน (Payment confirmed)
- `processing` - กำลังจัดส่ง (Processing/Shipping)
- `completed` - จัดส่งแล้ว (Delivered)
- `cancelled` - ยกเลิก (Cancelled)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your repository
   - Configure environment variables
   - Deploy

3. **Set environment variables in Vercel**
   - Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Configure domains**
   - Settings → Domains
   - Add your custom domain

### Deploy to Other Platforms

The application uses `output: "standalone"` in `next.config.ts`, making it compatible with:
- Docker containers
- AWS Amplify
- Netlify
- Self-hosted servers

See [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying) for platform-specific guides.

### Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema executed in Supabase
- [ ] Cloudinary configured for your domain
- [ ] LINE Notify tokens tested
- [ ] Redis connection verified
- [ ] Admin password changed from default
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Test order flow end-to-end
- [ ] Verify LINE notifications working

## 🔒 Security Considerations

⚠️ **Important Security Notes:**

### Current Limitations

1. **No API Authentication** - Order endpoints are publicly accessible
2. **Plain Text Password** - Admin password stored in environment variable
3. **No Rate Limiting** - API endpoints not protected against abuse
4. **No CSRF Protection** - Forms don't use CSRF tokens
5. **No Row Level Security** - Database RLS not enabled

### Recommended Improvements

1. **Add API Authentication**
   ```typescript
   // Add middleware to check API keys or JWT tokens
   // Protect /api/orders endpoints
   ```

2. **Implement Proper Admin Auth**
   ```typescript
   // Use NextAuth.js or similar
   // Hash passwords with bcrypt
   // Add session management
   ```

3. **Enable Row Level Security (RLS)**
   ```sql
   -- See DATABASE_SETUP.md for RLS policies
   -- Restrict database access by user role
   ```

4. **Add Rate Limiting**
   ```typescript
   // Use @upstash/ratelimit or similar
   // Limit order creation per IP
   ```

5. **Sanitize User Input**
   ```typescript
   // Already using Zod validation
   // Add SQL injection prevention
   // Validate file uploads
   ```

6. **HTTPS Only**
   ```typescript
   // Enforce HTTPS in production
   // Set secure cookies
   ```

## 📝 Product Catalog

| Design | Name | Price | Sizes |
|--------|------|-------|-------|
| Design 1 | Long Sleeve Work Shirt | 750 THB | S - 6XL |
| Design 2 | Short Sleeve Work Shirt | 700 THB | S - 6XL |
| Design 3 | Combo Pack (Both Sleeves) | 1,100 THB | S - 6XL |
| Design 4 | Souvenir Shirt | 500 THB | S - 6XL |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode conventions
- Use meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Rutthawit Chooworakulchai** - [@rutthawitc](https://github.com/rutthawitc)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [Supabase](https://supabase.com/)
- Image hosting by [Cloudinary](https://cloudinary.com/)
- Thai font: [Noto Sans Thai](https://fonts.google.com/noto/specimen/Noto+Sans+Thai)

## 📞 Support

For questions or issues:
1. Check the [DATABASE_SETUP.md](./DATABASE_SETUP.md) guide
2. Open an issue on GitHub
3. Contact the maintainer

---

**Tiger Thailand Meeting 2025** 🐅
Order deadline: January 10, 2568 (Buddhist calendar / 2025 CE)

// src/config/env.ts
export const env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME!,
    cloudinaryKey: process.env.CLOUDINARY_API_KEY!,
    cloudinarySecret: process.env.CLOUDINARY_API_SECRET!,
    lineNotifyToken: process.env.LINE_NOTIFY_TOKEN!,
    adminPassword: process.env.ADMIN_PASSWORD!,
    isTestEnvironment: process.env.NODE_ENV === 'development',
  }
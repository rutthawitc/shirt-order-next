// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'
import { env } from '@/config/env'

cloudinary.config({
  cloud_name: env.cloudinaryName,
  api_key: env.cloudinaryKey,
  api_secret: env.cloudinarySecret
})

export { cloudinary }
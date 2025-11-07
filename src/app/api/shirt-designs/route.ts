// src/app/api/shirt-designs/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cloudinary } from '@/lib/cloudinary'
import { CloudinaryUploadResponse } from '@/types/cloudinary'

// GET - Fetch shirt designs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let query = supabase.from('shirt_designs').select('*')

    // Only filter by is_active if not requesting all designs
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data: designs, error } = await query.order('display_order', { ascending: true })

    if (error) throw error

    // For admin (includeInactive=true), return full DB format
    if (includeInactive) {
      return NextResponse.json(designs)
    }

    // For public, transform to client format (compatible with ShirtDesign interface)
    const transformedDesigns = designs.map((design) => ({
      id: design.id,
      name: design.name,
      price: design.price,
      description: design.description,
      images: [design.front_image, design.back_image]
    }))

    return NextResponse.json(transformedDesigns)
  } catch (error) {
    console.error('Error fetching shirt designs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shirt designs' },
      { status: 500 }
    )
  }
}

// POST - Create new shirt design (admin only)
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const description = formData.get('description') as string
    const frontImage = formData.get('frontImage') as File
    const backImage = formData.get('backImage') as File
    const displayOrder = parseInt(formData.get('displayOrder') as string) || 0

    if (!id || !name || !price || !description || !frontImage || !backImage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Upload front image to Cloudinary
    const frontBuffer = Buffer.from(await frontImage.arrayBuffer())
    const frontUpload = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'shirt-designs',
          public_id: `design-${id}-front`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as CloudinaryUploadResponse)
        }
      ).end(frontBuffer)
    })

    // Upload back image to Cloudinary
    const backBuffer = Buffer.from(await backImage.arrayBuffer())
    const backUpload = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'shirt-designs',
          public_id: `design-${id}-back`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as CloudinaryUploadResponse)
        }
      ).end(backBuffer)
    })

    // Create design in Supabase
    const { data: design, error: designError } = await supabase
      .from('shirt_designs')
      .insert({
        id,
        name,
        price,
        description,
        front_image: frontUpload.secure_url,
        back_image: backUpload.secure_url,
        is_active: true,
        display_order: displayOrder
      })
      .select()
      .single()

    if (designError) throw designError

    return NextResponse.json(
      { message: 'Shirt design created successfully', design },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating shirt design:', error)
    return NextResponse.json(
      { error: 'Failed to create shirt design' },
      { status: 500 }
    )
  }
}

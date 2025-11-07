// src/app/api/shirt-designs/[id]/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cloudinary } from '@/lib/cloudinary'
import { CloudinaryUploadResponse } from '@/types/cloudinary'

// GET - Fetch single shirt design
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: design, error } = await supabase
      .from('shirt_designs')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(design)
  } catch (error) {
    console.error('Error fetching shirt design:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shirt design' },
      { status: 500 }
    )
  }
}

// PUT - Update shirt design (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
    const description = formData.get('description') as string
    const frontImage = formData.get('frontImage') as File | null
    const backImage = formData.get('backImage') as File | null
    const isActive = formData.get('isActive') === 'true'
    const displayOrder = formData.get('displayOrder') ? parseInt(formData.get('displayOrder') as string) : null

    // Get current design data
    const { data: currentDesign } = await supabase
      .from('shirt_designs')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!currentDesign) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    let frontImageUrl = currentDesign.front_image
    let backImageUrl = currentDesign.back_image

    // Upload new front image if provided
    if (frontImage && frontImage.size > 0) {
      const frontBuffer = Buffer.from(await frontImage.arrayBuffer())
      const frontUpload = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'shirt-designs',
            public_id: `design-${params.id}-front`,
            resource_type: 'auto',
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result as CloudinaryUploadResponse)
          }
        ).end(frontBuffer)
      })
      frontImageUrl = frontUpload.secure_url
    }

    // Upload new back image if provided
    if (backImage && backImage.size > 0) {
      const backBuffer = Buffer.from(await backImage.arrayBuffer())
      const backUpload = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'shirt-designs',
            public_id: `design-${params.id}-back`,
            resource_type: 'auto',
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result as CloudinaryUploadResponse)
          }
        ).end(backBuffer)
      })
      backImageUrl = backUpload.secure_url
    }

    // Update design in Supabase
    const updateData: Record<string, unknown> = {
      front_image: frontImageUrl,
      back_image: backImageUrl,
      is_active: isActive,
    }

    if (name) updateData.name = name
    if (price !== null) updateData.price = price
    if (description) updateData.description = description
    if (displayOrder !== null) updateData.display_order = displayOrder

    const { data: design, error: designError } = await supabase
      .from('shirt_designs')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (designError) throw designError

    return NextResponse.json({
      message: 'Shirt design updated successfully',
      design
    })
  } catch (error) {
    console.error('Error updating shirt design:', error)
    return NextResponse.json(
      { error: 'Failed to update shirt design' },
      { status: 500 }
    )
  }
}

// DELETE - Delete shirt design (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('shirt_designs')
      .update({ is_active: false })
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({
      message: 'Shirt design deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting shirt design:', error)
    return NextResponse.json(
      { error: 'Failed to delete shirt design' },
      { status: 500 }
    )
  }
}

// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cloudinary } from '@/lib/cloudinary'
import { CloudinaryUploadResponse } from '@/types/cloudinary'
import { CreateOrderItem, ShirtDesignPrice } from '@/types/order'
import { sendOrderNotification } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const isPickup = formData.get('isPickup') === 'true'
    const totalPrice = parseFloat(formData.get('totalPrice') as string)
    const items = JSON.parse(formData.get('items') as string) as CreateOrderItem[]
    const slipImage = formData.get('slipImage') as File

    if (!name || !phone || !items || !slipImage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Upload slip to Cloudinary
    const arrayBuffer = await slipImage.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'shirt-order-slips',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as CloudinaryUploadResponse)
        }
      ).end(buffer)
    })

    // Create order in Supabase
    const orderData = {
      name,
      phone,
      address,
      is_pickup: isPickup,
      total_price: totalPrice,
      slip_image: uploadResponse.secure_url,
      status: 'pending'
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) throw orderError

    // Fetch current prices from database
    const { data: designs, error: designsError } = await supabase
      .from('shirt_designs')
      .select('id, price')
      .eq('is_active', true)

    if (designsError) throw designsError

    // Create price mapping from database
    const PRICE_MAP: Record<string, number> = designs.reduce((acc: Record<string, number>, design: { id: string; price: number }) => {
      acc[design.id] = design.price
      return acc
    }, {})

    // Create order items with current prices
    const orderItems = items.map(item => ({
      order_id: order.id,
      design: item.design,
      size: item.size,
      quantity: item.quantity,
      price_per_unit: PRICE_MAP[item.design] || 0
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Send Telegram notification
    await sendOrderNotification({
      orderId: order.id,
      name: order.name,
      phone: order.phone,
      totalAmount: order.total_price,
      items: orderItems,
      isPickup: order.is_pickup,
      address: order.address,
      slipImageUrl: order.slip_image
    })

    return NextResponse.json(
      { message: 'Order created successfully', orderId: order.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Order creation error:', error)

    // Handle specific Supabase errors
    if (error && typeof error === 'object' && 'code' in error) {
      const supabaseError = error as { code: string; message: string; details?: string }

      // Check constraint violations
      if (supabaseError.code === '23514') {
        // Check constraint violation
        if (supabaseError.message?.includes('valid_size')) {
          return NextResponse.json(
            { error: 'ขนาดเสื้อที่เลือกไม่ถูกต้อง กรุณาเลือกขนาดที่มีให้บริการ' },
            { status: 400 }
          )
        }
        if (supabaseError.message?.includes('valid_design')) {
          return NextResponse.json(
            { error: 'แบบเสื้อที่เลือกไม่ถูกต้อง กรุณาเลือกแบบเสื้อที่มีให้บริการ' },
            { status: 400 }
          )
        }
        if (supabaseError.message?.includes('address_required_for_delivery')) {
          return NextResponse.json(
            { error: 'กรุณากรอกที่อยู่จัดส่ง หรือเลือกรับหน้างาน' },
            { status: 400 }
          )
        }
      }

      // Foreign key violations
      if (supabaseError.code === '23503') {
        return NextResponse.json(
          { error: 'เกิดข้อผิดพลาดในการสร้างรายการสั่งซื้อ' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) throw ordersError

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)

        return { ...order, items: items || [] }
      })
    )

    return NextResponse.json(ordersWithItems)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
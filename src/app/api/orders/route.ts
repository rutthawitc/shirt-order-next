// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cloudinary } from '@/lib/cloudinary'
import { CloudinaryUploadResponse } from '@/types/cloudinary'
import { CreateOrderItem, ShirtDesignPrice } from '@/types/order'
import { sendOrderNotification } from '@/lib/line-notify'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const isPickup = formData.get('isPickup') === 'true'
    const totalPrice = parseFloat(formData.get('totalPrice') as string)
    const items = JSON.parse(formData.get('items') as string) as CreateOrderItem[]
    const slipImage = formData.get('slipImage') as File

    if (!name || !items || !slipImage) {
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

    // Define price mapping
    const PRICE_MAP: ShirtDesignPrice = {
      '1': 750,
      '2': 700,
      '3': 1100,
      '4': 500
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      design: item.design,
      size: item.size,
      quantity: item.quantity,
      price_per_unit: PRICE_MAP[item.design]
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Send LINE notification
    await sendOrderNotification({
      orderId: order.id,
      name: order.name,
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
'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { sendStatusUpdateNotification } from '@/lib/telegram'

export async function updateOrderStatus(orderId: number, newStatus: string) {
  try {
    if (!orderId || !newStatus) {
      return { success: false, error: 'Invalid order ID or status' }
    }

    console.log('Updating order status:', { orderId, newStatus })

    // Update the order status directly
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select('*')
      .single()

    console.log('Supabase response:', { updatedOrder, updateError })

    if (updateError) {
      console.error('Error updating order:', updateError)
      return { success: false, error: updateError.message }
    }

    if (!updatedOrder) {
      return { success: false, error: 'Order not found' }
    }

    // Send Telegram notification
    try {
      await sendStatusUpdateNotification(
        updatedOrder.id,
        updatedOrder.name,
        updatedOrder.status
      )
    } catch (notifyError) {
      // Log notification error but don't fail the request
      console.error('Error sending Telegram notification:', notifyError)
    }

    // Revalidate only the admin path
    revalidatePath('/admin', 'page')
    
    return { success: true, data: updatedOrder }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update order status' 
    }
  }
}

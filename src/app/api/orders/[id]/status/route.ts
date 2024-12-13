// src/app/api/orders/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendStatusUpdateNotification } from '@/lib/line-notify';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const order = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (order.error) {
      return NextResponse.json({ error: order.error.message }, { status: 500 });
    }

    if (order.data) {
      await sendStatusUpdateNotification(
        order.data.id,
        order.data.name,
        order.data.status
      );
    }

    return NextResponse.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
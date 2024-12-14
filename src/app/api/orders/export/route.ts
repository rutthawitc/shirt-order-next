/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/orders/export/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Fetch all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*');

    if (itemsError) throw itemsError;

    // Format orders for Excel
    const ordersForExcel = orders.map(order => ({
      'รหัสออเดอร์': order.id,
      'ชื่อผู้สั่ง': order.name,
      'ที่อยู่': order.is_pickup ? 'รับหน้างาน' : order.address,
      'ยอดรวม': order.total_price,
      'สถานะ': order.status === 'pending' ? 'รอดำเนินการ' : 'จัดส่งแล้ว',
      'วันที่สั่ง': new Date(order.created_at).toLocaleString('th-TH')
    }));

    const itemsForExcel = items.map(item => ({
      'รหัสออเดอร์': item.order_id,
      'แบบ': getDesignName(item.design),
      'ขนาด': item.size,
      'จำนวน': item.quantity,
      'ราคาต่อชิ้น': item.price_per_unit,
      'รวม': item.quantity * item.price_per_unit
    }));

    // Process size summary data
    function processSizeSummary(items: any[]) {
      const sizeCount = new Map<string, { [key: string]: number }>();
      const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

      // Initialize the map with designs and zero quantities
      ['1', '2', '4'].forEach(design => {
        sizeCount.set(design, Object.fromEntries(sizes.map(size => [size, 0])));
      });

      items.forEach(item => {
        const design = item.design;
        const size = item.size;
        const quantity = item.quantity;

        // Handle design #3 (split between designs 1 and 2)
        if (design === '3') {
          // Add quantity to both design 1 and 2
          ['1', '2'].forEach(designId => {
            if (sizeCount.has(designId) && size) {
              const designSizes = sizeCount.get(designId)!;
              designSizes[size] = (designSizes[size] || 0) + quantity;
            }
          });
        } else if (sizeCount.has(design) && size) {
          // Normal processing for other designs
          const designSizes = sizeCount.get(design)!;
          designSizes[size] = (designSizes[size] || 0) + quantity;
        }
      });

      // Convert to array format for Excel
      const sizeSummary = Array.from(sizeCount.entries()).map(([design, sizeData]) => ({
        'แบบเสื้อ': getDesignName(design),
        ...sizeData
      }));

      return sizeSummary;
    }

    // Create workbook and sheets
    const wb = XLSX.utils.book_new();

    // Add orders sheet
    const wsOrders = XLSX.utils.json_to_sheet(ordersForExcel);
    XLSX.utils.book_append_sheet(wb, wsOrders, 'รายการออเดอร์');

    // Add items sheet
    const wsItems = XLSX.utils.json_to_sheet(itemsForExcel);
    XLSX.utils.book_append_sheet(wb, wsItems, 'รายการสินค้า');

    // Add size summary sheet
    const sizeSummary = processSizeSummary(items);
    const wsSizes = XLSX.utils.json_to_sheet(sizeSummary);
    XLSX.utils.book_append_sheet(wb, wsSizes, 'ขนาดเสื้อ');

    // Auto-size columns
    const colWidths: { [key: string]: number } = {};
    ['รายการออเดอร์', 'รายการสินค้า', 'ขนาดเสื้อ'].forEach(sheetName => {
      const ws = wb.Sheets[sheetName];
      const data = sheetName === 'รายการออเดอร์' 
        ? ordersForExcel 
        : sheetName === 'รายการสินค้า'
          ? itemsForExcel
          : sizeSummary;
      
      // Get all keys from the first row
      const keys = Object.keys(data[0]);
      
      // Calculate max width for each column
      keys.forEach(key => {
        const values = data.map(row => String(row[key as keyof typeof row]));
        const maxLength = Math.max(
          key.length,
          ...values.map(v => v.length)
        );
        colWidths[key] = maxLength + 2; // Add padding
      });

      // Apply widths
      ws['!cols'] = keys.map(key => ({ wch: colWidths[key] }));
    });

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Send response with proper headers
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="orders_export_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Error exporting orders:', error);
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    );
  }
}

function getDesignName(designId: string): string {
  return {
    '1': 'แบบที่ 1 เสื้อใส่เข้างาน แขนยาว',
    '2': 'แบบที่ 2 เสื้อใส่เข้างาน แขนสั้น',
    '3': 'แบบที่ 3 เสื้อแพคคู่',
    '4': 'แบบที่ 4 เสื้อที่ระลึก'
  }[designId] || 'ไม่ระบุ';
}
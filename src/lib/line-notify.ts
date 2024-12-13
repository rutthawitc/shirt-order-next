// src/lib/line-notify.ts
import { env } from '@/config/env'

const LINE_NOTIFY_API = 'https://notify-api.line.me/api/notify';

interface NotifyOrderParams {
  orderId: number;
  name: string;
  totalAmount: number;
  items: Array<{
    design: string;
    size: string;
    quantity: number;
    price_per_unit: number;
  }>;
  isPickup: boolean;
  address?: string;
  slipImageUrl?: string;
}

export async function sendOrderNotification({
  orderId,
  name,
  totalAmount,
  items,
  isPickup,
  address,
  slipImageUrl,
}: NotifyOrderParams): Promise<boolean> {
  const LINE_NOTIFY_TOKEN = env.isTestEnvironment 
    ? process.env.TEST_LINE_NOTIFY_TOKEN 
    : process.env.LINE_NOTIFY_TOKEN;

  if (!LINE_NOTIFY_TOKEN) {
    console.error('LINE_NOTIFY_TOKEN is not set for', env.isTestEnvironment ? 'test' : 'production', 'environment');
    return true; // ให้ผ่านไปถ้าไม่มี token (อาจจะเป็นกรณีทดสอบ)
  }

  const getDesignName = (designId: string): string => ({
    '1': 'แบบที่ 1 เสื้อใส่เข้างาน แขนยาว',
    '2': 'แบบที่ 2 เสื้อใส่เข้างาน แขนสั้น',
    '3': 'แบบที่ 3 เสื้อแพคคู่',
    '4': 'แบบที่ 4 เสื้อที่ระลึก'
  }[designId] || 'ไม่ระบุ');

  const itemsList = items.map(item => 
    `- ${getDesignName(item.design)} ขนาด ${item.size} จำนวน ${item.quantity} ชิ้น`
  ).join('\n');

  const message = `
${env.isTestEnvironment ? '[ทดสอบ] ' : ''}🛍 มีการสั่งซื้อใหม่!
รหัสสั่งซื้อ: ${orderId}
ชื่อผู้สั่ง: ${name}
ยอดรวม: ${totalAmount.toLocaleString()} บาท

รายการสินค้า:
${itemsList}

วิธีรับสินค้า: ${isPickup ? 'รับหน้างาน' : 'จัดส่ง'}
${!isPickup && address ? `ที่อยู่: ${address}` : ''}
  `.trim();

  try {
    // Send text notification
    const messageResponse = await fetch(LINE_NOTIFY_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        message,
      }),
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      throw new Error(`Failed to send LINE notification: ${error}`);
    }

    // If there's a slip image, send it as a separate message
    if (slipImageUrl) {
      const imageResponse = await fetch(LINE_NOTIFY_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          message: `${env.isTestEnvironment ? '[ทดสอบ] ' : ''}สลิปการโอนเงิน - รหัสสั่งซื้อ: ${orderId}`,
          imageFullsize: slipImageUrl,
          imageThumbnail: slipImageUrl,
        }),
      });

      if (!imageResponse.ok) {
        const error = await imageResponse.text();
        throw new Error(`Failed to send slip image: ${error}`);
      }
    }

    return true;
  } catch (error) {
    console.error('LINE Notify Error:', error);
    return false;
  }
}

export async function sendStatusUpdateNotification(
  orderId: number,
  name: string,
  status: string
): Promise<boolean> {
  const LINE_NOTIFY_TOKEN = env.isTestEnvironment 
    ? process.env.TEST_LINE_NOTIFY_TOKEN 
    : process.env.LINE_NOTIFY_TOKEN;

  if (!LINE_NOTIFY_TOKEN) {
    console.error('LINE_NOTIFY_TOKEN is not set for', env.isTestEnvironment ? 'test' : 'production', 'environment');
    return true;
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอตรวจสอบ'
      case 'confirmed':
        return 'ยืนยันการชำระเงิน'
      case 'processing':
        return 'กำลังจัดส่ง'
      case 'completed':
        return 'จัดส่งแล้ว'
      case 'cancelled':
        return 'ยกเลิก'
      default:
        return status
    }
  }

  const message = `
${env.isTestEnvironment ? '[ทดสอบ] ' : ''}📦 อัพเดทสถานะคำสั่งซื้อ
รหัสสั่งซื้อ: ${orderId}
ชื่อผู้สั่ง: ${name}
สถานะ: ${getStatusLabel(status)}
  `.trim();

  try {
    const response = await fetch(LINE_NOTIFY_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        message,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send status update notification: ${error}`);
    }

    return true;
  } catch (error) {
    console.error('LINE Notify Error:', error);
    return false;
  }
}
// src/lib/telegram.ts
import { env } from '@/config/env'
import type { TelegramResponse, SendMessageParams, SendPhotoParams } from '@/types/telegram'

interface NotifyOrderParams {
  orderId: number;
  name: string;
  phone: string;
  totalAmount: number;
  shippingCost: number;
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

/**
 * Send a text message to Telegram
 */
async function sendMessage(params: SendMessageParams): Promise<TelegramResponse> {
  const TELEGRAM_BOT_TOKEN = env.isTestEnvironment
    ? process.env.TEST_TELEGRAM_BOT_TOKEN
    : process.env.TELEGRAM_BOT_TOKEN;

  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send Telegram message: ${error}`);
  }

  return response.json();
}

/**
 * Send a photo to Telegram
 */
async function sendPhoto(params: SendPhotoParams): Promise<TelegramResponse> {
  const TELEGRAM_BOT_TOKEN = env.isTestEnvironment
    ? process.env.TEST_TELEGRAM_BOT_TOKEN
    : process.env.TELEGRAM_BOT_TOKEN;

  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send Telegram photo: ${error}`);
  }

  return response.json();
}

/**
 * Get design name in Thai from database
 * Falls back to 'ไม่ระบุ' if design not found
 */
async function getDesignName(designId: string): Promise<string> {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: design } = await supabase
      .from('shirt_designs')
      .select('name')
      .eq('id', designId)
      .single()

    return design?.name || 'ไม่ระบุ'
  } catch (error) {
    console.error('Error fetching design name:', error)
    return 'ไม่ระบุ'
  }
}

/**
 * Send order notification to Telegram
 */
export async function sendOrderNotification({
  orderId,
  name,
  phone,
  totalAmount,
  shippingCost,
  items,
  isPickup,
  address,
  slipImageUrl,
}: NotifyOrderParams): Promise<boolean> {
  const TELEGRAM_CHAT_ID = env.isTestEnvironment
    ? process.env.TEST_TELEGRAM_CHAT_ID
    : process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_CHAT_ID) {
    console.error('TELEGRAM_CHAT_ID is not set for', env.isTestEnvironment ? 'test' : 'production', 'environment');
    return true; // Allow operation to continue if Telegram is not configured
  }

  // Fetch design names from database
  const designNames = await Promise.all(
    items.map(item => getDesignName(item.design))
  );

  const itemsList = items.map((item, index) =>
    `  • ${designNames[index]} ขนาด ${item.size} จำนวน ${item.quantity} ชิ้น`
  ).join('\n');

  const testPrefix = env.isTestEnvironment ? '🧪 [ทดสอบ] ' : '';

  // Calculate grand total
  const grandTotal = totalAmount + shippingCost;

  const message = `${testPrefix}🛍 <b>มีการสั่งซื้อใหม่!</b>

📋 <b>รหัสสั่งซื้อ:</b> ${orderId}
👤 <b>ชื่อผู้สั่ง:</b> ${name}
📞 <b>เบอร์โทรศัพท์:</b> ${phone}

📦 <b>รายการสินค้า:</b>
${itemsList}

💰 <b>ยอดเงิน:</b>
  • ยอดสินค้า: ${totalAmount.toLocaleString()} บาท
  • ค่าจัดส่ง: ${shippingCost.toLocaleString()} บาท
  • <b>ยอดรวมทั้งสิ้น: ${grandTotal.toLocaleString()} บาท</b>

🚚 <b>วิธีรับสินค้า:</b> ${isPickup ? 'รับหน้างาน' : 'จัดส่ง'}${!isPickup && address ? `\n📍 <b>ที่อยู่:</b> ${address}` : ''}`;

  try {
    // Send text notification
    await sendMessage({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    });

    // If there's a slip image, send it as a separate message
    if (slipImageUrl) {
      await sendPhoto({
        chat_id: TELEGRAM_CHAT_ID,
        photo: slipImageUrl,
        caption: `${testPrefix}💳 <b>สลิปการโอนเงิน</b>\n📋 รหัสสั่งซื้อ: ${orderId}`,
        parse_mode: 'HTML',
      });
    }

    return true;
  } catch (error) {
    console.error('Telegram Notification Error:', error);
    return false;
  }
}

/**
 * Send status update notification to Telegram
 */
export async function sendStatusUpdateNotification(
  orderId: number,
  name: string,
  status: string
): Promise<boolean> {
  const TELEGRAM_CHAT_ID = env.isTestEnvironment
    ? process.env.TEST_TELEGRAM_CHAT_ID
    : process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_CHAT_ID) {
    console.error('TELEGRAM_CHAT_ID is not set for', env.isTestEnvironment ? 'test' : 'production', 'environment');
    return true;
  }

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      'pending': 'รอตรวจสอบ',
      'confirmed': 'ยืนยันการชำระเงิน',
      'processing': 'กำลังจัดส่ง',
      'completed': 'จัดส่งแล้ว',
      'cancelled': 'ยกเลิก'
    };
    return statusLabels[status] || status;
  };

  const getStatusEmoji = (status: string): string => {
    const statusEmojis: Record<string, string> = {
      'pending': '⏳',
      'confirmed': '✅',
      'processing': '📦',
      'completed': '🎉',
      'cancelled': '❌'
    };
    return statusEmojis[status] || '📋';
  };

  const testPrefix = env.isTestEnvironment ? '🧪 [ทดสอบ] ' : '';

  const message = `${testPrefix}${getStatusEmoji(status)} <b>อัพเดทสถานะคำสั่งซื้อ</b>

📋 <b>รหัสสั่งซื้อ:</b> ${orderId}
👤 <b>ชื่อผู้สั่ง:</b> ${name}
📊 <b>สถานะ:</b> ${getStatusLabel(status)}`;

  try {
    await sendMessage({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    });

    return true;
  } catch (error) {
    console.error('Telegram Notification Error:', error);
    return false;
  }
}

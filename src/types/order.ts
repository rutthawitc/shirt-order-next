
// src/types/order.ts
export interface ShirtDesign {
  id: string;
  name: string;
  price: number;
  description: string;
  images: readonly string[];
}

export interface BaseOrderItem {
  design: string;
  size: string;
  quantity: number;
}

export interface OrderItem extends BaseOrderItem {
  price_per_unit?: number;
}

export interface DBOrderItem extends BaseOrderItem {
  price_per_unit: number;
  order_id?: number;
}

export interface CustomerInfo {
  name: string;
  address: string;
  slipImage: File | null;
  isPickup: boolean;
}

export interface Order {
  id: number;
  name: string;
  address: string;
  is_pickup: boolean;
  total_price: number;
  slip_image: string;
  status: string;
  created_at: string;
  items: DBOrderItem[];
}

  export type ShirtDesignPrice = {
    [key in '1' | '2' | '3' | '4']: number;
  };
  
  export interface CreateOrderItem {
    design: '1' | '2' | '3' | '4';
    size: string;
    quantity: number;
  }
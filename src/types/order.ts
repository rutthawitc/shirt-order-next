
// src/types/order.ts
export interface ShirtDesign {
  id: string;
  name: string;
  price: number;
  description: string;
  images: readonly string[];
}

export interface DBShirtDesign {
  id: string;
  name: string;
  price: number;
  description: string;
  front_image: string;
  back_image: string;
  is_active: boolean;
  display_order: number;
  is_combo?: boolean; // True if this design is a combo/bundle of other designs
  created_at: string;
  updated_at: string;
}

export interface ComboComponent {
  id: number;
  combo_design_id: string;
  component_design_id: string;
  quantity_multiplier: number;
  created_at: string;
  updated_at: string;
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
  phone: string;
  address: string;
  slipImage: File | null;
  isPickup: boolean;
}

export interface Order {
  id: number;
  name: string;
  phone: string;
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
// src/constants/shirt-designs.ts
export const SHIRT_DESIGNS = [
    { 
      id: '1', 
      name: 'แบบที่ 1 เสื้อใส่เข้างาน', 
      price: 750,
      description: 'เสื้อเจอร์ซีย์แขนยาว Tiger Thailand',
      images: ['/images/shirts/design-1/front.jpg', '/images/shirts/design-1/back.jpg']
    },
    { 
      id: '2', 
      name: 'แบบที่ 2 เสื้อใส่เข้างาน', 
      price: 700,
      description: 'เสื้อเจอร์ซีย์แขนสั้น Tiger Thailand',
      images: ['/images/shirts/design-2/front.jpg', '/images/shirts/design-2/back.jpg']
    },
    { 
      id: '3', 
      name: 'แบบที่ 3 เสื้อใส่เข้างาน แพคคู่', 
      price: 1100,
      description: 'เสื้อเจอร์ซีย์แขนยาวและแขนสั้น Tiger Thailand (ไซส์เดียวกัน)',
      images: ['/images/shirts/design-3/front.jpg', '/images/shirts/design-3/back.jpg']
    },
    { 
      id: '4', 
      name: 'แบบที่ 4 เสื้อยืดที่ระลึก', 
      price: 500,
      description: 'เสื้อยืด premium cotton',
      images: ['/images/shirts/design-4/front.jpg', '/images/shirts/design-4/back.jpg']
    }
  ] as const;
  
  export const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'] as const;
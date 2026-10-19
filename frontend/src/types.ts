export type PaymentMethod = 'tunai' | 'qris' | 'kartu';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  emoji: string;
  color: string;
  is_active: boolean;
  category: Category;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface OrderItem {
  product_id: number | null;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_no: string;
  datetime: string;
  cashier: string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  method: PaymentMethod;
  method_label: string;
  cash_received: number | null;
  change: number | null;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface DashboardData {
  today: {
    revenue: number;
    transactions: number;
    items_sold: number;
    average: number;
    revenue_week: number;
  };
  week: Array<{ date: string; label: string; total: number }>;
  top_products: Array<{ product_id: number | null; name: string; qty: number; revenue: number }>;
  recent_orders: Order[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface ProductFormPayload {
  name: string;
  category_id: number;
  price: number;
  stock: number;
  emoji?: string;
  color?: string;
  is_active?: boolean;
}

export interface CheckoutPayload {
  items: CartItem[];
  discount: number;
  method: PaymentMethod;
  cashReceived: number | null;
}

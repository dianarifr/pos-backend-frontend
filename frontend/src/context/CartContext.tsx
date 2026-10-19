import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product) => void;
  setQty: (productId: number, qty: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
  discount: number;
  setDiscount: (n: number) => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscountState] = useState(0);

  const addItem = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map(i => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      if (product.stock < 1) return prev;
      return [...prev, { product, qty: 1 }];
    });
  };

  const setQty = (productId: number, qty: number) => {
    setItems(prev =>
      prev.map(i => {
        if (i.product.id !== productId) return i;
        const clamped = Math.max(1, Math.min(qty, i.product.stock));
        return { ...i, qty: clamped };
      }),
    );
  };

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const clear = () => {
    setItems([]);
    setDiscountState(0);
  };

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.product.price * i.qty, 0),
    }),
    [items],
  );

  const value = useMemo(
    () => ({ items, addItem, setQty, removeItem, clear, discount, setDiscount: setDiscountState, count, subtotal }),
    [items, addItem, setQty, removeItem, clear, discount, count, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider');
  return ctx;
}

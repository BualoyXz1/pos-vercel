import { create } from 'zustand';

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image?: string | null;
};

type State = {
  items: CartItem[];
  add: (p: Omit<CartItem, 'qty'>) => void;
  inc: (id: number) => void;
  dec: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
};

export const useCart = create<State>((set, get) => ({
  items: [],
  add: (p) =>
    set((s) => {
      const ex = s.items.find((i) => i.productId === p.productId);
      if (ex) return { items: s.items.map((i) => (i.productId === p.productId ? { ...i, qty: i.qty + 1 } : i)) };
      return { items: [...s.items, { ...p, qty: 1 }] };
    }),
  inc: (id) => set((s) => ({ items: s.items.map((i) => (i.productId === id ? { ...i, qty: i.qty + 1 } : i)) })),
  dec: (id) =>
    set((s) => ({
      items: s.items
        .map((i) => (i.productId === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    })),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.productId !== id) })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
  count: () => get().items.reduce((s, i) => s + i.qty, 0),
}));

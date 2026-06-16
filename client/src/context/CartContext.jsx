import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const Ctx = createContext(null);
const GUEST_CART_KEY = "plantery_cart_guest";

function readCart(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { user, loading } = useAuth();
  const storageKey = useMemo(
    () => (user?.id ? `plantery_cart_${user.id}` : GUEST_CART_KEY),
    [user?.id]
  );
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (loading) return;

    if (user?.id) {
      const userCart = readCart(storageKey);
      if (userCart.length > 0) {
        setItems(userCart);
        return;
      }

      const guestCart = readCart(GUEST_CART_KEY);
      if (guestCart.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(guestCart));
        localStorage.removeItem(GUEST_CART_KEY);
        setItems(guestCart);
        return;
      }
    }

    setItems(readCart(storageKey));
  }, [loading, storageKey, user?.id]);

  useEffect(() => {
    if (loading) return;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, loading, storageKey]);

  const add = (item, qty = 1) => setItems(prev => {
    const ex = prev.find(i => i.id === item.id);
    if (ex) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + qty } : i);
    return [...prev, { ...item, qty }];
  });
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const setQty = (id, qty) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price_cents * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, total, count }}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx);
export const formatPrice = (cents) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { ProductoFarmaciaDto } from "../../api/farmaciaApi";

export interface CartFisicoItem extends ProductoFarmaciaDto {
  cantidad: number;
  imagenUrl?: string;
}

interface CartFisicoContextType {
  cart: CartFisicoItem[];
  addToCart: (product: ProductoFarmaciaDto, quantity: number, imagenUrl: string) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  updateQuantity: (key: string, quantity: number) => void;
  total: number;
  itemCount: number;
}

const CartFisicoContext = createContext<CartFisicoContextType | undefined>(undefined);

export const getCartKeyFisico = (p: { origen: string; idProducto: number }) => `${p.origen}-${p.idProducto}`;

const STORAGE_KEY = "shopping_cart_fisico";

export function CartFisicoProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartFisicoItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CartFisicoItem[]) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: ProductoFarmaciaDto, quantity: number, imagenUrl: string) => {
    setCart((prev) => {
      const key = getCartKeyFisico(product);
      const existing = prev.find((i) => getCartKeyFisico(i) === key);

      if (existing) {
        return prev.map((i) =>
          getCartKeyFisico(i) === key ? { ...i, cantidad: i.cantidad + quantity } : i
        );
      }
      return [...prev, { ...product, cantidad: quantity, imagenUrl }];
    });
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((i) => getCartKeyFisico(i) !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setCart((prev) => prev.map((i) => (getCartKeyFisico(i) === key ? { ...i, cantidad: quantity } : i)));
  };

  const clearCart = () => setCart([]);

  const total = useMemo(() => cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0), [cart]);
  const itemCount = useMemo(() => cart.reduce((sum, i) => sum + i.cantidad, 0), [cart]);

  return (
    <CartFisicoContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, total, itemCount }}>
      {children}
    </CartFisicoContext.Provider>
  );
}

export function useCartFisico() {
  const ctx = useContext(CartFisicoContext);
  if (!ctx) throw new Error("useCartFisico debe usarse dentro de CartFisicoProvider");
  return ctx;
}
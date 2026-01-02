import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductoFarmaciaDto } from '../../api/farmaciaApi';

// Extendemos el producto para incluir cantidad e imagen
export interface CartItem extends ProductoFarmaciaDto {
  cantidad: number;
  imagenUrl?: string; // Guardamos la ruta de la imagen aquí para facilitar mostrarla en el carrito
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: ProductoFarmaciaDto, quantity: number, imagenUrl: string) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  updateQuantity: (productId: number, quantity: number) => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('shopping_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: ProductoFarmaciaDto, quantity: number, imagenUrl: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.idProducto === product.idProducto);
      if (existingItem) {
        return prevCart.map((item) =>
          item.idProducto === product.idProducto
            ? { ...item, cantidad: item.cantidad + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, cantidad: quantity, imagenUrl }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.idProducto !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.idProducto === productId ? { ...item, cantidad: quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
}
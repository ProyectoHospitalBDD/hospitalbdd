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
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  updateQuantity: (key: string, quantity: number) => void;
  total: number;
  itemCount: number;
}


const CartContext = createContext<CartContextType | undefined>(undefined);
const cartKey = (p: { origen: string; idProducto: number }) => `${p.origen}-${p.idProducto}`;


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
      const key = cartKey(product);

      const existingItem = prevCart.find((item) => cartKey(item) === key);
      if (existingItem) {
        return prevCart.map((item) =>
          cartKey(item) === key
            ? { ...item, cantidad: item.cantidad + quantity }
            : item
        );
      }

      return [...prevCart, { ...product, cantidad: quantity, imagenUrl }];
    });
  };


  const removeFromCart = (key: string) => {
    setCart((prevCart) => prevCart.filter((item) => cartKey(item) !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        cartKey(item) === key ? { ...item, cantidad: quantity } : item
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

export const getCartKey = cartKey;

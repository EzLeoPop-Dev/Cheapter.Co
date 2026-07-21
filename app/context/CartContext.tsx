"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  id: number;
  bookId: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stock: number;
  bookType: string;
  isPack?: boolean;
  packItems?: any[];
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isCartOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  refreshCart: () => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const GUEST_CART_KEY = "cheapterCart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const refreshCart = async () => {
    setIsLoading(true);
    try {
      if (status === "authenticated") {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
        }
      } else if (status === "unauthenticated") {
        const rawCart = localStorage.getItem(GUEST_CART_KEY);
        setCartItems(rawCart ? JSON.parse(rawCart) : []);
      }
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (status === "authenticated") {
      try {
        const res = await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
        if (res.ok) {
          await refreshCart();
        }
      } catch (err) {
        console.error("Failed to remove item", err);
      }
    } else {
      const nextCart = cartItems.filter((item) => item.id !== itemId);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(nextCart));
      setCartItems(nextCart);
    }
  };

  useEffect(() => {
    const syncGuestCart = async () => {
      if (status === "authenticated") {
        const rawCart = localStorage.getItem(GUEST_CART_KEY);
        if (rawCart) {
          try {
            const guestCartItems = JSON.parse(rawCart);
            if (guestCartItems.length > 0) {
              await fetch("/api/cart/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: guestCartItems })
              });
            }
          } catch (e) {
            console.error("Failed to sync guest cart", e);
          } finally {
            localStorage.removeItem(GUEST_CART_KEY);
          }
        }
        await refreshCart();
      } else if (status === "unauthenticated") {
        await refreshCart();
      }
    };

    if (status !== "loading") {
      syncGuestCart();
    }
  }, [status]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isCartOpen,
        isLoading,
        openCart,
        closeCart,
        refreshCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

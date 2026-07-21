"use client";

import { MockStoreProvider } from './admin/context/MockStoreContext';
import { LanguageProvider } from './context/LanguageContext';
import { SessionProvider } from 'next-auth/react'; 
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <MockStoreProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </MockStoreProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
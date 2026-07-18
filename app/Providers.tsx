"use client";

import { MockStoreProvider } from './admin/context/MockStoreContext';
import { LanguageProvider } from './context/LanguageContext';
import { SessionProvider } from 'next-auth/react'; 

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <MockStoreProvider>
          {children}
        </MockStoreProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
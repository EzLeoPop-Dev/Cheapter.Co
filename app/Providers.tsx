"use client";

import { MockStoreProvider } from './admin/context/MockStoreContext';
import { LanguageProvider } from './context/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <MockStoreProvider>
        {children}
      </MockStoreProvider>
    </LanguageProvider>
  );
}

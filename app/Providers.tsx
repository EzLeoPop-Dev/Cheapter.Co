"use client";

import { MockStoreProvider } from './admin/context/MockStoreContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MockStoreProvider>
      {children}
    </MockStoreProvider>
  );
}

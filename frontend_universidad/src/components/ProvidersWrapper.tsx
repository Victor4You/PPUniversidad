'use client';

import { AuthProvider } from '@/contexts/AuthContext/AuthProvider';
import { FontProvider } from '@/providers/FontProvider';

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <FontProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FontProvider>
  );
}
// src/app/(dashboard)/dashboard/page.tsx - VERSIÓN CORREGIDA
'use client';

// 1. Imports de React/Next.js (externos primero)
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Imports de componentes UI
import { Loader } from '@/components/ui/Loader/Loader';

// 3. Imports de componentes de dashboard
import { DashboardContent } from '@/components/dashboard/DashboardContent/DashboardContent';

// 4. Imports de hooks
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Cargando dashboard..." fullScreen />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardContent />;
}
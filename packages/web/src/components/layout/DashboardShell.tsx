'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './Header';
import { ToastProvider } from '@/components/ui/Toast';
import { getToken } from '@/lib/api';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface-bg">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

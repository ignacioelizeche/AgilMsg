'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getToken } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center">
      <div className="text-muted">Cargando...</div>
    </div>
  );
}

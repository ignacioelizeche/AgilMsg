'use client';

import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, LayoutDashboard, Users, FileText, Receipt, LogOut } from 'lucide-react';
import { clearAuth } from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Cuentas WA', icon: <Users size={18} /> },
  { href: '/dashboard/mensajes', label: 'Mensajes', icon: <MessageCircle size={18} /> },
  { href: '/dashboard/plantillas', label: 'Plantillas', icon: <FileText size={18} /> },
  { href: '/dashboard/facturacion', label: 'Facturacion', icon: <Receipt size={18} /> },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="bg-accent text-primary w-8 h-8 rounded-lg flex items-center justify-center text-sm">
              A
            </div>
            <span>AgilMsg</span>
          </div>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const active = item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    active
                      ? 'bg-white/10 text-accent'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/70 hover:text-white text-sm"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}

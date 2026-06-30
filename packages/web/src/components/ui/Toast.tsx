'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle size={18} className="text-success" />,
    error: <XCircle size={18} className="text-danger" />,
    warning: <AlertTriangle size={18} className="text-warning" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 bg-white rounded-[10px] shadow-lg px-4 py-3 min-w-[280px] animate-in slide-in-from-right"
          >
            {icons[t.type]}
            <span className="text-sm text-primary flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-muted hover:text-primary">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

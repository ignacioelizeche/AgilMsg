import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-[10px] shadow-card p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-4">
      {children}
    </h3>
  );
}

export function StatCard({ label, value, icon, color = 'text-primary' }: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        {icon && <div className={`text-3xl ${color}`}>{icon}</div>}
      </div>
    </Card>
  );
}

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const base = 'font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light disabled:bg-muted',
    secondary: 'bg-accent text-primary hover:bg-accent-hover disabled:bg-gray-200',
    outline: 'border-2 border-border text-primary hover:bg-surface-bg disabled:opacity-50',
    danger: 'bg-danger text-white hover:bg-red-700 disabled:bg-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

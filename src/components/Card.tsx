import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
}

export default function Card({ children, title, className = '', noPadding = false, onClick }: CardProps) {
  return (
    <div
      className={`
        bg-dark-800 rounded-xl shadow-card hover:shadow-card-hover
        transition-all duration-300 border border-dark-700
        ${noPadding ? '' : 'p-4'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark-100">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
} 
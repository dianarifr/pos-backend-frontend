import type { ReactNode } from 'react';

const COLORS = {
  orange: 'bg-primary-50 text-primary-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700',
  gray: 'bg-gray-100 text-gray-600',
};

export type BadgeColor = keyof typeof COLORS;

interface Props {
  color?: BadgeColor;
  className?: string;
  children: ReactNode;
}

export default function Badge({ color = 'gray', className = '', children }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLORS[color]} ${className}`}
    >
      {children}
    </span>
  );
}

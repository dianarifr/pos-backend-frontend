import { Banknote, CreditCard, QrCode } from 'lucide-react';
import Badge from './Badge';
import type { PaymentMethod } from '../../types';

const MAP = {
  tunai: { label: 'Tunai', color: 'green' as const, icon: Banknote },
  qris: { label: 'QRIS', color: 'blue' as const, icon: QrCode },
  kartu: { label: 'Kartu', color: 'violet' as const, icon: CreditCard },
};

export default function MethodBadge({ method }: { method: PaymentMethod }) {
  const m = MAP[method];
  return (
    <Badge color={m.color}>
      <m.icon size={11} />
      {m.label}
    </Badge>
  );
}

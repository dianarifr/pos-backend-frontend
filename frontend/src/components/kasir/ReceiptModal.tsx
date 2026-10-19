import { Printer } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ReceiptView from '../receipt/ReceiptView';
import type { Order } from '../../types';

interface Props {
  order: Order;
  onClose: () => void;
}

export default function ReceiptModal({ order, onClose }: Props) {
  return (
    <Modal open onClose={onClose} title="Struk Pembayaran" size="sm">
      <div className="bg-gray-50 p-4">
        <ReceiptView order={order} />
      </div>
      <div className="flex gap-3 border-t border-gray-100 p-4 print:hidden">
        <Button variant="outline" className="flex-1" onClick={() => window.print()}>
          <Printer size={16} /> Cetak Struk
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Transaksi Baru
        </Button>
      </div>
    </Modal>
  );
}

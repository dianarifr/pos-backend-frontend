const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export const formatRupiah = (n: number): string => idr.format(n);

export function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatJam(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    .replace('.', ':');
}

export function formatTanggalJam(iso: string): string {
  return `${formatTanggal(iso)} • ${formatJam(iso)}`;
}

export const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

// Nama metode pembayaran yang ditampilkan ke pengguna
export const paymentLabels = {
  cash: 'Cash (bayar saat barang diterima)',
  qris: 'QRIS',
  transfer: 'Transfer Bank',
  ewallet: 'Dompet Digital',
};

// Nama status pesanan yang ditampilkan ke pengguna (nilai di database tetap bahasa Inggris)
export const statusLabels = {
  pending: 'Menunggu',
  paid: 'Dibayar',
  shipped: 'Dikirim',
  cancelled: 'Dibatalkan',
};

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
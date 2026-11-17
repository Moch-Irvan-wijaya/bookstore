import { Link, Navigate, useLocation } from 'react-router';
import { formatDateTime, paymentLabels, rupiah, statusLabels } from '../utils/format';

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  // halaman dibuka langsung tanpa melalui checkout (misalnya setelah dimuat ulang)
  if (!order) return <Navigate to='/orders' replace />;

  const isCash = order.payment_method === 'cash';

  return (
    <div className='row justify-content-center'>
      <div className='col-lg-8'>
        <div className='bg-white p-4 rounded text-center mb-4'>
          <svg className='success-check' viewBox='0 0 52 52' aria-hidden='true'>
            <circle className='success-check-circle' cx='26' cy='26' r='24' fill='none' />
            <path className='success-check-mark' fill='none' d='M14 27l8 8 16-17' />
          </svg>
          <h1 className='h3 mt-3'>Pesanan Berhasil Dibuat</h1>
          <p className='text-muted mb-2'>Terima kasih, {order.recipient_name}. Pesanan Anda sudah kami terima.</p>
          <p className='mb-0'>Nomor pesanan: <strong>{order.order_number}</strong></p>
        </div>

        <div className='bg-white p-4 rounded mb-4'>
          <h2 className='h5 mb-3'>Deskripsi Pesanan</h2>

          <div className='row g-3 mb-4'>
            <div className='col-md-6'>
              <p className='small text-muted mb-1'>Tanggal pesanan</p>
              <p className='mb-0'>{formatDateTime(order.created_at)}</p>
            </div>
            <div className='col-md-6'>
              <p className='small text-muted mb-1'>Status</p>
              <p className='mb-0'><span className='badge bg-warning text-dark'>{statusLabels[order.status] || order.status}</span></p>
            </div>
            <div className='col-md-6'>
              <p className='small text-muted mb-1'>Penerima</p>
              <p className='mb-0'>{order.recipient_name}<br />{order.phone}</p>
            </div>
            <div className='col-md-6'>
              <p className='small text-muted mb-1'>Alamat pengiriman</p>
              <p className='mb-0'>{order.address}</p>
            </div>
            {order.note && (
              <div className='col-12'>
                <p className='small text-muted mb-1'>Catatan</p>
                <p className='mb-0'>{order.note}</p>
              </div>
            )}
            <div className='col-md-6'>
              <p className='small text-muted mb-1'>Metode pembayaran</p>
              <p className='mb-0'>{paymentLabels[order.payment_method]}</p>
            </div>
            {order.payment_proof_url && (
              <div className='col-md-6'>
                <p className='small text-muted mb-1'>Bukti pembayaran</p>
                <a href={order.payment_proof_url} target='_blank' rel='noreferrer'>
                  <img src={order.payment_proof_url} alt='Bukti pembayaran' className='proof-thumbnail' />
                </a>
              </div>
            )}
          </div>

          <div className='table-responsive mb-3'>
            <table className='table align-middle'>
              <thead>
                <tr><th>Buku</th><th>Harga</th><th>Jumlah</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.title}>
                    <td>{item.title}</td>
                    <td>{rupiah(item.price)}</td>
                    <td>{item.quantity}</td>
                    <td>{rupiah(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='d-flex justify-content-between fw-bold fs-5'>
            <span>Total</span>
            <span>{rupiah(order.total_amount)}</span>
          </div>
        </div>

        <div className='alert alert-success'>
          {isCash
            ? 'Siapkan uang tunai sesuai total pesanan saat buku diterima. Admin akan menghubungi Anda untuk konfirmasi pengiriman.'
            : 'Bukti pembayaran Anda sudah kami terima. Admin akan memeriksanya, lalu status pesanan berubah menjadi Dibayar.'}
        </div>

        <div className='d-flex flex-wrap gap-2'>
          <Link to='/orders' className='btn btn-primary'>Lihat Pesanan Saya</Link>
          <Link to='/' className='btn btn-outline-secondary'>Kembali Belanja</Link>
        </div>
      </div>
    </div>
  );
}
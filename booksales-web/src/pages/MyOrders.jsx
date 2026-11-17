import { useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import { paymentLabels, rupiah, statusLabels } from '../utils/format';

const badge = { pending: 'warning', paid: 'info', shipped: 'success', cancelled: 'secondary' };

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/my-transactions');
        setOrders(res.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, []);

  // Satu pesanan bisa berisi beberapa buku (beberapa baris dengan order_number yang sama)
  const groups = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      if (!map.has(o.order_number)) map.set(o.order_number, []);
      map.get(o.order_number).push(o);
    });
    return [...map.values()];
  }, [orders]);

  return (
    <div className='bg-white p-4 rounded shadow-sm'>
      <h1 className='h4 mb-3'>Pesanan Saya</h1>
      {error && <div className='alert alert-danger'>{error}</div>}
      <div className='table-responsive'>
        <table className='table'>
          <thead>
            <tr><th>Nomor Pesanan</th><th>Buku</th><th>Total</th><th>Pembayaran</th><th>Status</th><th>Tanggal</th></tr>
          </thead>
          <tbody>
            {groups.map((items) => {
              const o = items[0];
              const total = items.reduce((sum, i) => sum + Number(i.total_amount), 0);
              return (
                <tr key={o.order_number}>
                  <td>{o.order_number}</td>
                  <td>
                    {items.map((i) => (
                      <div key={i.id}>{i.book?.title} <small className='text-muted'>× {i.quantity}</small></div>
                    ))}
                  </td>
                  <td>{rupiah(total)}</td>
                  <td>
                    {paymentLabels[o.payment_method] || '-'}
                    {o.payment_proof_url && (
                      <>
                        <br />
                        <a href={o.payment_proof_url} target='_blank' rel='noreferrer' className='small'>Lihat bukti</a>
                      </>
                    )}
                  </td>
                  <td><span className={`badge bg-${badge[o.status]}`}>{statusLabels[o.status] || o.status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              );
            })}
            {groups.length === 0 && (
              <tr><td colSpan={6} className='text-center text-muted'>Belum ada pesanan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../../api/axios';
import Pagination from '../../components/Pagination';
import { paymentLabels, rupiah, statusLabels } from '../../utils/format';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/transactions', { params: { page } });
        setOrders(res.data.data);
        setMeta(res.data.meta);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, [page, reload]);

  // Satu pesanan bisa berisi beberapa buku (beberapa baris dengan order_number yang sama)
  const groups = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      if (!map.has(o.order_number)) map.set(o.order_number, []);
      map.get(o.order_number).push(o);
    });
    return [...map.values()];
  }, [orders]);

  // Ubah status semua buku dalam satu pesanan sekaligus
  const handleStatus = async (items, status) => {
    if (status === 'cancelled' && !window.confirm('Batalkan pesanan ini? Stok buku akan dikembalikan.')) {
      return;
    }
    try {
      for (const item of items) {
        if (item.status === 'cancelled' || item.status === status) continue;
        await api.put(`/transactions/${item.id}`, { status });
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
    setReload((n) => n + 1);
  };

  return (
    <>
      <h1 className='h4 mb-3'>Daftar Pesanan</h1>
      {error && <div className='alert alert-danger'>{error}</div>}
      <div className='table-responsive'>
        <table className='table table-striped bg-white'>
          <thead>
            <tr>
              <th>Nomor Pesanan</th><th>Pemesan</th><th>Penerima</th><th>Alamat</th><th>Buku</th>
              <th>Total</th><th>Pembayaran</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((items) => {
              const o = items[0];
              const total = items.reduce((sum, i) => sum + Number(i.total_amount), 0);
              return (
                <tr key={o.order_number}>
                  <td>{o.order_number}</td>
                  <td>{o.customer?.name}</td>
                  <td>{o.recipient_name || '-'}<br /><small className='text-muted'>{o.phone}</small></td>
                  <td style={{ minWidth: 200 }}>{o.address || '-'}{o.note && <><br /><small className='text-muted'>Catatan: {o.note}</small></>}</td>
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
                  <td>
                    <select
                      className='form-select form-select-sm'
                      style={{ minWidth: 130 }}
                      value={o.status}
                      disabled={items.every((i) => i.status === 'cancelled')}
                      onChange={(e) => handleStatus(items, e.target.value)}
                    >
                      <option value='pending'>{statusLabels.pending}</option>
                      <option value='paid'>{statusLabels.paid}</option>
                      <option value='shipped'>{statusLabels.shipped}</option>
                      <option value='cancelled'>{statusLabels.cancelled}</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination meta={meta} onChange={setPage} />
    </>
  );
}
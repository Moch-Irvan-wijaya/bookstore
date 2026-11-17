import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api, { getErrorMessage } from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { rupiah } from '../../utils/format';
import '../../styles/admin.css';

const STATUS = {
  pending: { label: 'Menunggu', color: '#e0a82e' },
  paid: { label: 'Dibayar', color: '#2f4b9a' },
  shipped: { label: 'Dikirim', color: '#1f7a72' },
  cancelled: { label: 'Dibatalkan', color: '#8c2f39' },
};

// 1500000 menjadi 1,5 jt
const compact = (n) => Number(n).toLocaleString('id-ID', { notation: 'compact', maximumFractionDigits: 1 });

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [today] = useState(() => new Date().toLocaleDateString('id-ID', { dateStyle: 'full' }));

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, []);

  if (error) return <div className='alert alert-danger'>{error}</div>;
  if (!data) return <p className='text-muted'>Memuat dashboard...</p>;

  const { totals, status, sales_last_7_days: sales, recent_orders: recent, low_stock: lowStock, top_books: topBooks } = data;
  const maxSales = Math.max(...sales.map((d) => d.total), 0);
  const totalStatus = Object.values(status).reduce((a, b) => a + b, 0);

  const cards = [
    ['Pendapatan', rupiah(totals.revenue), 'Dari pesanan dibayar dan dikirim', '#1f7a72'],
    ['Total pesanan', totals.orders, `${status.pending} menunggu pembayaran`, '#2f4b9a'],
    ['Buku', totals.books, `${totals.genres} genre, ${totals.authors} author`, '#e0a82e'],
    ['Customer', totals.customers, `${totals.admins} admin`, '#8c2f39'],
  ];

  return (
    <>
      <div className='adm-head'>
        <h1 className='h4'>Halo, {user?.name}</h1>
        <p className='adm-date'>{today}</p>
      </div>

      <div className='adm-stats'>
        {cards.map(([label, value, sub, accent]) => (
          <div className='adm-stat' key={label} style={{ '--accent': accent }}>
            <div className='adm-stat-label'>{label}</div>
            <div className='adm-stat-value'>{value}</div>
            <div className='adm-stat-sub'>{sub}</div>
          </div>
        ))}
      </div>

      <div className='adm-cols'>
        <section className='adm-panel'>
          <div className='adm-panel-head'>
            <h2 className='adm-panel-title'>Nilai pesanan 7 hari terakhir</h2>
          </div>
          <div className='adm-bars'>
            {sales.map((d) => (
              <div className='adm-bar-col' key={d.date}>
                <span className='adm-bar-value'>{d.total > 0 ? compact(d.total) : ''}</span>
                <div className='adm-bar-track'>
                  <div className='adm-bar' style={{ height: maxSales ? `${(d.total / maxSales) * 100}%` : '0%' }} />
                </div>
                <span className='adm-bar-label'>{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className='adm-panel'>
          <div className='adm-panel-head'>
            <h2 className='adm-panel-title'>Status pesanan</h2>
          </div>
          <div className='adm-statusbar'>
            {Object.entries(STATUS).map(([key, s]) => (
              <div
                key={key}
                title={`${s.label}: ${status[key]}`}
                style={{ width: totalStatus ? `${(status[key] / totalStatus) * 100}%` : 0, background: s.color }}
              />
            ))}
          </div>
          <ul className='adm-legend'>
            {Object.entries(STATUS).map(([key, s]) => (
              <li key={key}>
                <span className='adm-dot' style={{ '--c': s.color }} />
                {s.label}
                <strong>{status[key]}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className='adm-cols'>
        <section className='adm-panel'>
          <div className='adm-panel-head'>
            <h2 className='adm-panel-title'>Pesanan terbaru</h2>
            <Link className='adm-panel-link' to='/admin/orders'>Lihat semua</Link>
          </div>
          {recent.length === 0 ? (
            <p className='adm-empty'>Belum ada pesanan.</p>
          ) : (
            <div className='table-responsive'>
              <table className='table align-middle mb-0'>
                <thead>
                  <tr><th>No. Pesanan</th><th>Pemesan</th><th>Buku</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td className='small'>{o.order_number}</td>
                      <td>{o.customer?.name}</td>
                      <td>{o.book?.title}</td>
                      <td>{rupiah(o.total_amount)}</td>
                      <td>
                        <span className='adm-pill' style={{ '--c': STATUS[o.status]?.color }}>
                          {STATUS[o.status]?.label || o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className='adm-stack'>
          <section className='adm-panel'>
            <div className='adm-panel-head'>
              <h2 className='adm-panel-title'>Stok menipis</h2>
              <Link className='adm-panel-link' to='/admin/books'>Kelola</Link>
            </div>
            {lowStock.length === 0 ? (
              <p className='adm-empty'>Semua stok aman.</p>
            ) : (
              <ul className='adm-list'>
                {lowStock.map((b) => (
                  <li key={b.id}>
                    <span className='title'>{b.title}</span>
                    <span className={`badge ${b.stock === 0 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                      {b.stock === 0 ? 'Habis' : `Sisa ${b.stock}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className='adm-panel'>
            <div className='adm-panel-head'>
              <h2 className='adm-panel-title'>Buku terlaris</h2>
            </div>
            {topBooks.length === 0 ? (
              <p className='adm-empty'>Belum ada penjualan.</p>
            ) : (
              <ul className='adm-list'>
                {topBooks.map((b, i) => (
                  <li key={i}>
                    <span className='title'>{i + 1}. {b.title}</span>
                    <strong>{b.sold} terjual</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
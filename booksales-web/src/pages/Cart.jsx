import { Link, useNavigate } from 'react-router';
import { useCart } from '../hooks/useCart';
import { rupiah } from '../utils/format';

export default function Cart() {
  const { items, updateQty, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className='text-center'>
        <p>Keranjang masih kosong.</p>
        <Link to='/' className='btn btn-primary'>Belanja sekarang</Link>
      </div>
    );
  }

  return (
    <div className='bg-white p-4 rounded shadow-sm'>
      <h1 className='h4 mb-3'>Keranjang Belanja</h1>
      <div className='table-responsive'>
        <table className='table align-middle'>
          <thead>
            <tr><th>Buku</th><th>Harga</th><th style={{ width: 110 }}>Jumlah</th><th>Subtotal</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(({ book, quantity }) => (
              <tr key={book.id}>
                <td><Link to={`/books/${book.id}`}>{book.title}</Link></td>
                <td>{rupiah(book.price)}</td>
                <td>
                  <input
                    type='number'
                    min={1}
                    max={book.stock}
                    className='form-control form-control-sm'
                    value={quantity}
                    onChange={(e) => updateQty(book.id, Math.max(1, Math.min(Number(e.target.value), book.stock)))}
                  />
                </td>
                <td>{rupiah(Number(book.price) * quantity)}</td>
                <td>
                  <button className='btn btn-sm btn-outline-danger' onClick={() => removeFromCart(book.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='d-flex justify-content-between align-items-center'>
        <h5 className='mb-0'>Total: {rupiah(total)}</h5>
        <button className='btn btn-success' onClick={() => navigate('/checkout')}>Lanjut ke Checkout</button>
      </div>
      <p className='small text-muted mt-3 mb-0'>
        Pada langkah berikutnya Anda mengisi data pemesan dan memilih metode pembayaran. Pesanan berstatus Menunggu sampai admin memverifikasi pembayaran.
      </p>
    </div>
  );
}
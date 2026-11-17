import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { rupiah } from '../utils/format';

const spineColors = ['#8c2f39', '#2f4b9a', '#1f7a72', '#14342b', '#b9801a'];

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        setBook(res.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, [id]);

  if (error) {
    return (
      <div className='text-center'>
        <div className='alert alert-danger'>{error}</div>
        <Link to='/' className='btn btn-primary'>Kembali ke Beranda</Link>
      </div>
    );
  }

  if (!book) {
    return <p className='text-center text-muted'>Memuat detail buku...</p>;
  }

  const spine = spineColors[(book.genre?.id || 0) % spineColors.length];
  const outOfStock = book.stock === 0;

  const handleAdd = (goToCart) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(book, quantity);
    if (goToCart) {
      navigate('/cart');
      return;
    }
    setNotice(`${quantity} buku "${book.title}" masuk ke keranjang`);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <>
      <nav className='small mb-3'>
        <Link to='/'>Beranda</Link> / <span className='text-muted'>{book.title}</span>
      </nav>

      <div className='bg-white p-4 rounded'>
        <div className='row g-4'>
          <div className='col-md-4'>
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className='detail-cover' />
            ) : (
              <div className='detail-cover-ph' style={{ '--spine': spine }}>{book.title}</div>
            )}
          </div>

          <div className='col-md-8'>
            <span className='badge bg-success mb-2'>{book.genre?.name}</span>
            <h1 className='h2 detail-title'>{book.title}</h1>
            <p className='text-muted mb-3'>Oleh {book.author?.name}</p>

            <p className='detail-price mb-1'>{rupiah(book.price)}</p>
            <p className='mb-4'>
              {outOfStock
                ? <span className='badge bg-secondary'>Stok habis</span>
                : <span className='text-success fw-semibold'>Stok tersedia: {book.stock}</span>}
            </p>

            {notice && (
              <div className='alert alert-success py-2'>
                {notice}. <Link to='/cart'>Lihat keranjang</Link>
              </div>
            )}

            <div className='d-flex flex-wrap align-items-end gap-3 mb-4'>
              <div style={{ width: 110 }}>
                <label className='form-label small mb-1' htmlFor='quantity'>Jumlah</label>
                <input
                  id='quantity'
                  type='number'
                  min={1}
                  max={book.stock}
                  className='form-control'
                  value={quantity}
                  disabled={outOfStock}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, book.stock)))}
                />
              </div>
              <button className='btn btn-success' disabled={outOfStock} onClick={() => handleAdd(false)}>
                Tambah ke keranjang
              </button>
              <button className='btn btn-primary' disabled={outOfStock} onClick={() => handleAdd(true)}>
                Beli sekarang
              </button>
            </div>

            <h2 className='h5'>Deskripsi Buku</h2>
            <p className='detail-description'>{book.description || 'Belum ada deskripsi untuk buku ini.'}</p>

            <h2 className='h5 mt-4'>Tentang Penulis</h2>
            <div className='d-flex gap-3 align-items-start'>
              {book.author?.photo_url && (
                <img src={book.author.photo_url} alt={book.author.name} className='author-photo' />
              )}
              <div>
                <p className='fw-semibold mb-1'>{book.author?.name}</p>
                <p className='mb-0 text-muted'>{book.author?.bio || 'Belum ada profil untuk penulis ini.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-3'>
        <Link to='/' className='btn btn-outline-secondary btn-sm'>Kembali ke daftar buku</Link>
      </div>
    </>
  );
}
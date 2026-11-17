import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api, { getErrorMessage } from '../api/axios';
import Pagination from '../components/Pagination';
import { rupiah } from '../utils/format';

const spineColors = ['#8c2f39', '#2f4b9a', '#1f7a72', '#14342b', '#b9801a'];
const spines = [[150, 38], [190, 46], [130, 32], [175, 42], [160, 36], [200, 50], [140, 34]];

export default function Home() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await api.get('/books', { params: { ...filters, page, per_page: 12 } });
        setBooks(res.data.data);
        setMeta(res.data.meta);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    loadBooks();
  }, [page, filters]);

  useEffect(() => {
    api.get('/genres').then((res) => setGenres(res.data.data));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search, genre_id: genreId });
    setPage(1);
  };

  return (
    <>
      <section className='hero'>
        <div>
          <h1>Rak buku Anda dimulai di sini</h1>
          <p className='mb-4'>Jelajahi novel, sejarah, dan buku teknologi dari penulis pilihan, lalu pesan dalam beberapa klik.</p>
          <form className='row g-2' onSubmit={handleSearch}>
            <div className='col-12'>
              <input className='form-control' placeholder='Cari judul buku' value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className='col-8'>
              <select className='form-select' value={genreId} onChange={(e) => setGenreId(e.target.value)}>
                <option value=''>Semua genre</option>
                {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className='col-4 d-grid'>
              <button className='btn btn-success' type='submit'>Cari buku</button>
            </div>
          </form>
        </div>
        <div className='shelf' aria-hidden='true'>
          {spines.map(([h, w], i) => (
            <span key={i} style={{ height: h, width: w, background: spineColors[i % spineColors.length], animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
      </section>

      {error && <div className='alert alert-danger'>{error}</div>}
      {books.length === 0 && !error && (
        <p className='text-center text-muted'>Buku tidak ditemukan. Coba kata kunci lain atau pilih Semua genre.</p>
      )}

      <div className='row g-4'>
        {books.map((book) => (
          <div className='col-6 col-md-4 col-lg-3' key={book.id}>
            <Link to={`/books/${book.id}`} className='book-link' aria-label={`Lihat detail buku ${book.title}`}>
              <div className='card h-100 book-card' style={{ '--spine': spineColors[(book.genre?.id || 0) % spineColors.length] }}>
                {book.cover_url ? (
                  <img src={book.cover_url} className='cover' alt={book.title} />
                ) : (
                  <div className='cover-ph'>{book.title}</div>
                )}
                <div className='card-body d-flex flex-column'>
                  <h5 className='book-title'>{book.title}</h5>
                  <p className='small text-muted mb-2'>{book.author?.name}, {book.genre?.name}</p>
                  <p className='price mb-1'>{rupiah(book.price)}</p>
                  <p className='small mb-3'>{book.stock > 0 ? `Stok ${book.stock}` : 'Stok habis'}</p>
                  <span className='btn btn-success btn-sm mt-auto'>Lihat detail</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <Pagination meta={meta} onChange={setPage} />
    </>
  );
}
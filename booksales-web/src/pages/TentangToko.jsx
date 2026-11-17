import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api from '../api/axios';
import { statusLabels } from '../utils/format';

const features = [
  ['Koleksi beragam', 'Buku dari berbagai genre dan penulis, lengkap dengan deskripsi dan profil penulis.'],
  ['Stok selalu terbaru', 'Jumlah stok diperbarui langsung, jadi Anda tahu buku mana yang masih tersedia.'],
  ['Pembayaran fleksibel', 'Pilih cash, QRIS, transfer bank, atau dompet digital sesuai kebiasaan Anda.'],
  ['Pesanan mudah dipantau', 'Lihat status dan rincian pesanan kapan saja lewat menu Pesanan Saya.'],
];

const steps = [
  ['Daftar atau login', 'Buat akun gratis, lalu masuk agar bisa berbelanja.'],
  ['Pilih buku', 'Cari berdasarkan judul atau genre, lalu klik buku untuk melihat deskripsi lengkapnya.'],
  ['Masukkan ke keranjang', 'Atur jumlah buku, stok yang tersedia ikut diperiksa.'],
  ['Isi data dan bayar', 'Lengkapi data pemesan, pilih metode pembayaran, lalu unggah bukti pembayaran.'],
  ['Pesanan tercatat', 'Rincian pesanan langsung tampil lengkap dengan nomor pesanan.'],
  ['Pantau status', 'Ikuti perkembangan pesanan di menu Pesanan Saya.'],
];

const statuses = [
  ['pending', 'Menunggu verifikasi pembayaran dari admin.', 'warning'],
  ['paid', 'Pembayaran sudah dikonfirmasi, pesanan disiapkan.', 'info'],
  ['shipped', 'Pesanan sedang dalam pengiriman.', 'success'],
  ['cancelled', 'Pesanan dibatalkan dan stok dikembalikan.', 'secondary'],
];

export default function TentangToko() {
  const [stats, setStats] = useState({ books: null, genres: [], authors: null });

  useEffect(() => {
    const load = async () => {
      try {
        const [books, genres, authors] = await Promise.all([
          api.get('/books', { params: { per_page: 1 } }),
          api.get('/genres'),
          api.get('/authors'),
        ]);
        setStats({
          books: books.data.meta.total,
          genres: genres.data.data,
          authors: authors.data.data.length,
        });
      } catch {
        // statistik hanya pemanis: halaman tetap tampil tanpa angka
      }
    };
    load();
  }, []);

  const numbers = [
    [stats.books, 'Judul buku'],
    [stats.genres.length || null, 'Pilihan genre'],
    [stats.authors, 'Penulis'],
  ];

  return (
    <>
      <section className='about-hero'>
        <p className='about-eyebrow'>Tentang BookStore</p>
        <h1>Toko buku online untuk pembaca Indonesia</h1>
        <p className='about-lead'>
          Dari memilih buku sampai membayar, semuanya selesai di satu website. Tanpa antre, tanpa ribet.
        </p>
        <div className='d-flex flex-wrap gap-2'>
          <Link to='/' className='btn btn-success'>Mulai belanja</Link>
          <Link to='/contact' className='btn btn-outline-light'>Hubungi kami</Link>
        </div>
      </section>

      <section className='row g-3 mb-5'>
        {numbers.map(([value, label]) => (
          <div className='col-4' key={label}>
            <div className='stat-card'>
              <div className='stat-number'>{value ?? '-'}</div>
              <div className='stat-label'>{label}</div>
            </div>
          </div>
        ))}
      </section>

      {stats.genres.length > 0 && (
        <section className='mb-5'>
          <h2 className='h4 mb-3'>Genre yang tersedia</h2>
          <div className='d-flex flex-wrap gap-2'>
            {stats.genres.map((g) => <span key={g.id} className='genre-chip'>{g.name}</span>)}
          </div>
        </section>
      )}

      <section className='mb-5'>
        <h2 className='h4 mb-3'>Kenapa belanja di BookStore</h2>
        <div className='row g-3'>
          {features.map(([title, text], index) => (
            <div className='col-sm-6 col-lg-3' key={title}>
              <div className='feature-card'>
                <span className='feature-number'>{index + 1}</span>
                <h3 className='h6'>{title}</h3>
                <p className='small text-muted mb-0'>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='mb-5'>
        <h2 className='h4 mb-3'>Cara berbelanja</h2>
        <ol className='timeline'>
          {steps.map(([title, text]) => (
            <li key={title}>
              <h3 className='h6 mb-1'>{title}</h3>
              <p className='mb-0 text-muted'>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className='mb-5'>
        <h2 className='h4 mb-3'>Arti status pesanan</h2>
        <div className='row g-3'>
          {statuses.map(([name, text, color]) => (
            <div className='col-sm-6 col-lg-3' key={name}>
              <div className='status-card'>
                <span className={`badge bg-${color} mb-2`}>{statusLabels[name]}</span>
                <p className='small mb-0'>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='about-cta'>
        <div>
          <h2 className='h4 mb-1'>Butuh bantuan?</h2>
          <p className='mb-0'>Pertanyaan, saran, atau kendala pesanan dapat dikirim lewat menu Kontak setelah Anda login.</p>
        </div>
        <Link to='/contact' className='btn btn-success'>Kirim pesan ke admin</Link>
      </section>
    </>
  );
}
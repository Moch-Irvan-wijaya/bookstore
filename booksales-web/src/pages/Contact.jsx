import { useState } from 'react';
import { Link } from 'react-router';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const topics = [
  ['Pertanyaan pesanan', 'Tanyakan status, pengiriman, atau perubahan pesanan. Sertakan nomor pesanan agar lebih cepat dicek.'],
  ['Kendala pembayaran', 'Laporkan jika bukti pembayaran salah unggah atau status pesanan belum berubah.'],
  ['Permintaan buku', 'Kabari kami judul buku yang ingin Anda temukan di BookStore.'],
  ['Saran dan masukan', 'Ceritakan pengalaman berbelanja Anda supaya layanan kami makin baik.'],
];

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin tidak boleh memakai fitur kontak: tampilkan pemberitahuan saja
  if (user?.role === 'admin') {
    return (
      <section className='bg-white p-4 rounded shadow-sm text-center mx-auto' style={{ maxWidth: 560 }}>
        <h1 className='h4 mb-3'>Fitur Kontak Khusus Pelanggan</h1>
        <div className='alert alert-warning'>
          Fitur kontak hanya dapat digunakan oleh pelanggan. Akun admin tidak dapat mengirim pesan ke admin.
        </div>
        <p className='text-muted'>Untuk membaca pesan yang dikirim pelanggan, buka halaman Pesan Masuk di dashboard admin.</p>
        <Link className='btn btn-success' to='/admin/messages'>Buka Pesan Masuk</Link>
      </section>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/messages', form);
      setSuccess(res.data.message);
      setForm({ subject: '', message: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <section className='about-hero mb-4'>
        <p className='about-eyebrow'>Kontak</p>
        <h1>Ada yang bisa kami bantu?</h1>
        <p className='about-lead mb-0'>
          Kirim pesan langsung kepada admin BookStore. Pesan Anda masuk ke dashboard admin dan dibaca oleh tim kami.
        </p>
      </section>

      <div className='row g-4'>
        <div className='col-lg-5'>
          <div className='bg-white p-4 rounded h-100'>
            <h2 className='h5 mb-3'>Pesan apa yang bisa dikirim?</h2>
            <ul className='list-unstyled mb-0'>
              {topics.map(([title, text]) => (
                <li key={title} className='mb-3'>
                  <p className='fw-semibold mb-0'>{title}</p>
                  <p className='small text-muted mb-0'>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='col-lg-7'>
          <div className='card'>
            <div className='card-body'>
              <h2 className='h5 mb-1'>Hubungi Admin</h2>
              <p className='small text-muted mb-3'>
                Dikirim sebagai <strong>{user?.name}</strong> ({user?.email}). Tulis subjek yang singkat dan pesan yang jelas.
              </p>
              {error && <div className='alert alert-danger'>{error}</div>}
              {success && <div className='alert alert-success'>{success}</div>}
              <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                  <label className='form-label' htmlFor='subject'>Subjek</label>
                  <input id='subject' name='subject' className='form-control' placeholder='Contoh: Pertanyaan status pesanan' value={form.subject} onChange={handleChange} maxLength={255} required />
                </div>
                <div className='mb-3'>
                  <label className='form-label' htmlFor='message'>Pesan</label>
                  <textarea id='message' name='message' rows={6} className='form-control' placeholder='Jelaskan pertanyaan atau kendala Anda. Jika menyangkut pesanan, sebutkan nomor pesanannya.' value={form.message} onChange={handleChange} required />
                </div>
                <button className='btn btn-primary' type='submit'>Kirim pesan</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
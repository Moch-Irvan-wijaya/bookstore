import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { rupiah } from '../utils/format';
import qrisImage from '../assets/qris.jpg';

// GANTI data di bawah ini dengan data pembayaran toko Anda yang sebenarnya.
const paymentOptions = [
  {
    value: 'cash',
    title: 'Cash',
    description: 'Bayar tunai saat buku diterima. Tidak perlu unggah bukti.',
    instructions: ['Siapkan uang pas saat buku tiba.', 'Admin akan menghubungi Anda untuk konfirmasi pengiriman.'],
  },
  {
    value: 'qris',
    title: 'QRIS',
    description: 'Scan kode QRIS dengan aplikasi bank atau dompet digital apa pun.',
    qrImage: qrisImage,
    instructions: ['Scan kode QRIS di bawah ini.', 'Bayar sesuai total pesanan.', 'Foto atau tangkap layar bukti pembayaran, lalu unggah.'],
  },
  {
    value: 'transfer',
    title: 'Transfer Bank',
    description: 'Transfer ke rekening toko, lalu unggah bukti transfer.',
    account: { bank: 'Bank Contoh', number: '1234567890', owner: 'BookStore' },
    instructions: ['Transfer sesuai total pesanan ke rekening di bawah ini.', 'Unggah foto bukti transfer.'],
  },
  {
    value: 'ewallet',
    title: 'Dompet Digital',
    description: 'Kirim ke nomor dompet digital toko, lalu unggah bukti pembayaran.',
    account: { bank: 'Dompet Digital Contoh', number: '081234567890', owner: 'BookStore' },
    instructions: ['Kirim sesuai total pesanan ke nomor di bawah ini.', 'Unggah tangkapan layar bukti pembayaran.'],
  },
];

const maximumProofSize = 2 * 1024 * 1024;

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    recipient_name: user?.name || '',
    phone: '',
    address: '',
    note: '',
    payment_method: 'cash',
  });
  const [proof, setProof] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // lepaskan alamat pratinjau foto dari memori saat foto diganti atau halaman ditutup
  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  }, [proofPreview]);

  if (done) return null;
  if (items.length === 0) return <Navigate to='/cart' replace />;

  const selected = paymentOptions.find((o) => o.value === form.payment_method);
  const needsProof = form.payment_method !== 'cash';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProof = (e) => {
    const file = e.target.files[0];
    setError('');
    if (!file) {
      setProof(null);
      setProofPreview('');
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Bukti pembayaran harus berupa foto berformat JPG atau PNG');
      e.target.value = '';
      return;
    }
    if (file.size > maximumProofSize) {
      setError('Ukuran foto bukti pembayaran maksimal 2 megabyte');
      e.target.value = '';
      return;
    }
    setProof(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (needsProof && !proof) {
      setError('Silakan unggah foto bukti pembayaran terlebih dahulu');
      return;
    }

    const data = new FormData();
    items.forEach((item, index) => {
      data.append(`items[${index}][book_id]`, item.book.id);
      data.append(`items[${index}][quantity]`, item.quantity);
    });
    data.append('recipient_name', form.recipient_name);
    data.append('phone', form.phone);
    data.append('address', form.address);
    data.append('note', form.note);
    data.append('payment_method', form.payment_method);
    if (needsProof) data.append('payment_proof', proof);

    setSubmitting(true);
    try {
      const res = await api.post('/transactions', data);
      setDone(true);
      clearCart();
      navigate('/order-success', { state: { order: res.data.data }, replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className='h4 mb-3'>Checkout</h1>
      {error && <div className='alert alert-danger'>{error}</div>}

      <div className='row g-4'>
        <div className='col-lg-8'>
          <section className='bg-white p-4 rounded mb-4'>
            <h2 className='h5 mb-3'><span className='step-number'>1</span> Data Pemesan</h2>
            <div className='row g-3'>
              <div className='col-md-6'>
                <label className='form-label' htmlFor='recipient_name'>Nama lengkap</label>
                <input id='recipient_name' name='recipient_name' className='form-control' value={form.recipient_name} onChange={handleChange} maxLength={255} required />
              </div>
              <div className='col-md-6'>
                <label className='form-label' htmlFor='phone'>Nomor telepon</label>
                <input id='phone' name='phone' type='tel' className='form-control' placeholder='Contoh: 081234567890' value={form.phone} onChange={handleChange} pattern='[0-9+\-\s]{8,20}' title='Angka, spasi, tanda plus, atau tanda hubung (8 sampai 20 karakter)' required />
              </div>
              <div className='col-12'>
                <label className='form-label' htmlFor='address'>Alamat pengiriman</label>
                <textarea id='address' name='address' rows={3} className='form-control' placeholder='Nama jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos' value={form.address} onChange={handleChange} maxLength={500} required />
              </div>
              <div className='col-12'>
                <label className='form-label' htmlFor='note'>Catatan untuk penjual (tidak wajib)</label>
                <input id='note' name='note' className='form-control' placeholder='Contoh: titip ke satpam' value={form.note} onChange={handleChange} maxLength={500} />
              </div>
            </div>
          </section>

          <section className='bg-white p-4 rounded mb-4'>
            <h2 className='h5 mb-3'><span className='step-number'>2</span> Metode Pembayaran</h2>
            <div className='row g-3 mb-3'>
              {paymentOptions.map((option) => (
                <div className='col-sm-6' key={option.value}>
                  <label className={'pay-option' + (form.payment_method === option.value ? ' selected' : '')}>
                    <input
                      type='radio'
                      name='payment_method'
                      value={option.value}
                      checked={form.payment_method === option.value}
                      onChange={handleChange}
                    />
                    <span>
                      <strong>{option.title}</strong>
                      <small className='d-block text-muted'>{option.description}</small>
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div className='pay-instructions'>
              <p className='fw-semibold mb-2'>Cara pembayaran {selected.title}</p>
              <ol className='mb-3'>
                {selected.instructions.map((text) => <li key={text}>{text}</li>)}
              </ol>
              {selected.qrImage && (
                <div className="text-center my-3">
                  <img
                    src={selected.qrImage}
                    alt="Kode QRIS toko"
                    className="img-fluid rounded"
                    style={{
                      maxWidth: '280px',
                      width: '100%',
                      height: 'auto',
                      border: '1px solid #ddd',
                      padding: '10px',
                      backgroundColor: '#fff'
                    }}
                  />
                </div>
              )}
              {selected.account && (
                <div className='account-box'>
                  <div><span className='text-muted'>Tujuan</span> <strong>{selected.account.bank}</strong></div>
                  <div><span className='text-muted'>Nomor</span> <strong>{selected.account.number}</strong></div>
                  <div><span className='text-muted'>Atas nama</span> <strong>{selected.account.owner}</strong></div>
                </div>
              )}
              <p className='fw-semibold mt-3 mb-0'>Total yang harus dibayar: {rupiah(total)}</p>
            </div>
          </section>

          {needsProof && (
            <section className='bg-white p-4 rounded mb-4'>
              <h2 className='h5 mb-3'><span className='step-number'>3</span> Bukti Pembayaran</h2>
              <p className='text-muted'>Setelah membayar, unggah foto bukti pembayaran (format JPG atau PNG, maksimal 2 megabyte).</p>
              <input type='file' accept='image/png,image/jpeg' className='form-control' onChange={handleProof} />
              {proofPreview && (
                <img src={proofPreview} alt='Pratinjau bukti pembayaran' className='proof-preview mt-3' />
              )}
            </section>
          )}
        </div>

        <div className='col-lg-4'>
          <aside className='bg-white p-4 rounded summary-box'>
            <h2 className='h5 mb-3'>Ringkasan Pesanan</h2>
            <ul className='list-unstyled mb-3'>
              {items.map(({ book, quantity }) => (
                <li key={book.id} className='d-flex justify-content-between gap-2 mb-2'>
                  <span>{book.title} <small className='text-muted'>x {quantity}</small></span>
                  <span className='text-nowrap'>{rupiah(Number(book.price) * quantity)}</span>
                </li>
              ))}
            </ul>
            <hr />
            <div className='d-flex justify-content-between fw-bold mb-3'>
              <span>Total</span>
              <span>{rupiah(total)}</span>
            </div>
            <div className='d-grid gap-2'>
              <button className='btn btn-success' type='submit' disabled={submitting}>
                {submitting ? 'Memproses pesanan...' : 'Buat Pesanan'}
              </button>
              <button className='btn btn-outline-secondary' type='button' disabled={submitting} onClick={() => navigate('/cart')}>
                Kembali ke keranjang
              </button>
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
}
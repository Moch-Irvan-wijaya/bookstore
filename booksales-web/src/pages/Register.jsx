import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import api, { getErrorMessage } from '../api/axios';
import '../styles/auth.css';

const spines = [
  [60, 20, '#2f4b9a'], [90, 28, '#e0a82e'], [75, 24, '#8c2f39'],
  [100, 30, '#1f7a72'], [65, 22, '#2f4b9a'], [85, 26, '#8c2f39'],
];

// skor 0 sampai 4: panjang, huruf besar dan kecil, angka, simbol
const passwordScore = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};
const scoreLabel = ['Terlalu pendek', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const score = form.password ? passwordScore(form.password) : 0;
  const confirmFilled = form.password_confirmation.length > 0;
  const confirmMatch = form.password === form.password_confirmation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!confirmMatch) {
      setError('Konfirmasi password tidak sama');
      return;
    }

    setLoading(true);
    try {
      await api.post('/register', form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className='auth-wrap'>
      <aside className='auth-aside'>
        <div>
          <div className='auth-brand'>Book<span>Store</span></div>
          <h2>Gabung dengan BookStore</h2>
          <p>
            BookStore adalah toko buku online untuk pembaca Indonesia. Dengan akun gratis, Anda bisa
            menyimpan keranjang, memesan buku, dan memantau pesanan kapan saja.
          </p>
        </div>
        <ul className='auth-points'>
          <li><span className='dot'>1</span><span>Gratis dan selesai dalam satu menit</span></li>
          <li><span className='dot'>2</span><span>Riwayat pesanan tersimpan rapi di akun Anda</span></li>
          <li><span className='dot'>3</span><span>Password Anda disimpan terenkripsi (di-hash), bukan teks biasa</span></li>
        </ul>
        <div className='auth-shelf' aria-hidden='true'>
          {spines.map(([h, w, c], i) => (
            <span key={i} style={{ height: h, width: w, background: c }} />
          ))}
        </div>
      </aside>

      <div className='auth-form'>
        <h1>Buat akun baru</h1>
        <p className='auth-sub'>Isi data berikut untuk mulai berbelanja.</p>

        {error && <div className='alert alert-danger'>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label className='form-label' htmlFor='reg-name'>Nama lengkap</label>
            <input
              id='reg-name'
              name='name'
              className='form-control'
              placeholder='Nama Anda'
              autoComplete='name'
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className='mb-3'>
            <label className='form-label' htmlFor='reg-email'>Email</label>
            <input
              id='reg-email'
              type='email'
              name='email'
              className='form-control'
              placeholder='nama@email.com'
              autoComplete='email'
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className='mb-3'>
            <label className='form-label' htmlFor='reg-password'>Password</label>
            <div className='auth-pass'>
              <input
                id='reg-password'
                type={showPassword ? 'text' : 'password'}
                name='password'
                className='form-control'
                placeholder='Minimal 8 karakter'
                autoComplete='new-password'
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button type='button' className='auth-toggle' onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
            {form.password && (
              <>
                <div className={`pw-meter s${score}`} aria-hidden='true'>
                  <span /><span /><span /><span />
                </div>
                <div className='pw-hint'>Kekuatan password: {scoreLabel[score]}</div>
              </>
            )}
          </div>
          <div className='mb-4'>
            <label className='form-label' htmlFor='reg-confirm'>Ulangi password</label>
            <input
              id='reg-confirm'
              type={showPassword ? 'text' : 'password'}
              name='password_confirmation'
              className={`form-control ${confirmFilled ? (confirmMatch ? 'is-valid' : 'is-invalid') : ''}`}
              placeholder='Ketik ulang password'
              autoComplete='new-password'
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />
            {confirmFilled && !confirmMatch && <div className='invalid-feedback'>Password belum sama</div>}
          </div>
          <button className='btn btn-primary w-100 py-2' type='submit' disabled={loading}>
            {loading ? 'Memproses...' : 'Buat akun'}
          </button>
        </form>

        <p className='auth-switch'>
          Sudah punya akun? <Link to='/login'>Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
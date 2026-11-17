import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/axios';
import '../styles/auth.css';

const spines = [
  [70, 22, '#8c2f39'], [95, 28, '#2f4b9a'], [60, 20, '#e0a82e'],
  [85, 26, '#1f7a72'], [100, 30, '#8c2f39'], [75, 22, '#2f4b9a'],
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
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
          <h2>Selamat datang kembali</h2>
          <p>Masuk untuk melanjutkan belanja, memantau pesanan, dan mengelola akun Anda.</p>
        </div>
        <ul className='auth-points'>
          <li><span className='dot'>1</span><span>Katalog buku dari berbagai genre dan penulis</span></li>
          <li><span className='dot'>2</span><span>Pantau status pesanan dari pembayaran sampai pengiriman</span></li>
          <li><span className='dot'>3</span><span>Pilihan bayar: cash, QRIS, transfer, dan dompet digital</span></li>
        </ul>
        <div className='auth-shelf' aria-hidden='true'>
          {spines.map(([h, w, c], i) => (
            <span key={i} style={{ height: h, width: w, background: c }} />
          ))}
        </div>
      </aside>

      <div className='auth-form'>
        <h1>Masuk ke akun Anda</h1>
        <p className='auth-sub'>Gunakan email dan password yang terdaftar.</p>

        {justRegistered && <div className='alert alert-success'>Registrasi berhasil. Silakan masuk.</div>}
        {error && <div className='alert alert-danger'>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label className='form-label' htmlFor='login-email'>Email</label>
            <input
              id='login-email'
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
          <div className='mb-4'>
            <label className='form-label' htmlFor='login-password'>Password</label>
            <div className='auth-pass'>
              <input
                id='login-password'
                type={showPassword ? 'text' : 'password'}
                name='password'
                className='form-control'
                placeholder='Masukkan password'
                autoComplete='current-password'
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type='button' className='auth-toggle' onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
          </div>
          <button className='btn btn-primary w-100 py-2' type='submit' disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className='auth-switch'>
          Belum punya akun? <Link to='/register'>Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
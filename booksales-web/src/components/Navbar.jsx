import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { CartIcon, UserIcon } from './Icons';

const pill = ({ isActive }) => 'nav-pill' + (isActive ? ' active' : '');

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    clearCart();
    navigate('/login');
  };

  return (
    <nav className='site-nav'>
      <div className='container d-flex flex-wrap align-items-center justify-content-between gap-2 py-2'>
        <Link className='brand' to='/'>Book<span>Store</span></Link>
        <div className='d-flex flex-wrap align-items-center gap-1'>
          <NavLink className={pill} to='/' end>Beranda</NavLink>
          <NavLink className={pill} to='/tentang-toko'>Tentang Toko</NavLink>
          {user && (
            <>
              <NavLink className={pill} to='/contact'>Kontak</NavLink>
              <NavLink className={pill} to='/orders'>Pesanan Saya</NavLink>
              <NavLink className={pill} to='/cart' aria-label='Keranjang' title='Keranjang'>
                <CartIcon /> <span className='badge bg-light text-dark'>{items.length}</span>
              </NavLink>
            </>
          )}
          {user?.role === 'admin' && <NavLink className={pill} to='/admin'>Dashboard Admin</NavLink>}
          {user ? (
            <>
              <NavLink className={pill} to='/profile' title='Profil saya'>
                {user.photo_url ? (
                  <img src={user.photo_url} alt='' className='nav-avatar' />
                ) : (
                  <UserIcon />
                )}{' '}
                {user.name}
              </NavLink>
              <button className='btn btn-outline-light btn-sm' onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink className={pill} to='/login'>Login</NavLink>
              <Link className='btn btn-success btn-sm ms-1' to='/register'>Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
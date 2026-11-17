import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import '../styles/admin.css';

const menus = [
  ['/admin', 'Dashboard'],
  ['/admin/genres', 'Genre'],
  ['/admin/authors', 'Author'],
  ['/admin/books', 'Buku'],
  ['/admin/users', 'User'],
  ['/admin/orders', 'Pesanan'],
  ['/admin/messages', 'Pesan Masuk'],
  ['/admin/profile', 'Profil'],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className='container-fluid'>
      <div className='row'>
        <aside className='col-md-2 admin-side p-3 d-flex flex-column'>
          <div className='d-flex align-items-center gap-2 mb-3'>
            {user?.photo_url && <img src={user.photo_url} alt='' className='admin-side-avatar' />}
            <div>
              <h5 className='text-white mb-0'>Admin BookStore</h5>
              <p className='small text-white-50 mb-0'>{user?.name}</p>
            </div>
          </div>
          <ul className='nav flex-column'>
            {menus.map(([to, label]) => (
              <li className='nav-item' key={to}>
                <NavLink end={to === '/admin'} to={to} className='nav-link'>{label}</NavLink>
              </li>
            ))}
          </ul>
          <div className='admin-side-footer'>
            <NavLink to='/' className='btn btn-outline-light btn-sm'>Lihat toko</NavLink>
            <button type='button' className='btn btn-sm admin-logout' onClick={handleLogout}>Logout</button>
          </div>
        </aside>
        <main className='col-md-10 p-4'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
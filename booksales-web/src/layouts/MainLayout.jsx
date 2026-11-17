import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <div className='container py-4'>
        <Outlet />
      </div>
      <footer className='site-footer'>
        <div className='container'>BookStore 2026. Toko buku online untuk pembaca Indonesia.</div>
      </footer>
    </>
  );
}

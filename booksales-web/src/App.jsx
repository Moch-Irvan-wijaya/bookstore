import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TentangToko from './pages/TentangToko';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import Dashboard from './pages/admin/Dashboard';
import Genres from './pages/admin/Genres';
import Authors from './pages/admin/Authors';
import Books from './pages/admin/Books';
import Users from './pages/admin/Users';
import Orders from './pages/admin/Orders';
import Messages from './pages/admin/Messages';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path='/' element={<Home />} />
              <Route path='/books/:id' element={<BookDetail />} />
              <Route path='/tentang-toko' element={<TentangToko />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/contact' element={<ProtectedRoute><Contact /></ProtectedRoute>} />
              <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path='/order-success' element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
              <Route path='/orders' element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Route>

            <Route path='/admin' element={<ProtectedRoute role='admin'><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path='genres' element={<Genres />} />
              <Route path='authors' element={<Authors />} />
              <Route path='books' element={<Books />} />
              <Route path='users' element={<Users />} />
              <Route path='orders' element={<Orders />} />
              <Route path='messages' element={<Messages />} />
              <Route path='profile' element={<Profile />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
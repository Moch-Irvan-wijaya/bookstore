import { useState } from 'react';
import api from '../api/axios';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // token sudah kadaluarsa: tetap lanjut membersihkan sesi lokal
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // dipakai halaman Profil setelah data user diperbarui
  const updateUser = (next) => {
    localStorage.setItem('user', JSON.stringify(next));
    setUser(next);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api/axios';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/admin.css';

const emptyForm = { name: '', email: '', password: '', role: 'customer' };

export default function Users() {
  const { user: me, updateUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/users', {
          params: { page, search: search || undefined, role: role || undefined },
        });
        setUsers(res.data.data);
        setMeta(res.data.meta);
        setError('');
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, [page, search, role, reload]);

  // tutup modal dengan tombol Escape
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const offset = meta ? (meta.current_page - 1) * meta.per_page : 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleRole = (e) => {
    setPage(1);
    setRole(e.target.value);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditId(u.id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    const payload = { name: form.name, email: form.email, role: form.role };
    if (!editId || form.password) payload.password = form.password;

    try {
      if (editId) {
        const res = await api.put(`/users/${editId}`, payload);
        // jika admin mengubah akunnya sendiri, perbarui nama di sidebar
        if (editId === me?.id) updateUser({ ...me, ...res.data.data });
        setNotice('User berhasil diperbarui');
      } else {
        await api.post('/users', payload);
        setPage(1);
        setNotice('User berhasil ditambahkan');
      }
      setModalOpen(false);
      setReload((r) => r + 1);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Hapus user ${u.name}?`)) return;
    setError('');
    try {
      await api.delete(`/users/${u.id}`);
      setNotice('User berhasil dihapus');
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setReload((r) => r + 1);
      }
    } catch (err) {
      setNotice('');
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className='adm-head'>
        <h1 className='h4'>Kelola User</h1>
        <button className='btn btn-primary' onClick={openCreate}>+ Tambah user</button>
      </div>

      {error && <div className='alert alert-danger'>{error}</div>}
      {notice && <div className='alert alert-success'>{notice}</div>}

      <div className='adm-toolbar'>
        <form onSubmit={handleSearch}>
          <input
            className='form-control'
            placeholder='Cari nama atau email'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className='btn btn-outline-secondary' type='submit'>Cari</button>
        </form>
        <select className='form-select' value={role} onChange={handleRole} aria-label='Filter role'>
          <option value=''>Semua role</option>
          <option value='admin'>Admin</option>
          <option value='customer'>Customer</option>
        </select>
      </div>

      <div className='table-responsive'>
        <table className='table table-striped bg-white align-middle'>
          <thead>
            <tr><th>#</th><th>Nama</th><th>Email</th><th>Role</th><th>Terakhir akses</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td>{offset + i + 1}</td>
                <td>
                  {u.name} {u.id === me?.id && <span className='badge bg-secondary'>Anda</span>}
                </td>
                <td>{u.email}</td>
                <td>
                  <span className='adm-pill' style={{ '--c': u.role === 'admin' ? '#8c2f39' : '#1f7a72' }}>
                    {u.role === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td>{u.last_access ? new Date(u.last_access).toLocaleString('id-ID') : '-'}</td>
                <td className='d-flex gap-2'>
                  <button className='btn btn-sm btn-warning' onClick={() => openEdit(u)}>Edit</button>
                  {u.id !== me?.id && (
                    <button className='btn btn-sm btn-danger' onClick={() => handleDelete(u)}>Hapus</button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className='text-center text-muted'>User tidak ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination meta={meta} onChange={setPage} />

      {modalOpen && (
        <div className='adm-modal-backdrop' onClick={closeModal}>
          <div
            className='adm-modal'
            role='dialog'
            aria-modal='true'
            aria-labelledby='user-modal-title'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='adm-modal-head'>
              <h2 id='user-modal-title' className='h5 mb-0'>{editId ? 'Ubah user' : 'Tambah user'}</h2>
              <button type='button' className='btn-close' aria-label='Tutup' onClick={closeModal} />
            </div>

            {formError && <div className='alert alert-danger'>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className='mb-3'>
                <label className='form-label' htmlFor='u-name'>Nama</label>
                <input id='u-name' name='name' className='form-control' value={form.name} onChange={handleChange} required />
              </div>
              <div className='mb-3'>
                <label className='form-label' htmlFor='u-email'>Email</label>
                <input id='u-email' type='email' name='email' className='form-control' value={form.email} onChange={handleChange} required />
              </div>
              <div className='mb-3'>
                <label className='form-label' htmlFor='u-role'>Role</label>
                <select
                  id='u-role'
                  name='role'
                  className='form-select'
                  value={form.role}
                  onChange={handleChange}
                  disabled={editId === me?.id}
                >
                  <option value='customer'>Customer</option>
                  <option value='admin'>Admin</option>
                </select>
                {editId === me?.id && <div className='form-text'>Role akun Anda sendiri tidak bisa diubah.</div>}
              </div>
              <div className='mb-4'>
                <label className='form-label' htmlFor='u-password'>Password</label>
                <input
                  id='u-password'
                  type='password'
                  name='password'
                  className='form-control'
                  placeholder={editId ? 'Kosongkan jika tidak diganti' : 'Minimal 8 karakter'}
                  autoComplete='new-password'
                  value={form.password}
                  onChange={handleChange}
                  required={!editId}
                  minLength={8}
                />
              </div>
              <div className='d-flex justify-content-end gap-2'>
                <button type='button' className='btn btn-outline-secondary' onClick={closeModal}>Batal</button>
                <button type='submit' className='btn btn-primary' disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
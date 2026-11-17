import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api/axios';

const emptyForm = { name: '', description: '' };

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/genres');
        setGenres(res.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, [reload]);

  const refresh = () => setReload((n) => n + 1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await api.put(`/genres/${editId}`, form);
      } else {
        await api.post('/genres', form);
      }
      setForm(emptyForm);
      setEditId(null);
      refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEdit = (g) => {
    setEditId(g.id);
    setForm({ name: g.name, description: g.description || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus genre ini?')) return;
    try {
      await api.delete(`/genres/${id}`);
      refresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <>
      <h1 className='h4 mb-3'>Kelola Genre</h1>
      {error && <div className='alert alert-danger'>{error}</div>}

      <form className='card card-body mb-4' onSubmit={handleSubmit}>
        <div className='row g-2'>
          <div className='col-md-4'>
            <input name='name' className='form-control' placeholder='Nama genre' value={form.name} onChange={handleChange} required />
          </div>
          <div className='col-md-5'>
            <input name='description' className='form-control' placeholder='Deskripsi' value={form.description} onChange={handleChange} />
          </div>
          <div className='col-md-3 d-flex gap-2'>
            <button className='btn btn-primary' type='submit'>{editId ? 'Simpan perubahan' : 'Tambah'}</button>
            {editId && (
              <button className='btn btn-secondary' type='button' onClick={() => { setEditId(null); setForm(emptyForm); }}>Batal</button>
            )}
          </div>
        </div>
      </form>

      <div className='table-responsive'>
        <table className='table table-striped bg-white'>
          <thead>
            <tr><th>#</th><th>Nama</th><th>Deskripsi</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {genres.map((g, i) => (
              <tr key={g.id}>
                <td>{i + 1}</td>
                <td>{g.name}</td>
                <td>{g.description}</td>
                <td className='d-flex gap-2'>
                  <button className='btn btn-sm btn-warning' onClick={() => handleEdit(g)}>Edit</button>
                  <button className='btn btn-sm btn-danger' onClick={() => handleDelete(g.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
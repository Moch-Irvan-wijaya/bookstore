import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api/axios';

const emptyForm = { name: '', bio: '' };

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/authors');
        setAuthors(res.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, [reload]);

  const refresh = () => setReload((n) => n + 1);

  const resetForm = () => {
    setForm(emptyForm);
    setPhoto(null);
    setEditId(null);
    setFileKey(fileKey + 1);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    data.append('name', form.name);
    data.append('bio', form.bio);
    if (photo) data.append('photo', photo);

    try {
      if (editId) {
        data.append('_method', 'PUT');
        await api.post(`/authors/${editId}`, data);
      } else {
        await api.post('/authors', data);
      }
      resetForm();
      refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEdit = (a) => {
    setEditId(a.id);
    setForm({ name: a.name, bio: a.bio || '' });
    setPhoto(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus author ini?')) return;
    try {
      await api.delete(`/authors/${id}`);
      refresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <>
      <h1 className='h4 mb-3'>Kelola Author</h1>
      {error && <div className='alert alert-danger'>{error}</div>}

      <form className='card card-body mb-4' onSubmit={handleSubmit}>
        <div className='row g-2'>
          <div className='col-md-3'>
            <input name='name' className='form-control' placeholder='Nama author' value={form.name} onChange={handleChange} required />
          </div>
          <div className='col-md-4'>
            <input name='bio' className='form-control' placeholder='Bio singkat' value={form.bio} onChange={handleChange} />
          </div>
          <div className='col-md-3'>
            <input key={fileKey} type='file' accept='image/*' className='form-control' onChange={(e) => setPhoto(e.target.files[0])} />
          </div>
          <div className='col-md-2 d-flex gap-2'>
            <button className='btn btn-primary' type='submit'>{editId ? 'Simpan' : 'Tambah'}</button>
            {editId && <button className='btn btn-secondary' type='button' onClick={resetForm}>Batal</button>}
          </div>
        </div>
      </form>

      <div className='table-responsive'>
        <table className='table table-striped bg-white align-middle'>
          <thead>
            <tr><th>#</th><th>Foto</th><th>Nama</th><th>Bio</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {authors.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td>{a.photo_url ? <img src={a.photo_url} alt={a.name} width={48} height={48} style={{ objectFit: 'cover' }} /> : '-'}</td>
                <td>{a.name}</td>
                <td>{a.bio}</td>
                <td className='d-flex gap-2'>
                  <button className='btn btn-sm btn-warning' onClick={() => handleEdit(a)}>Edit</button>
                  <button className='btn btn-sm btn-danger' onClick={() => handleDelete(a.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
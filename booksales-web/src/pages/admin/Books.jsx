import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api/axios';
import { rupiah } from '../../utils/format';

const emptyForm = { title: '', description: '', price: '', stock: '', genre_id: '', author_id: '' };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [cover, setCover] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [b, g, a] = await Promise.all([api.get('/books'), api.get('/genres'), api.get('/authors')]);
        setBooks(b.data.data);
        setGenres(g.data.data);
        setAuthors(a.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, [reload]);

  const refresh = () => setReload((n) => n + 1);

  const resetForm = () => {
    setForm(emptyForm);
    setCover(null);
    setEditId(null);
    setFileKey(fileKey + 1);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (cover) data.append('cover_photo', cover);

    try {
      if (editId) {
        data.append('_method', 'PUT');
        await api.post(`/books/${editId}`, data);
      } else {
        await api.post('/books', data);
      }
      resetForm();
      refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEdit = (b) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      description: b.description || '',
      price: b.price,
      stock: b.stock,
      genre_id: b.genre?.id || '',
      author_id: b.author?.id || '',
    });
    setCover(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus buku ini?')) return;
    try {
      await api.delete(`/books/${id}`);
      refresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <>
      <h1 className='h4 mb-3'>Kelola Buku</h1>
      {error && <div className='alert alert-danger'>{error}</div>}

      <form className='card card-body mb-4' onSubmit={handleSubmit}>
        <div className='row g-2'>
          <div className='col-md-6'>
            <input name='title' className='form-control' placeholder='Judul buku' value={form.title} onChange={handleChange} required />
          </div>
          <div className='col-md-3'>
            <input name='price' type='number' min='0' className='form-control' placeholder='Harga' value={form.price} onChange={handleChange} required />
          </div>
          <div className='col-md-3'>
            <input name='stock' type='number' min='0' className='form-control' placeholder='Stok' value={form.stock} onChange={handleChange} required />
          </div>
          <div className='col-md-4'>
            <select name='genre_id' className='form-select' value={form.genre_id} onChange={handleChange} required>
              <option value=''>Pilih genre</option>
              {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className='col-md-4'>
            <select name='author_id' className='form-select' value={form.author_id} onChange={handleChange} required>
              <option value=''>Pilih author</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className='col-md-4'>
            <input key={fileKey} type='file' accept='image/*' className='form-control' onChange={(e) => setCover(e.target.files[0])} />
          </div>
          <div className='col-12'>
            <textarea name='description' rows={2} className='form-control' placeholder='Deskripsi' value={form.description} onChange={handleChange} />
          </div>
          <div className='col-12 d-flex gap-2'>
            <button className='btn btn-primary' type='submit'>{editId ? 'Simpan perubahan' : 'Tambah buku'}</button>
            {editId && <button className='btn btn-secondary' type='button' onClick={resetForm}>Batal</button>}
          </div>
        </div>
      </form>

      <div className='table-responsive'>
        <table className='table table-striped bg-white align-middle'>
          <thead>
            <tr><th>Cover</th><th>Judul</th><th>Genre</th><th>Author</th><th>Harga</th><th>Stok</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>{b.cover_url ? <img src={b.cover_url} alt={b.title} width={40} /> : '-'}</td>
                <td>{b.title}</td>
                <td>{b.genre?.name}</td>
                <td>{b.author?.name}</td>
                <td>{rupiah(b.price)}</td>
                <td>{b.stock}</td>
                <td className='d-flex gap-2'>
                  <button className='btn btn-sm btn-warning' onClick={() => handleEdit(b)}>Edit</button>
                  <button className='btn btn-sm btn-danger' onClick={() => handleDelete(b.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
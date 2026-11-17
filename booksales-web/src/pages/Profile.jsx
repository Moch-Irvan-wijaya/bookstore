import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const roleLabel = { admin: 'Admin', customer: 'Pelanggan' };
const emptyPasswords = { current_password: '', password: '', password_confirmation: '' };
const maximumPhotoSize = 2 * 1024 * 1024;

const formatDate = (value, withTime = false) => {
  if (!value) return '-';
  const date = new Date(value);
  return withTime ? date.toLocaleString('id-ID') : date.toLocaleDateString('id-ID');
};

function Notice({ notice }) {
  if (!notice) return null;
  return <div className={`alert alert-${notice.type} py-2`}>{notice.text}</div>;
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [profileNotice, setProfileNotice] = useState(null);
  const [passwordNotice, setPasswordNotice] = useState(null);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoNotice, setPhotoNotice] = useState(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoInputKey, setPhotoInputKey] = useState(0);

  // lepaskan alamat pratinjau foto dari memori saat foto diganti atau halaman ditutup
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const resetPhotoInput = () => {
    setPhoto(null);
    setPhotoPreview('');
    setPhotoInputKey((key) => key + 1);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoNotice(null);

    if (!file) {
      setPhoto(null);
      setPhotoPreview('');
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoNotice({ type: 'danger', text: 'Foto profil harus berformat JPG atau PNG.' });
      e.target.value = '';
      return;
    }
    if (file.size > maximumPhotoSize) {
      setPhotoNotice({ type: 'danger', text: 'Ukuran foto profil maksimal 2 megabyte.' });
      e.target.value = '';
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoSave = async () => {
    if (!photo) return;
    setPhotoNotice(null);
    setPhotoSaving(true);

    const data = new FormData();
    data.append('photo', photo);

    try {
      const res = await api.post('/profile/photo', data);
      updateUser({ ...user, ...res.data.data });
      resetPhotoInput();
      setPhotoNotice({ type: 'success', text: 'Foto profil berhasil diperbarui.' });
    } catch (err) {
      setPhotoNotice({ type: 'danger', text: getErrorMessage(err) });
    } finally {
      setPhotoSaving(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!window.confirm('Hapus foto profil Anda?')) return;
    setPhotoNotice(null);
    setPhotoSaving(true);

    try {
      const res = await api.delete('/profile/photo');
      updateUser({ ...user, ...res.data.data });
      resetPhotoInput();
      setPhotoNotice({ type: 'success', text: 'Foto profil berhasil dihapus.' });
    } catch (err) {
      setPhotoNotice({ type: 'danger', text: getErrorMessage(err) });
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileNotice(null);
    try {
      const res = await api.put('/profile', form);
      updateUser({ ...user, ...res.data.data });
      setProfileNotice({ type: 'success', text: 'Profil berhasil diperbarui.' });
    } catch (err) {
      setProfileNotice({ type: 'danger', text: getErrorMessage(err) });
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPasswordNotice(null);
    try {
      await api.put('/profile/password', passwords);
      setPasswords(emptyPasswords);
      setPasswordNotice({ type: 'success', text: 'Password berhasil diubah.' });
    } catch (err) {
      setPasswordNotice({ type: 'danger', text: getErrorMessage(err) });
    }
  };

  const avatarSource = photoPreview || user.photo_url;

  return (
    <div className='row g-4'>
      <div className='col-md-4'>
        <div className='bg-white p-4 rounded shadow-sm text-center'>
          {avatarSource ? (
            <img src={avatarSource} alt={`Foto profil ${user.name}`} className='profile-avatar-image d-block mx-auto mb-3' />
          ) : (
            <div className='profile-avatar mx-auto mb-3'>{user.name.charAt(0).toUpperCase()}</div>
          )}
          <h1 className='h5 mb-1'>{user.name}</h1>
          <span className='badge bg-success mb-3'>{roleLabel[user.role] || user.role}</span>
          <p className='small text-muted mb-1'>{user.email}</p>
          <p className='small text-muted mb-1'>Bergabung: {formatDate(user.created_at)}</p>
          <p className='small text-muted mb-3'>Login terakhir: {formatDate(user.last_access, true)}</p>

          <hr />
          <Notice notice={photoNotice} />
          <label className='form-label small text-start d-block' htmlFor='profile-photo'>
            Ganti foto profil (JPG atau PNG, maksimal 2 megabyte)
          </label>
          <input
            key={photoInputKey}
            id='profile-photo'
            type='file'
            accept='image/png,image/jpeg'
            className='form-control form-control-sm mb-2'
            onChange={handlePhotoChange}
            disabled={photoSaving}
          />
          <div className='d-grid gap-2'>
            {photo && (
              <>
                <button type='button' className='btn btn-success btn-sm' onClick={handlePhotoSave} disabled={photoSaving}>
                  {photoSaving ? 'Menyimpan...' : 'Simpan foto'}
                </button>
                <button type='button' className='btn btn-outline-secondary btn-sm' onClick={resetPhotoInput} disabled={photoSaving}>
                  Batal
                </button>
              </>
            )}
            {!photo && user.photo_url && (
              <button type='button' className='btn btn-outline-danger btn-sm' onClick={handlePhotoDelete} disabled={photoSaving}>
                Hapus foto
              </button>
            )}
          </div>
        </div>
      </div>

      <div className='col-md-8'>
        <form className='bg-white p-4 rounded shadow-sm mb-4' onSubmit={handleProfile}>
          <h2 className='h5 mb-3'>Data Profil</h2>
          <Notice notice={profileNotice} />
          <div className='mb-3'>
            <label className='form-label' htmlFor='profile-name'>Nama</label>
            <input id='profile-name' className='form-control' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className='mb-3'>
            <label className='form-label' htmlFor='profile-email'>Email</label>
            <input id='profile-email' type='email' className='form-control' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <button className='btn btn-success' type='submit'>Simpan profil</button>
        </form>

        <form className='bg-white p-4 rounded shadow-sm' onSubmit={handlePassword}>
          <h2 className='h5 mb-3'>Ubah Password</h2>
          <Notice notice={passwordNotice} />
          <div className='mb-3'>
            <label className='form-label' htmlFor='current-password'>Password saat ini</label>
            <input id='current-password' type='password' autoComplete='current-password' className='form-control' value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} required />
          </div>
          <div className='mb-3'>
            <label className='form-label' htmlFor='new-password'>Password baru (minimal 8 karakter)</label>
            <input id='new-password' type='password' autoComplete='new-password' minLength={8} className='form-control' value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} required />
          </div>
          <div className='mb-3'>
            <label className='form-label' htmlFor='confirm-password'>Ulangi password baru</label>
            <input id='confirm-password' type='password' autoComplete='new-password' minLength={8} className='form-control' value={passwords.password_confirmation} onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })} required />
          </div>
          <button className='btn btn-success' type='submit'>Ubah password</button>
        </form>
      </div>
    </div>
  );
}
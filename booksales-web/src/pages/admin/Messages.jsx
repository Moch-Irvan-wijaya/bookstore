import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api/axios';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/messages');
        setMessages(res.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, []);

  return (
    <>
      <h1 className='h4 mb-3'>Pesan Masuk</h1>
      {error && <div className='alert alert-danger'>{error}</div>}
      {messages.length === 0 && <p className='text-muted'>Belum ada pesan.</p>}
      {messages.map((m) => (
        <div className='card mb-3' key={m.id}>
          <div className='card-body'>
            <h5 className='card-title h6'>{m.subject}</h5>
            <p className='card-text'>{m.message}</p>
            <small className='text-muted'>
              Dari {m.user?.name} ({m.user?.email}) pada {new Date(m.created_at).toLocaleString('id-ID')}
            </small>
          </div>
        </div>
      ))}
    </>
  );
}
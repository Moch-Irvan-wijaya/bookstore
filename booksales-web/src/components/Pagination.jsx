export default function Pagination({ meta, onChange }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <nav className='d-flex justify-content-center align-items-center gap-3 my-3'>
      <button
        className='btn btn-outline-secondary btn-sm'
        disabled={meta.current_page <= 1}
        onClick={() => onChange(meta.current_page - 1)}
      >
        Sebelumnya
      </button>
      <span className='small'>Halaman {meta.current_page} dari {meta.last_page}</span>
      <button
        className='btn btn-outline-secondary btn-sm'
        disabled={meta.current_page >= meta.last_page}
        onClick={() => onChange(meta.current_page + 1)}
      >
        Berikutnya
      </button>
    </nav>
  );
}

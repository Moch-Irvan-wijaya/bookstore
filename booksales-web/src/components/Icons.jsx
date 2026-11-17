export function CartIcon({ size = 20 }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} fill='currentColor' viewBox='0 0 16 16' aria-hidden='true'>
      <path d='M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l.84 4.479 9.144-.459L13.89 4zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2' />
    </svg>
  );
}

export function UserIcon({ size = 20 }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} fill='currentColor' viewBox='0 0 16 16' aria-hidden='true'>
      <path d='M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0' />
      <path fillRule='evenodd' d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1' />
    </svg>
  );
}
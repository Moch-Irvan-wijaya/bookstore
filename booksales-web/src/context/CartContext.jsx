import { useState } from 'react';
import { CartContext } from './cart-context';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('cart')) || []);

  const save = (next) => {
    setItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  // quantity bisa diisi dari halaman detail buku, bawaannya 1
  const addToCart = (book, quantity = 1) => {
    const found = items.find((i) => i.book.id === book.id);
    if (found) {
      save(items.map((i) =>
        i.book.id === book.id
          ? { ...i, book, quantity: Math.min(i.quantity + quantity, book.stock) }
          : i
      ));
    } else {
      save([...items, { book, quantity: Math.min(quantity, book.stock) }]);
    }
  };

  const updateQty = (id, quantity) => {
    save(items.map((i) => (i.book.id === id ? { ...i, quantity } : i)));
  };

  const removeFromCart = (id) => save(items.filter((i) => i.book.id !== id));
  const clearCart = () => save([]);

  const total = items.reduce((sum, i) => sum + Number(i.book.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}
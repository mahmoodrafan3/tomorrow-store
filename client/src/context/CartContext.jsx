import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tomorrow_cart');
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('tomorrow_cart', JSON.stringify(items));
  };

  const addToCart = (product, qty = 1, size = '', color = '') => {
    const key = `${product._id}-${size}-${color}`;
    const existing = cartItems.find((i) => i.key === key);
    let updated;
    if (existing) {
      updated = cartItems.map((i) =>
        i.key === key ? { ...i, qty: i.qty + qty } : i
      );
    } else {
      updated = [...cartItems, { ...product, qty, size, color, key }];
    }
    saveCart(updated);
    setIsOpen(true);
  };

  const removeFromCart = (key) => {
    saveCart(cartItems.filter((i) => i.key !== key));
  };

  const updateQty = (key, qty) => {
    if (qty < 1) return removeFromCart(key);
    saveCart(cartItems.map((i) => (i.key === key ? { ...i, qty } : i)));
  };

  const clearCart = () => saveCart([]);

  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0);
  const cartTotal = cartItems.reduce((a, i) => a + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems, cartCount, cartTotal,
        addToCart, removeFromCart, updateQty, clearCart,
        isOpen, setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

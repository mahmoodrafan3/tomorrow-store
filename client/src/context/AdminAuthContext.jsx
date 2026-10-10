import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();

// Admins live in their own storage bucket so an admin session and a
// storefront customer session never share or leak into each other.
const STORAGE_KEY = 'tomorrow_admin';

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const adminLogin = async (email, password) => {
    const { data } = await axios.post('/api/auth/admin/login', { email, password });
    setAdmin(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, adminLogin, adminLogout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

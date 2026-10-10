import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Read the stored session synchronously so consumers see the user on their very
// first render. Restoring it inside an effect made pages that guard on `user`
// (e.g. Profile) redirect to /login on a hard refresh.
const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('tomorrow_user') || 'null');
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('tomorrow_user', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('/api/auth/register', { name, email, password });
    setUser(data);
    localStorage.setItem('tomorrow_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tomorrow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

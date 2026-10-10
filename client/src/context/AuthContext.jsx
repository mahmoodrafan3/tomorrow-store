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

  // One place where a user object is written, so React state and localStorage
  // can never drift apart. The token from a login response must survive an
  // update that only returns profile fields, so keep the existing one.
  const persistUser = (next) => {
    const merged = { ...next, token: next.token || user?.token };
    setUser(merged);
    localStorage.setItem('tomorrow_user', JSON.stringify(merged));
    return merged;
  };

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    persistUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('/api/auth/register', { name, email, password });
    persistUser(data);
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tomorrow_user');
  };

  const saveProfile = async (fields) => {
    const { data } = await axios.put('/api/auth/profile', fields);
    return persistUser(data);
  };

  const addAddress = async (address) => {
    const { data } = await axios.post('/api/auth/addresses', address);
    return persistUser(data);
  };

  const removeAddress = async (addressId) => {
    const { data } = await axios.delete(`/api/auth/addresses/${addressId}`);
    return persistUser(data);
  };

  const savePreferences = async (prefs) => {
    const { data } = await axios.put('/api/auth/preferences', prefs);
    return persistUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        saveProfile,
        addAddress,
        removeAddress,
        savePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

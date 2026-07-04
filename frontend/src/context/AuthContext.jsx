import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a valid session exists when the app initializes or reloads
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Handle User Registration
 const register = async (name, email, password) => {
  try {
    const response = await API.post('/auth/register', { name, email, password });
    const { access_token, user: userData } = response.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  } catch (error) {
    let errorMessage = 'An error occurred during registration.';
    
    // Catch FastAPI's 422 structure arrays safely
    if (error.response?.status === 422 && Array.isArray(error.response.data?.detail)) {
      errorMessage = error.response.data.detail
        .map(err => `${err.loc[1] || 'Field'}: ${err.msg}`)
        .join(', ');
    } else if (error.response?.data?.detail) {
      errorMessage = typeof error.response.data.detail === 'string'
        ? error.response.data.detail
        : JSON.stringify(error.response.data.detail);
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

  // Handle User Login
  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Invalid email or password.'
      };
    }
  };

  // Handle User Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Reusable hook to use authentication data anywhere instantly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be wrapped within an AuthProvider');
  }
  return context;
};
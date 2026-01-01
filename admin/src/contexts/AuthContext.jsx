import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
// Create axios instance with base URL
const api = axios.create({ baseURL: `${apiUrl}` });

// ✅ Interceptor checks BOTH storages
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check roles based on user data
  const checkRoles = (userData) => {
    setIsAdmin(userData?.role === 'admin' || userData?.isAdmin === true);
    setIsVolunteer(userData?.role === 'volunteer' || userData?.isVolunteer === true);
  };

  // ✅ Initialization Logic
  useEffect(() => {
    const initAuth = async () => {
      // Check both storages for an existing token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        try {
          const res = await api.get('/auth/me'); 
          const userData = res.data;
          
          setUser(userData);
          setSession({ access_token: token });
          checkRoles(userData);
        } catch (error) {
          console.error('Error restoring session:', error);
          // Clear both on error
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setUser(null);
          setSession(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // ✅ UPDATE: signUp now accepts 'phone'
  const signUp = async (name, email, password, phone) => {
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        phone, // ✅ Send phone to backend
      });

      const { token, user: userData } = res.data;

      // Default to LocalStorage for Sign Up (or you can use session based on logic)
      // Usually sign up implies "I want to be logged in"
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token'); 

      setUser(userData);
      setSession({ access_token: token });
      checkRoles(userData);

      return { error: null };
    } catch (error) {
      return {
        error: error.response?.data?.message || error.message || "Signup failed",
      };
    }
  };

  // ✅ SignIn accepts 'rememberMe'
  const signIn = async (email, password, rememberMe) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      const { token, user: userData } = res.data;
      
      // Handle Storage based on "Remember Me"
      if (rememberMe) {
        localStorage.setItem('token', token);
        sessionStorage.removeItem('token'); // Clean up session if moving to local
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token'); // Clean up local if moving to session
      }
      
      setUser(userData);
      setSession({ access_token: token });
      checkRoles(userData);
      
      return { error: null };
    } catch (error) {
      return { 
        error: error.response?.data?.message || error.message || "Login failed" 
      };
    }
  };

  // ✅ SignOut calls API before clearing storage
  const signOut = async () => {
    try {
      // 1. Notify Backend to set isLoggedIn: false
      if (user?._id) {
        await api.post('/auth/logout', { userId: user._id }); 
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 2. Clear Local State & Storage regardless of API success
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsVolunteer(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isVolunteer, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
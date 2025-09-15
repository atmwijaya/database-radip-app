// utils/auth.js
export const checkTokenExpiration = () => {
  const expirationTime = localStorage.getItem('tokenExpiration');
  if (!expirationTime) return false;
  
  const now = new Date().getTime();
  return now < parseInt(expirationTime);
};

export const verifyThisToken = async (token) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const expiration = localStorage.getItem('tokenExpiration');
  
  if (!token || !expiration) return false;
  
  // Cek apakah token sudah expired
  return new Date().getTime() < parseInt(expiration);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
  localStorage.removeItem('tokenExpiration');
  window.location.href = '/enter';
};

export const validateJWTConfig = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
};
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const isValid = await verifyToken(token);
        if (!isValid) {
          localStorage.removeItem('token');
          localStorage.removeItem('admin');
          navigate('/login');
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, token]);

  return token ? children : null;
};

export default ProtectedRoute;
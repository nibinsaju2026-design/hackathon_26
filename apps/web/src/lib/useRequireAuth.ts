import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from './api';

export default function useRequireAuth() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const userId = user?.id;
  useEffect(() => {
    if (!localStorage.getItem('token') || !userId) navigate('/login', { replace: true });
  }, [navigate, userId]);
  return user;
}

import { useCallback, useEffect, useState } from 'react';
import { userApi, User } from '../api/user-api';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getMe();
      setUser(data);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Error al cargar el usuario');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCareer = async (careerId: string) => {
    try {
      const result = await userApi.setupCareer(careerId);
      await fetchUser();
      return result;
    } catch (err) {
      console.error('Error updating career:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    refresh: fetchUser,
    updateCareer,
  };
};

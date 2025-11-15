import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { useToast } from '@/contexts/ToastContext';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const { success, error } = useToast();

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      success(response.message);
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      setAuth(response.user, response.token);

      // Store refresh token
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      success('Login successful!');
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      // Call backend logout endpoint
      await authApi.logout();
    } catch (err) {
      // Ignore errors - still logout client-side
      console.error('Logout API call failed:', err);
    } finally {
      // Always clear local state
      logout();
      localStorage.removeItem('refreshToken');
    }
  };

  return {
    register,
    login,
    logout: logoutUser,
    isLoading
  };
}

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { tokenStorage } from '../services/api';

export const useAuth = () => {
  const { 
    user, 
    token, 
    selectedRole,
    isAuthenticated, 
    isLoading,
    setUser,
    setToken,
    setSelectedRole,
    logout,
    setLoading 
  } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await tokenStorage.getToken();
        if (storedToken) {
          setToken(storedToken);
          // In a real app, you'd validate the token with the backend
          // For now, we'll assume it's valid
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const mockApi = await import('../services/api').then(m => m.mockApi);
    const response = await mockApi.login(email, password);
    
    setUser(response.user);
    setToken(response.token);
    await tokenStorage.setToken(response.token);

    // Set default role if user has only one role
    if (response.user.roles.length === 1) {
      setSelectedRole(response.user.roles[0].nombre);
    }

    return response;
  };

  const signOut = async () => {
    await tokenStorage.removeToken();
    logout();
  };

  const hasRole = (role: string) => {
    return user?.roles.some((r: { nombre: string; }) => r.nombre === role) || false;
  };

  const hasMultipleRoles = () => {
    return (user?.roles.length || 0) > 1;
  };

  return {
    user,
    token,
    selectedRole,
    isAuthenticated,
    isLoading,
    login,
    logout: signOut,
    setSelectedRole,
    hasRole,
    hasMultipleRoles,
  };
};
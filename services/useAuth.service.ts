import { Role, User } from '@/model/model';
import { apiMock } from '@/services/apiMock.service';
import { authManager } from '@/services/authManager.service';
import { tokenStorage } from '@/services/token.service';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const logout = () => {
    setUser(null)
    setToken(null)
    setSelectedRole(null)
    setIsAuthenticated(false)
    router.replace('/(auth)/login');
  }

  // Registrar callback de logout
  useEffect(() => {
    authManager.setLogoutCallback(logout);
    return () => {
      authManager.clearLogoutCallback();
    };
  }, [logout]);

  // Inicializar autenticación al montar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await tokenStorage.getToken();
        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiMock.login(email, password);
      
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      await tokenStorage.setToken(response.token);

      // Setear rol por defecto si solo tiene uno
      if (response.user.roles.length === 1) {
        setSelectedRole(response.user.roles[0]);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await tokenStorage.removeToken();
    logout();
  };

  const hasRole = (roleName: string) => {
    return user?.roles.some(r => r === roleName) || false;
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
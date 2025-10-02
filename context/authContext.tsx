import { AuthResponse, Role, User } from '@/model/model';
import { apiMock } from '@/services/apiMock.service';
import { authManager } from '@/services/authManager.service';
import { tokenStorage } from '@/services/token.service';
import { router } from 'expo-router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  token: string | null;
  selectedRole: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSelectedRole: (role: Role | null) => void;
  hasRole: (roleName: string) => boolean;
  hasMultipleRoles: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logoutCallback = useCallback(() => {
    setUser(null);
    setToken(null);
    setSelectedRole(null);
    setIsAuthenticated(false);
    router.replace('/(auth)/login');
  }, []);

  // Registrar callback de logout
  useEffect(() => {
    authManager.setLogoutCallback(logoutCallback);
    return () => {
      authManager.clearLogoutCallback();
    };
  }, [logoutCallback]);

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
        const onlyRole = response.user.roles[0];
        setSelectedRole(onlyRole);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await tokenStorage.removeToken();
    logoutCallback();
  };

  const hasRole = (roleName: string) => {
    return user?.roles.some((r) => r === roleName) || false;
  };

  const hasMultipleRoles = () => {
    return (user?.roles.length || 0) > 1;
  };

  const value: AuthContextType = {
    user,
    setUser,
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

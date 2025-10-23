import { Rol, Usuario } from "@/model/model";
import { authService } from "@/services/api.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export const STORAGE_KEY_TOKEN = "token"

type AuthContextType = {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  selectedRole: Rol | null;
  setSelectedRole: (role: Rol | null) => void;
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (roleName: string) => boolean;
  hasMultipleRoles: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [selectedRole, setSelectedRole] = useState<Rol | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Inicializar autenticación al montar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
        if (token) {
          const currentUser = await authService.getCurrentUser();
          setUsuario(currentUser);
          setIsAuthenticated(true);
        } else {
          setUsuario(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Error al inicializar auth:", e);
        setUsuario(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);
  
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // 1. Obtener token del servidor
      const receivedToken = await authService.login(username, password)
      
      // 2. Guardar token en storage
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, receivedToken)
      
      // 3. Configurar headers del API con el token
      await authService.setAuthToken()
      
      // 4. Obtener datos del usuario actual
      const currentUser = await authService.getCurrentUser()
      
      // 5. Actualizar estado del contexto
      setUsuario(currentUser)
      setIsAuthenticated(true)
    } catch (e) {
      console.error("Error en login:", e)
      // Limpiar en caso de error
      setUsuario(null)
      setIsAuthenticated(false)
      throw e
    } finally {
      setIsLoading(false);
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true);
      
      await AsyncStorage.removeItem(STORAGE_KEY_TOKEN)
      
      setUsuario(null)
      setIsAuthenticated(false)
      setSelectedRole(null)
      
    } catch (e) {
      console.error("Error en logout:", e)
      throw e
    } finally {
      setIsLoading(false);
    }
  }

  const hasRole = (roleName: string) => {
    return usuario?.listaRol.some((r) => r === roleName) || false;
  };

  const hasMultipleRoles = () => {
    return (usuario?.listaRol.length || 0) > 1;
  };

  const value = {
    usuario,
    setUsuario,
    selectedRole,
    setSelectedRole,
    login,
    logout,
    isAuthenticated,
    isLoading,
    hasRole,
    hasMultipleRoles,
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
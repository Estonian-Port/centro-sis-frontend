import { Rol, Usuario } from "@/model/model";
import { authService } from "@/services/api.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export const STORAGE_KEY_TOKEN = "token";
export const STORAGE_KEY_SELECTED_ROLE = "selectedRole";

type AuthContextType = {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  selectedRole: Rol | null;
  setSelectedRole: (role: Rol | null) => void;
  login: (username: string, password: string) => Promise<Usuario>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (roleName: string) => boolean;
  hasMultipleRoles: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [selectedRole, setSelectedRoleState] = useState<Rol | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Wrapper para persistir el rol seleccionado
  const setSelectedRole = async (role: Rol | null) => {
    setSelectedRoleState(role);
    if (role) {
      await AsyncStorage.setItem(STORAGE_KEY_SELECTED_ROLE, role);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY_SELECTED_ROLE);
    }
  };
  
  // ✅ Inicializar autenticación al montar (CON MANEJO DE 403)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
        
        // ✅ Solo intentar obtener usuario si hay token
        if (token) {
          // ✅ Configurar token antes de hacer la petición
          await authService.setAuthToken();
          
          try {
            const currentUser = await authService.getCurrentUser();
            setUsuario(currentUser);
            setIsAuthenticated(true);

            // Restaurar rol seleccionado si existe
            const savedRole = await AsyncStorage.getItem(STORAGE_KEY_SELECTED_ROLE);
            if (savedRole && currentUser.listaRol.includes(savedRole as Rol)) {
              setSelectedRoleState(savedRole as Rol);
            }
          } catch (userError: any) {
            // ✅ Si el token es inválido (403/401), limpiar todo silenciosamente
            if (userError?.response?.status === 403 || userError?.response?.status === 401) {
              console.log("Token expirado, limpiando sesión...");
              await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
              await AsyncStorage.removeItem(STORAGE_KEY_SELECTED_ROLE);
              setUsuario(null);
              setIsAuthenticated(false);
              setSelectedRoleState(null);
            } else {
              // Otro error, re-lanzar
              throw userError;
            }
          }
        } else {
          // ✅ No hay token, estado inicial limpio
          setUsuario(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Error crítico al inicializar auth:", e);
        // ✅ En caso de error crítico, limpiar todo
        await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEY_SELECTED_ROLE);
        setUsuario(null);
        setIsAuthenticated(false);
        setSelectedRoleState(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);
  
  const login = async (username: string, password: string): Promise<Usuario> => {
    try {
      setIsLoading(true);
      
      // 1. Obtener token del servidor
      const receivedToken = await authService.login(username, password);
      
      // 2. Guardar token en storage
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, receivedToken);
      
      // 3. Configurar headers del API con el token
      await authService.setAuthToken();
      
      // 4. Obtener datos del usuario actual
      const currentUser = await authService.getCurrentUser();
      
      // 5. Actualizar estado del contexto
      setUsuario(currentUser);
      setIsAuthenticated(true);
      
      // 6. Limpiar rol anterior (nuevo login)
      await AsyncStorage.removeItem(STORAGE_KEY_SELECTED_ROLE);
      setSelectedRoleState(null);
      
      return currentUser;
      
    } catch (e) {
      console.error("Error en login:", e);
      // Limpiar en caso de error
      setUsuario(null);
      setIsAuthenticated(false);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEY_SELECTED_ROLE);
      
      setUsuario(null);
      setIsAuthenticated(false);
      setSelectedRoleState(null);
      
    } catch (e) {
      console.error("Error en logout:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

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
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
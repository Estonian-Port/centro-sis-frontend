import { Rol, Usuario } from "@/model/model";
import { authService } from "@/services/api.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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

  const setSelectedRole = async (role: Rol | null) => {
    setSelectedRoleState(role);
    if (role) {
      await AsyncStorage.setItem(STORAGE_KEY_SELECTED_ROLE, role);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY_SELECTED_ROLE);
    }
  };

  // ✅ Inicializar autenticación (SILENCIOSO)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);

        if (token) {
          await authService.setAuthToken();

          try {
            const currentUser = await authService.getCurrentUser();
            setUsuario(currentUser);
            setIsAuthenticated(true);

            const savedRole = await AsyncStorage.getItem(
              STORAGE_KEY_SELECTED_ROLE,
            );
            if (savedRole && currentUser.listaRol.includes(savedRole as Rol)) {
              setSelectedRoleState(savedRole as Rol);
            }
          } catch (userError: any) {
            // ✅ Si es 403/401, limpiar SILENCIOSAMENTE (token expirado es normal)
            if (
              userError?.response?.status === 403 ||
              userError?.response?.status === 401
            ) {
              await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
              await AsyncStorage.removeItem(STORAGE_KEY_SELECTED_ROLE);
              setUsuario(null);
              setIsAuthenticated(false);
              setSelectedRoleState(null);
              // ✅ NO loggear - es un caso esperado
            } else {
              // ✅ SOLO loggear si es OTRO error inesperado
              console.error("Error inesperado al obtener usuario:", userError);
              throw userError;
            }
          }
        } else {
          setUsuario(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
        // ✅ Solo llega acá si hubo un error CRÍTICO (no 403/401)
        console.error("Error crítico al inicializar auth:", e);
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

  const login = async (
    username: string,
    password: string,
  ): Promise<Usuario> => {
    try {
      setIsLoading(true);

      const receivedToken = await authService.login(username, password);
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, receivedToken);
      await authService.setAuthToken();

      const currentUser = await authService.getCurrentUser();

      setUsuario(currentUser);
      setIsAuthenticated(true);

      await AsyncStorage.removeItem(STORAGE_KEY_SELECTED_ROLE);
      setSelectedRoleState(null);

      return currentUser;
    } catch (e) {
      console.error("Error en login:", e);
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

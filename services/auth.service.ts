import React, { useState } from "react";
import { Role } from "../types";

// Simula que el framework ya está listo
export const useFrameworkReady = () => {
  return true;
};

export const rolesMock: Role = {
   id: 1,
   nombre: 'ALUMNO'
};

// Mock de Auth
export const useAuth = () => {
  const user = {
    firstLogin: false,
    roles: [rolesMock],
  };

  const user2 = {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@test.com',
    dni: '12345678',
    telefono: '1234567890',
    estado: 'ALTA',
    roles: [
      { id: 1, nombre: 'ALUMNO' },
      { id: 2, nombre: 'PROFESOR' },
    ],
    firstLogin: false,
    beneficios: ['Pago total', 'Familiar'],
  };
  const selectedRole = 'ALUMNO'
  const setSelectedRole = (role: Role) => console.log('Role set to', role)
  const logout = () => console.log('Logout ejecutado')

  const hasMultipleRoles = () => user.roles.length > 1

  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Simula delay de carga
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true); // cambiar a false para probar flujo no auth
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return { user2, isLoading, isAuthenticated, user, hasMultipleRoles, selectedRole, setSelectedRole, logout };
};

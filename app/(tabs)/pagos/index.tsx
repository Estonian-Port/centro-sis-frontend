// app/(tabs)/pagos/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "@/context/authContext";

export default function PagosIndex() {
  const { selectedRole } = useAuth();
  
  // Alumno va directo a Realizados
  // Otros van a Recibidos
  const defaultTab = selectedRole === "ALUMNO" ? "realizados" : "recibidos";
  
  return <Redirect href={`/pagos/${defaultTab}`} />;
}
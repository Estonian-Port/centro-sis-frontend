import { createContext, useContext } from "react";
import { Curso } from "@/model/model";

type CursoContextType = {
  curso: Curso | null;
  fetchCurso: (showLoading?: boolean) => Promise<void>;
};

export const CursoContext = createContext<CursoContextType | undefined>(
  undefined
);

export const useCurso = () => {
  const context = useContext(CursoContext);
  if (!context) {
    throw new Error("useCurso debe ser usado dentro de CursoContext.Provider");
  }
  return context;
};

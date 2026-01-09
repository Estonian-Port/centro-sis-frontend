// app/curso/[cursoId]/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Slot } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { COLORES } from "@/util/colores";
import { SafeAreaView } from "react-native-safe-area-context";
import { cursoService } from "@/services/curso.service";
import { Curso, EstadoCurso } from "@/model/model";
import Toast from "react-native-toast-message";
import { Tag } from "@/components/ui/Tag";

export default function CursoLayout() {
  const { cursoId } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"alumnos" | "informacion" | "asistencias">("alumnos");
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper para obtener variant del tag según estado del curso
  const getEstadoCursoVariant = (estado: EstadoCurso) => {
    switch (estado) {
      case EstadoCurso.EN_CURSO:
        return "success";
      case EstadoCurso.POR_COMENZAR:
        return "info";
      case EstadoCurso.FINALIZADO:
        return "default";
      case EstadoCurso.PENDIENTE:
        return "warning";
      default:
        return "default";
    }
  };

  // Helper para formatear el estado
  const formatEstadoCurso = (estado: EstadoCurso) => {
    const map: Record<EstadoCurso, string> = {
      [EstadoCurso.EN_CURSO]: "EN CURSO",
      [EstadoCurso.POR_COMENZAR]: "POR COMENZAR",
      [EstadoCurso.FINALIZADO]: "FINALIZADO",
      [EstadoCurso.PENDIENTE]: "PENDIENTE",
    };
    return map[estado] || estado;
  };

  useEffect(() => {
    fetchCurso();
  }, [cursoId]);

  const fetchCurso = async () => {
    if (!cursoId) return;
    
    setLoading(true);
    try {
      const response = await cursoService.getById(Number(cursoId));
      setCurso(response);
    } catch (error) {
      console.error("Error fetching curso:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cargar el curso",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: "alumnos" | "informacion" | "asistencias") => {
    setActiveTab(tab);
    router.push(`/curso/${cursoId}/${tab}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORES.violeta} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con título */}
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{curso?.nombre || "Curso"}</Text>
          {curso && (
            <Tag
              label={formatEstadoCurso(curso.estado)}
              variant={getEstadoCursoVariant(curso.estado)}
            />
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "alumnos" && styles.activeTab]}
          onPress={() => handleTabChange("alumnos")}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={activeTab === "alumnos" ? "#ffffff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "alumnos" && styles.activeTabText,
            ]}
          >
            Alumnos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "informacion" && styles.activeTab]}
          onPress={() => handleTabChange("informacion")}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={activeTab === "informacion" ? "#ffffff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "informacion" && styles.activeTabText,
            ]}
          >
            Información
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "asistencias" && styles.activeTab]}
          onPress={() => handleTabChange("asistencias")}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={activeTab === "asistencias" ? "#ffffff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "asistencias" && styles.activeTabText,
            ]}
          >
            Asistencias
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTop: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  activeTab: {
    backgroundColor: COLORES.violeta,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#ffffff",
  },
});
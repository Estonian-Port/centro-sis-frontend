// app/(tabs)/ingresos.tsx - VERSIÓN 4 (con tabs)
// Esta versión renderiza el layout completo, incluyendo las tabs

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORES } from "@/util/colores";
import { useAuth } from "@/context/authContext";
import MisIngresosScreen from "./ingresos/mis-ingresos";
import TodosIngresosScreen from "./ingresos/todos-ingresos";

export default function IngresosDrawerScreen() {
  const router = useRouter();
  const { selectedRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"mis-ingresos" | "todos-ingresos">("mis-ingresos");

  const isAdmin = selectedRole === "ADMINISTRADOR";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ingresos</Text>
      </View>

      {/* Tabs (solo admin) */}
      {isAdmin && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "mis-ingresos" && styles.activeTab]}
            onPress={() => setActiveTab("mis-ingresos")}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={activeTab === "mis-ingresos" ? "#ffffff" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "mis-ingresos" && styles.activeTabText,
              ]}
            >
              Mis Ingresos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "todos-ingresos" && styles.activeTab]}
            onPress={() => setActiveTab("todos-ingresos")}
          >
            <Ionicons
              name="people-outline"
              size={18}
              color={activeTab === "todos-ingresos" ? "#ffffff" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "todos-ingresos" && styles.activeTabText,
              ]}
            >
              Todos los Ingresos
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content - Renderiza el componente según tab activa */}
      {activeTab === "mis-ingresos" ? (
        <MisIngresosScreen />
      ) : (
        <TodosIngresosScreen />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
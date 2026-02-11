import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Usuario } from "@/model/model";
import { cursoService } from "@/services/curso.service";
import { getErrorMessage } from "@/helper/auth.interceptor";

interface EditarProfesoresModalProps {
  visible: boolean;
  onClose: () => void;
  profesoresActuales: Usuario[];
  onGuardar: (profesorIds: number[]) => Promise<void>;
  onBuscarProfesores: (query: string) => Promise<Usuario[]>;
}

export const EditarProfesoresModal: React.FC<EditarProfesoresModalProps> = ({
  visible,
  onClose,
  profesoresActuales,
  onGuardar,
  onBuscarProfesores,
}) => {
  const [profesores, setProfesores] = useState<Usuario[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setProfesores([...profesoresActuales]);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [visible, profesoresActuales]);

  // Búsqueda con debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await onBuscarProfesores(searchQuery);
        // Filtrar los que ya están en la lista
        const filtered = results.filter(
          (r) => !profesores.some((p) => p.id === r.id)
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error("Error buscando profesores:", error);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAgregarProfesor = (profesor: Usuario) => {
    setProfesores([...profesores, profesor]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleEliminarProfesor = (profesorId: number) => {
    if (profesores.length === 1) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debe haber al menos un profesor en el curso",
        position: "bottom",
      });
      return;
    }
    setProfesores(profesores.filter((p) => p.id !== profesorId));
  };

  const handleGuardar = async () => {
    if (profesores.length === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debe haber al menos un profesor",
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    try {
      await onGuardar(profesores.map((p) => p.id));
      Toast.show({
        type: "success",
        text1: "Profesores actualizados",
        text2: "La lista de profesores se actualizó correctamente",
        position: "bottom",
      });
      onClose();
    } catch (error) {
      console.error("Error actualizando profesores:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudieron actualizar los profesores",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProfesores([...profesoresActuales]);
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="school" size={24} color="#10b981" />
            </View>
            <Text style={styles.title}>Editar Profesores</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Lista de Profesores Actuales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Profesores ({profesores.length})
              </Text>
              {profesores.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="person-outline" size={32} color="#d1d5db" />
                  <Text style={styles.emptyText}>
                    Debe haber al menos un profesor
                  </Text>
                </View>
              ) : (
                profesores.map((profesor) => (
                  <View key={profesor.id} style={styles.profesorItem}>
                    <View style={styles.profesorAvatar}>
                      <Text style={styles.avatarText}>
                        {profesor.nombre[0]}
                        {profesor.apellido[0]}
                      </Text>
                    </View>
                    <View style={styles.profesorInfo}>
                      <Text style={styles.profesorName}>
                        {profesor.nombre} {profesor.apellido}
                      </Text>
                      <Text style={styles.profesorEmail}>{profesor.email}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleEliminarProfesor(profesor.id)}
                      style={styles.deleteButton}
                      disabled={profesores.length === 1}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={profesores.length === 1 ? "#d1d5db" : "#ef4444"}
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* Búsqueda para Agregar */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Agregar Profesor</Text>
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#9ca3af"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar por nombre, apellido, email o dni..."
                  placeholderTextColor="#9ca3af"
                />
                {searching && (
                  <ActivityIndicator size="small" color="#3b82f6" />
                )}
              </View>

              {/* Resultados de Búsqueda */}
              {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                  {searchResults.map((profesor) => (
                    <TouchableOpacity
                      key={profesor.id}
                      style={styles.searchResultItem}
                      onPress={() => handleAgregarProfesor(profesor)}
                    >
                      <View style={styles.resultAvatar}>
                        <Text style={styles.resultAvatarText}>
                          {profesor.nombre[0]}
                          {profesor.apellido[0]}
                        </Text>
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>
                          {profesor.nombre} {profesor.apellido}
                        </Text>
                        <Text style={styles.resultEmail}>{profesor.email}</Text>
                      </View>
                      <Ionicons
                        name="add-circle"
                        size={24}
                        color="#10b981"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {searchQuery.trim() && !searching && searchResults.length === 0 && (
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={32} color="#d1d5db" />
                  <Text style={styles.noResultsText}>
                    No se encontraron profesores
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleGuardar}
              disabled={loading || profesores.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  profesorItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  profesorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  profesorInfo: {
    flex: 1,
  },
  profesorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  profesorEmail: {
    fontSize: 12,
    color: "#6b7280",
  },
  deleteButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  searchResults: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  resultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  resultAvatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  resultEmail: {
    fontSize: 12,
    color: "#6b7280",
  },
  noResults: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginTop: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  emptyText: {
    fontSize: 14,
    color: "#92400e",
    marginTop: 8,
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  confirmButton: {
    backgroundColor: "#10b981",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
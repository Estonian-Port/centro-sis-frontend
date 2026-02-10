// components/accesos/RegistrarAccesoModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView,
    Platform,
} from "react-native";
import { Button } from "../ui/Button";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/authContext";
import { accesoService } from "@/services/acceso.service";
import { usuarioService } from "@/services/usuario.service";
import { getErrorMessage } from "@/helper/auth.interceptor";

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
}

interface RegistrarAccesoModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegistrarAccesoModal: React.FC<RegistrarAccesoModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { usuario } = useAuth();

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<number | null>(
    null
  );

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (searchTimeout) clearTimeout(searchTimeout);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await usuarioService.search(query);
        setSearchResults(results.slice(0, 10));
      } catch (error) {
        console.error("Error buscando usuarios:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: getErrorMessage(error) || "No se pudieron buscar usuarios",
          position: "bottom",
        });
      } finally {
        setSearching(false);
      }
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleSelectUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!selectedUsuario || !usuario) return;

    setSubmitting(true);
    try {
      await accesoService.registrarAccesoManual(usuario.id, selectedUsuario.id);
      Toast.show({
        type: "success",
        text1: "Acceso registrado",
        text2: `Acceso de ${selectedUsuario.nombre} ${selectedUsuario.apellido} registrado correctamente`,
        position: "bottom",
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error registrando acceso:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo registrar el acceso",
        position: "bottom",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsuario(null);
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
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Acceso Manual</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Búsqueda */}
            {!selectedUsuario && (
              <>
                <Text style={styles.label}>Buscar Usuario</Text>
                <View style={styles.searchContainer}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="#6b7280"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre, apellido o DNI..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoCapitalize="words"
                  />
                  {searching && (
                    <ActivityIndicator
                      size="small"
                      color="#3b82f6"
                      style={styles.searchLoader}
                    />
                  )}
                </View>

                {/* Resultados */}
                {searchResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    {searchResults.map((usuario) => (
                      <TouchableOpacity
                        key={usuario.id}
                        style={styles.resultItem}
                        onPress={() => handleSelectUsuario(usuario)}
                      >
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultName}>
                            {usuario.nombre} {usuario.apellido}
                          </Text>
                          <Text style={styles.resultDni}>DNI: {usuario.dni}</Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {searchQuery.length >= 2 &&
                  !searching &&
                  searchResults.length === 0 && (
                    <View style={styles.emptyState}>
                      <Ionicons
                        name="search-outline"
                        size={48}
                        color="#d1d5db"
                      />
                      <Text style={styles.emptyText}>
                        No se encontraron usuarios
                      </Text>
                    </View>
                  )}
              </>
            )}

            {/* Usuario Seleccionado */}
            {selectedUsuario && (
              <View style={styles.selectedContainer}>
                <View style={styles.selectedHeader}>
                  <Text style={styles.selectedTitle}>Usuario Seleccionado</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedUsuario(null)}
                    style={styles.changeButton}
                  >
                    <Text style={styles.changeButtonText}>Cambiar</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.selectedCard}>
                  <View style={styles.selectedAvatar}>
                    <Text style={styles.avatarText}>
                      {selectedUsuario.nombre[0]}
                      {selectedUsuario.apellido[0]}
                    </Text>
                  </View>
                  <View style={styles.selectedInfo}>
                    <Text style={styles.selectedName}>
                      {selectedUsuario.nombre} {selectedUsuario.apellido}
                    </Text>
                    <Text style={styles.selectedDetail}>
                      DNI: {selectedUsuario.dni}
                    </Text>
                    <Text style={styles.selectedDetail}>
                      {selectedUsuario.email}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleClose}
              style={styles.button}
            />
            <Button
              title="Registrar Acceso"
              variant="primary"
              onPress={handleSubmit}
              disabled={!selectedUsuario || submitting}
              loading={submitting}
              style={styles.button}
            />
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
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
    ...Platform.select({
      web: {
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1f2937",
  },
  searchLoader: {
    marginLeft: 8,
  },
  resultsContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#ffffff",
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
  resultDni: {
    fontSize: 13,
    color: "#6b7280",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  selectedContainer: {
    marginTop: 8,
  },
  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  changeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3b82f6",
  },
  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#10b981",
  },
  selectedAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  selectedDetail: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    flex: 1,
  },
});
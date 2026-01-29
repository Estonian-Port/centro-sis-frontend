import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Estado, Rol, Usuario } from "@/model/model";
import { estadoUsuarioToTagVariant, rolToTagVariant } from "@/helper/funciones";
import { COLORES } from "@/util/colores";
import { Ionicons } from "@expo/vector-icons";
import { Tag } from "../ui/Tag";
import { useState } from "react";
import { BajaTotalUsuario } from "../modals/BajaTotalUsuario";
import { usuarioService } from "@/services/usuario.service";
import { useAuth } from "@/context/authContext";

const UserItem = ({
  user,
  handleUserDetails,
  onRefresh,
}: {
  user: Usuario;
  handleUserDetails: (user: Usuario) => void;
  onRefresh: () => void;
}) => {
  const { usuario, selectedRole } = useAuth();
  const [modalBajaVisible, setModalBajaVisible] = useState(false);

  const canDelete =
    user.estado !== Estado.BAJA &&
    !(
      selectedRole === "OFICINA" &&
      (user.listaRol.includes(Rol.OFICINA) ||
        user.listaRol.includes(Rol.ADMINISTRADOR))
    );

  return (
    <TouchableOpacity
      key={user.id}
      style={
        user.estado === Estado.BAJA ? styles.tableRowBaja : styles.tableRow
      }
      onPress={() => handleUserDetails(user)}
      activeOpacity={0.7}
    >
      {Platform.OS === "web" ? (
        <View style={styles.contentWeb}>
          {/* Info del usuario (izquierda) */}
          <View style={styles.userMainInfo}>
            {user.estado !== Estado.PENDIENTE && (
              <Text style={styles.userName}>
                {user.nombre} {user.apellido}
              </Text>
            )}
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {/* Tags (centro-derecha) */}
          <View style={styles.tagsRowWeb}>
            <View style={styles.rolesContainer}>
              {user.listaRol.map((rol) => (
                <Tag
                  key={rol}
                  label={rol}
                  variant={rolToTagVariant(rol)}
                  size="small"
                />
              ))}
            </View>

            <Tag
              label={user.estado}
              variant={estadoUsuarioToTagVariant(user.estado)}
              size="small"
            />
          </View>

          {/* Icono de borrar (derecha) */}
          {canDelete && (
            <TouchableOpacity
              onPress={() => setModalBajaVisible(true)}
              style={styles.deleteButton}
            >
              <Ionicons
                name={"trash-outline"}
                size={20}
                color={COLORES.error}
              />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          {/* Fila superior: Nombre/Email + Icono borrar */}
          <View style={styles.topRow}>
            <View style={styles.userMainInfo}>
              {user.estado !== Estado.PENDIENTE && (
                <Text style={styles.userName}>
                  {user.nombre} {user.apellido}
                </Text>
              )}
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>

            {/* Icono de borrar */}
            {canDelete && (
              <TouchableOpacity
                onPress={() => setModalBajaVisible(true)}
                style={styles.deleteButton}
              >
                <Ionicons
                  name={"trash-outline"}
                  size={20}
                  color={COLORES.error}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Tags abajo */}
          <View style={styles.tagsRow}>
            {/* Roles */}
            <View style={styles.rolesContainer}>
              {user.listaRol.map((rol) => (
                <Tag
                  key={rol}
                  label={rol}
                  variant={rolToTagVariant(rol)}
                  size="small"
                />
              ))}
            </View>

            {/* Estado */}
            <Tag
              label={user.estado}
              variant={estadoUsuarioToTagVariant(user.estado)}
              size="small"
            />
          </View>
        </View>
      )}

      <BajaTotalUsuario
        visible={modalBajaVisible}
        onClose={() => setModalBajaVisible(false)}
        usuario={user}
        onConfirmar={async () => {
          try {
            await usuarioService.bajaTotal(user.id, usuario!.id);
            onRefresh();
          } catch (error) {
            console.error("Error dando de baja al usuario:", error);
          }
        }}
      />
    </TouchableOpacity>
  );
};

export default UserItem;

const styles = StyleSheet.create({
  tableRow: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s",
      },
    }),
  },
  tableRowBaja: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    opacity: 0.6,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s",
      },
    }),
  },
  content: {
    flex: 1,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  userMainInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#6b7280",
  },
  deleteButton: {
    padding: 4,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  contentWeb: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tagsRowWeb: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
    marginRight: 8,
  },
});

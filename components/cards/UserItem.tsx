import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Estado, Usuario } from "@/model/model";
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
  const { usuario } = useAuth();
  const [modalBajaVisible, setModalBajaVisible] = useState(false);

  return (
    <TouchableOpacity
      key={user.id}
      style={user.estado === Estado.BAJA ? styles.tableRowBaja : styles.tableRow}
      onPress={() => handleUserDetails(user)}
      activeOpacity={0.7}
    >
      <View style={styles.userMainInfo}>
        <Text style={styles.userName}>
          {user.nombre} {user.apellido}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.userMetaInfo}>
        <View style={styles.tagsContainer}>
          <View style={styles.rolesContainer}>
            {user.listaRol.map((rol) => (
              <Tag key={rol} label={rol} variant={rolToTagVariant(rol)} />
            ))}
          </View>

          <Tag
            label={user.estado}
            variant={estadoUsuarioToTagVariant(user.estado)}
          />
        </View>

        {user.estado !== Estado.BAJA && (
        <TouchableOpacity onPress={() => setModalBajaVisible(true)}>
          <Ionicons name={"trash-outline"} size={20} color={COLORES.error} />
        </TouchableOpacity>
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
      </View>
    </TouchableOpacity>
  );
};

export default UserItem;

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  userMetaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rolesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { EstadoUsuario, Usuario } from "@/model/model";
import { estadoUsuarioToTagVariant, rolToTagVariant } from "@/helper/funciones";
import { COLORES } from "@/util/colores";
import { Ionicons } from "@expo/vector-icons";
import { Tag } from "../ui/Tag";

const UserItem = ({
  user,
  handleUserDetails,
}: {
  user: Usuario;
  handleUserDetails: (user: Usuario) => void;
}) => {
  return (
    <TouchableOpacity
      key={user.id}
      style={styles.tableRow}
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

        <Ionicons
          name={
            user.estado === EstadoUsuario.ACTIVO
              ? "trash-outline"
              : "checkmark-circle-outline"
          }
          size={20}
          color={
            user.estado === EstadoUsuario.ACTIVO
              ? COLORES.error
              : COLORES.success
          }
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

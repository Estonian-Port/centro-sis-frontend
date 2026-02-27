import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Curso, Inscripcion } from "@/model/model";
import { Tag } from "../ui/Tag";
import { inscripcionService } from "@/services/inscripcion.service";
import { AlumnoDetailModal } from "./modals/AlumnoInscripcionModal";
import { AsignarPuntosModal } from "./modals/AsignarPuntosModal";
import { EditarBeneficioModal } from "./modals/EditarBeneficioModal";
import { RegistrarPagoModal } from "./modals/RegistrarPagoModal";
import { ConfirmarBajaModal } from "./modals/BajaAlumnoModal";
import { estadoPagoToTagVariant, formatEstadoPago } from "@/helper/funciones";
import { useAuth } from "@/context/authContext";
import { EventBus } from "@/util/EventBus";

interface AlumnoItemProps {
  inscripcion: Inscripcion;
  curso: Curso;
  onRefresh: () => Promise<void>;
}

export const AlumnoItem: React.FC<AlumnoItemProps> = ({
  inscripcion,
  curso,
  onRefresh,
}) => {
  // Estados de modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPuntosModal, setShowPuntosModal] = useState(false);
  const [showBeneficioModal, setShowBeneficioModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showBajaModal, setShowBajaModal] = useState(false);
  const { usuario } = useAuth();

  const alumno = inscripcion.alumno;

  if (!alumno || !usuario) return null;

  return (
    <>
      {/* Card Clickeable */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowDetailModal(true)}
        activeOpacity={0.7}
      >
        {/* Layout diferente según plataforma */}
        {Platform.OS === "web" ? (
          // WEB: Todo en una fila horizontal
          <View style={styles.contentWeb}>
            {/* Avatar + Info (izquierda) */}
            <View style={styles.alumnoInfo}>
              <View style={styles.alumnoAvatar}>
                <Text style={styles.avatarText}>
                  {alumno.nombre[0]}
                  {alumno.apellido[0]}
                </Text>
              </View>
              <View style={styles.alumnoDetails}>
                <Text style={styles.alumnoName}>
                  {alumno.nombre} {alumno.apellido}
                </Text>
                <View style={styles.alumnoMeta}>
                  <Ionicons name="mail-outline" size={14} color="#6b7280" />
                  <Text style={styles.alumnoMetaText}>{alumno.email}</Text>
                </View>
              </View>
            </View>

            {/* Puntos + Tag (derecha) */}
            <View style={styles.rightSectionWeb}>
              {/* Puntos */}
              <View style={styles.puntosContainer}>
                <Ionicons name="star" size={18} color="#f59e0b" />
                <Text style={styles.puntosText}>{inscripcion.puntos}</Text>
              </View>

              {/* Tag estado */}
              <Tag
                label={formatEstadoPago(inscripcion.estadoPago)}
                variant={estadoPagoToTagVariant(inscripcion.estadoPago)}
              />

              {/* Chevron */}
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </View>
        ) : (
          // MÓVIL: Layout vertical
          <>
            {/* Fila 1: Avatar + Info + Chevron */}
            <View style={styles.topRow}>
              <View style={styles.alumnoInfo}>
                <View style={styles.alumnoAvatar}>
                  <Text style={styles.avatarText}>
                    {alumno.nombre[0]}
                    {alumno.apellido[0]}
                  </Text>
                </View>
                <View style={styles.alumnoDetails}>
                  <Text style={styles.alumnoName}>
                    {alumno.nombre} {alumno.apellido}
                  </Text>
                  <View style={styles.alumnoMeta}>
                    <Ionicons name="mail-outline" size={14} color="#6b7280" />
                    <Text style={styles.alumnoMetaText}>{alumno.email}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>

            {/* Fila 2: Puntos + Tag de estado */}
            <View style={styles.bottomRow}>
              <View style={styles.puntosContainer}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.puntosText}>{inscripcion.puntos} pts</Text>
              </View>

              <Tag
                label={formatEstadoPago(inscripcion.estadoPago)}
                variant={estadoPagoToTagVariant(inscripcion.estadoPago)}
              />
            </View>
          </>
        )}
      </TouchableOpacity>

      {/* Modal de Detalle */}
      <AlumnoDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        inscripcion={inscripcion}
        curso={curso}
        onOpenRegistrarPago={() => {
          setShowDetailModal(false);
          setShowPagoModal(true);
        }}
        onOpenAsignarPuntos={() => {
          setShowDetailModal(false);
          setShowPuntosModal(true);
        }}
        onOpenEditarBeneficio={() => {
          setShowDetailModal(false);
          setShowBeneficioModal(true);
        }}
        onDarDeBaja={() => {
          setShowDetailModal(false);
          setShowBajaModal(true);
        }}
      />

      {/* Modal Asignar Puntos */}
      <AsignarPuntosModal
        visible={showPuntosModal}
        onClose={() => {
          setShowPuntosModal(false);
          setShowDetailModal(true);
        }}
        alumno={inscripcion.alumno}
        puntosActuales={inscripcion.puntos}
        onAsignar={async (puntos) => {
          await inscripcionService.asignarPuntos(
            inscripcion.id,
            puntos,
            usuario.id,
          );
          await onRefresh();
        }}
      />

      {/* Modal Editar Beneficio */}
      <EditarBeneficioModal
        visible={showBeneficioModal}
        onClose={() => {
          setShowBeneficioModal(false);
          setShowDetailModal(true);
        }}
        alumno={inscripcion.alumno}
        beneficioActual={inscripcion.beneficio}
        montoCurso={inscripcion.tipoPagoElegido.monto}
        onGuardar={async (beneficio) => {
          await inscripcionService.actualizarBeneficio(
            inscripcion.id,
            usuario.id,
            beneficio,
          );
          await onRefresh();
        }}
      />

      {/* Modal Registrar Pago */}
      <RegistrarPagoModal
        visible={showPagoModal}
        onClose={() => {
          setShowPagoModal(false);
          setShowDetailModal(true);
        }}
        usuarioId={usuario.id}
        inscripcionId={inscripcion.id}
        onSuccess={async () => {
          await onRefresh();
        }}
      />

      {/* Modal Confirmar Baja */}
      <ConfirmarBajaModal
        visible={showBajaModal}
        onClose={() => {
          setShowBajaModal(false);
          setShowDetailModal(true);
        }}
        alumno={inscripcion.alumno}
        curso={curso.nombre}
        onConfirmar={async () => {
          await inscripcionService.eliminarInscripcion(inscripcion.id);
          EventBus.emit("alumnoBaja", { cursoId: curso.id, alumnoId: inscripcion.alumno.id });
          await onRefresh();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  // MÓVIL: Layout vertical
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alumnoInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  alumnoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  alumnoDetails: {
    flex: 1,
  },
  alumnoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  alumnoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alumnoMetaText: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
  },
  puntosContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fffbeb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  puntosText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400e",
  },
  // WEB: Layout horizontal
  contentWeb: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  rightSectionWeb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: "auto",
  },
});

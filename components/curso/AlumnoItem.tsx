// components/curso/AlumnoItem.tsx - REFACTORIZADO
import { Ionicons } from "@expo/vector-icons";
import React, { use, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Curso, Inscripcion } from "@/model/model";
import { Tag } from "../ui/Tag";
import { formatEstadoPago } from "@/model/model";
import { inscripcionService } from "@/services/inscripcion.service";
import { AlumnoDetailModal } from "./modals/AlumnoInscripcionModal";
import { AsignarPuntosModal } from "./modals/AsignarPuntosModal";
import { EditarBeneficioModal } from "./modals/EditarBeneficioModal";
import { RegistrarPagoModal } from "./modals/RegistrarPagoModal";
import { ConfirmarBajaModal } from "./modals/BajaAlumnoModal";
import { estadoPagoToTagVariant } from "@/helper/funciones";
import { pagoService } from "@/services/pago.service";
import { useAuth } from "@/context/authContext";

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
        {/* Alumno Info */}
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

        {/* Estado de Pago */}
        <View style={styles.cardRight}>
          <Tag
            label={formatEstadoPago(inscripcion.estadoPago)}
            variant={estadoPagoToTagVariant(inscripcion.estadoPago)}
          />
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
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
          setShowDetailModal(true); // ← REABRE el detalle
        }}
        alumno={inscripcion.alumno}
        puntosActuales={inscripcion.puntos}
        onAsignar={async (puntos) => {
          await inscripcionService.asignarPuntos(inscripcion.id, puntos);
          await onRefresh();
          // Al confirmar, NO reabre el detalle, va a la lista
        }}
      />

      {/* Modal Editar Beneficio */}
      <EditarBeneficioModal
        visible={showBeneficioModal}
        onClose={() => {
          setShowBeneficioModal(false);
          setShowDetailModal(true); // ← REABRE el detalle
        }}
        alumno={inscripcion.alumno}
        beneficioActual={inscripcion.beneficio}
        montoCurso={inscripcion.tipoPagoElegido.monto}
        onGuardar={async (beneficio) => {
          await inscripcionService.actualizarBeneficio(
            inscripcion.id,
            beneficio,
          );
          await onRefresh();
          // Al guardar, NO reabre el detalle, va a la lista
        }}
      />

      {/* Modal Registrar Pago */}
      <RegistrarPagoModal
        visible={showPagoModal}
        onClose={() => {
          setShowPagoModal(false);
          setShowDetailModal(true); // ← REABRE el detalle
        }}
        usuarioId={usuario.id}
        inscripcionId={inscripcion.id}
        onSuccess={async () => {
          await onRefresh();
          // Al registrar, NO reabre el detalle, va a la lista
        }}
      />

      {/* Modal Confirmar Baja */}
      <ConfirmarBajaModal
        visible={showBajaModal}
        onClose={() => {
          setShowBajaModal(false);
          setShowDetailModal(true); // ← REABRE el detalle
        }}
        alumno={inscripcion.alumno}
        curso={curso.nombre}
        onConfirmar={async () => {
          await inscripcionService.eliminarInscripcion(inscripcion.id);
          await onRefresh();
          // Al confirmar baja, NO reabre, el alumno ya no existe
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
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
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});

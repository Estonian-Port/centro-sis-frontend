import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import { Button } from "../ui/Button";
import { Ionicons } from "@expo/vector-icons";

export default function TerminosCondicionesModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Términos y Condiciones</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.terminosTitle}>
              1. ACEPTACIÓN DE LOS TÉRMINOS
            </Text>
            <Text style={styles.terminosParrafo}>
              Al registrarse y utilizar los servicios del Centro Cultural Tenri
              (en adelante "el Instituto"), usted acepta estar sujeto a estos
              términos y condiciones. Si no está de acuerdo con alguno de estos
              términos, no debe utilizar nuestros servicios.
            </Text>

            <Text style={styles.terminosTitle}>2. SERVICIOS OFRECIDOS</Text>
            <Text style={styles.terminosParrafo}>
              El Instituto ofrece servicios educativos y culturales, incluyendo
              pero no limitado a: clases de idiomas, actividades culturales,
              talleres y eventos. Los horarios, modalidades y costos de los
              servicios pueden variar y están sujetos a disponibilidad.
            </Text>

            <Text style={styles.terminosTitle}>3. INSCRIPCIÓN Y PAGOS</Text>
            <Text style={styles.terminosParrafo}>
              • La inscripción a cualquier curso o actividad requiere el pago
              anticipado según las condiciones establecidas.{"\n"}• Los pagos
              pueden realizarse en las modalidades acordadas (contado, cuotas,
              etc.).{"\n"}• El Instituto se reserva el derecho de suspender el
              acceso a servicios en caso de mora en los pagos.{"\n"}• Los
              aranceles son establecidos por el Instituto y pueden modificarse
              con previo aviso.
            </Text>

            <Text style={styles.terminosTitle}>4. MENORES DE EDAD</Text>
            <Text style={styles.terminosParrafo}>
              Para la inscripción de menores de 18 años, es obligatorio
              proporcionar los datos de un adulto responsable. El adulto
              responsable asume la responsabilidad legal del menor durante su
              participación en las actividades del Instituto.
            </Text>

            <Text style={styles.terminosTitle}>5. ASISTENCIA Y CONDUCTA</Text>
            <Text style={styles.terminosParrafo}>
              • Los alumnos deben respetar los horarios establecidos.{"\n"}• Se
              espera un comportamiento respetuoso hacia profesores, personal y
              otros alumnos.{"\n"}• El Instituto se reserva el derecho de
              suspender o dar de baja a alumnos que no cumplan con las normas de
              conducta establecidas.
            </Text>

            <Text style={styles.terminosTitle}>
              6. CANCELACIONES Y REEMBOLSOS
            </Text>
            <Text style={styles.terminosParrafo}>
              • Las cancelaciones deben realizarse con un mínimo de 7 días de
              anticipación al inicio del curso.{"\n"}• No se realizarán
              reembolsos por clases perdidas por inasistencia del alumno.{"\n"}•
              En caso de cancelación de cursos por parte del Instituto, se
              reembolsará el monto íntegro o se ofrecerá la opción de crédito
              para futuras actividades.
            </Text>

            <Text style={styles.terminosTitle}>
              7. PRIVACIDAD Y PROTECCIÓN DE DATOS
            </Text>
            <Text style={styles.terminosParrafo}>
              El Instituto se compromete a proteger la información personal de
              los usuarios conforme a la Ley de Protección de Datos Personales
              (Ley 25.326). Los datos proporcionados serán utilizados únicamente
              para fines administrativos, académicos y de comunicación
              relacionados con las actividades del Instituto.
            </Text>

            <Text style={styles.terminosTitle}>8. PROPIEDAD INTELECTUAL</Text>
            <Text style={styles.terminosParrafo}>
              Todo el material didáctico, contenido y recursos proporcionados
              por el Instituto son propiedad del mismo y están protegidos por
              las leyes de propiedad intelectual. Queda prohibida su
              reproducción, distribución o uso comercial sin autorización
              expresa.
            </Text>

            <Text style={styles.terminosTitle}>
              9. DESLINDE DE RESPONSABILIDAD
            </Text>
            <Text style={styles.terminosParrafo}>
              • El Instituto no se hace responsable por pérdidas o daños a
              objetos personales dentro de sus instalaciones.{"\n"}• En caso de
              accidentes o lesiones durante las actividades, el Instituto
              brindará los primeros auxilios necesarios y notificará al
              responsable, pero no asumirá responsabilidad por tratamientos
              médicos posteriores.{"\n"}• El Instituto no garantiza resultados
              específicos en el aprendizaje, ya que estos dependen del esfuerzo
              y dedicación individual de cada alumno.
            </Text>

            <Text style={styles.terminosTitle}>10. USO DE IMÁGENES</Text>
            <Text style={styles.terminosParrafo}>
              Al aceptar estos términos, el usuario autoriza al Instituto a
              utilizar fotografías y videos tomados durante las actividades para
              fines de promoción y difusión en medios digitales y físicos, salvo
              manifestación expresa en contrario.
            </Text>

            <Text style={styles.terminosTitle}>11. MODIFICACIONES</Text>
            <Text style={styles.terminosParrafo}>
              El Instituto se reserva el derecho de modificar estos términos y
              condiciones en cualquier momento. Los cambios serán notificados a
              través de los canales oficiales de comunicación y entrarán en
              vigencia inmediatamente después de su publicación.
            </Text>

            <Text style={styles.terminosTitle}>12. CONTACTO</Text>
            <Text style={styles.terminosParrafo}>
              Para consultas, reclamos o sugerencias relacionadas con estos
              términos, puede contactarnos en:{"\n"}• Email:
              info@centrotenri.com{"\n"}• Teléfono: [número de contacto]{"\n"}•
              Dirección: [dirección del instituto]
            </Text>

            <View style={styles.terminosFecha}>
              <Text style={styles.terminosFechaText}>
                Última actualización: Enero 2026
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button title="Cerrar" onPress={onClose} variant="primary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    ...Platform.select({
      web: {
        justifyContent: "center",
        alignItems: "center",
      },
    }),
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Platform.select({
      ios: 650,
      android: 650,
      default: 650,
    }),
    ...Platform.select({
      web: {
        borderRadius: 16,
        maxWidth: 700,
        width: "100%",
      },
      default: {
        width: "100%",
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  terminosTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 20,
    marginBottom: 12,
  },
  terminosParrafo: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 16,
    textAlign: "justify",
  },
  terminosFecha: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  terminosFechaText: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
  },
});

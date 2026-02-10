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

// ===== TÉRMINOS Y CONDICIONES =====
export function TerminosCondicionesModal({
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
              Al registrarse y utilizar los servicios del Centro Cultural Tenri,
              usted acepta estar sujeto a estos términos y condiciones.
            </Text>

            <Text style={styles.terminosTitle}>
              2. PRIVACIDAD Y PROTECCIÓN DE DATOS
            </Text>
            <Text style={styles.terminosParrafo}>
              El Centro se compromete a proteger la información personal de los
              usuarios conforme a la Ley de Protección de Datos Personales (Ley
              25.326). Los datos proporcionados serán utilizados únicamente para
              fines administrativos, académicos y de comunicación relacionados
              con las actividades del Centro.
            </Text>

            <Text style={styles.terminosTitle}>3. USO DE LA APLICACIÓN</Text>
            <Text style={styles.terminosParrafo}>
              La aplicación permite gestionar cursos, registrar asistencias,
              consultar pagos y actualizar información personal. El usuario es
              responsable de mantener la confidencialidad de sus credenciales de
              acceso y de todas las actividades realizadas con su cuenta.
            </Text>

            <Text style={styles.terminosTitle}>4. MENORES DE EDAD</Text>
            <Text style={styles.terminosParrafo}>
              Para la inscripción de menores de 18 años, es obligatorio
              proporcionar los datos de un adulto responsable. El adulto
              responsable asume la responsabilidad legal del menor durante su
              participación en las actividades del Centro.
            </Text>

            <Text style={styles.terminosTitle}>5. MODIFICACIONES</Text>
            <Text style={styles.terminosParrafo}>
              El Centro se reserva el derecho de modificar estos términos en
              cualquier momento. Los cambios serán notificados a través de los
              canales oficiales de comunicación.
            </Text>

            <Text style={styles.terminosTitle}>
              6. ACEPTACIÓN ELECTRÓNICA Y FIRMA DIGITAL
            </Text>
            <Text style={styles.terminosParrafo}>
              Al marcar las casillas de verificación y hacer clic en "Completar
              Perfil", usted declara y acepta expresamente:{"\n\n"}
              a) Haber leído íntegramente los presentes Términos y Condiciones,
              el Reglamento Interno del Centro Cultural Japonés Tenri, y la
              Declaración Jurada de Deslinde de Responsabilidad.{"\n\n"}
              b) Comprender y aceptar en su totalidad el contenido de todos los
              documentos mencionados.{"\n\n"}
              c) Que su aceptación electrónica mediante el sistema tiene plena
              validez legal y equivale a su firma manuscrita, conforme a la Ley
              25.506 de Firma Digital de la República Argentina.{"\n\n"}
              d) Que esta aceptación constituye su consentimiento libre, expreso
              e informado respecto de todos los términos, condiciones,
              reglamentos y declaraciones contenidas en los documentos legales
              del Centro.{"\n\n"}
              e) Que renuncia expresamente a cualquier reclamo basado en la
              falta de firma manuscrita, reconociendo plena validez jurídica a
              la aceptación electrónica.
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

// ===== REGLAMENTO INTERNO =====
export function ReglamentoModal({
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
            <Text style={styles.modalTitle}>Reglamento Interno</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.reglamentoHeader}>
              CENTRO CULTURAL JAPONÉS TENRI{"\n"}
              REGLAMENTO INTERNO
            </Text>

            <Text style={styles.terminosParrafo}>
              Este Centro Cultural pertenece a la Iglesia Tenrikyo de Buenos
              Aires y comenzó a funcionar dentro de sus instalaciones, a partir
              del 1º de septiembre de 2015.
            </Text>

            <Text style={styles.terminosParrafo}>
              Queremos difundir en Argentina la Cultura japonesa y la Cultura
              Tenri. La Cultura Tenri se origina en las enseñanzas de Tenrikyo
              para cultivar el corazón de "Gratitud, Humildad y Ayuda mutua" que
              son los fundamentos para lograr más felicidad.
            </Text>

            <Text style={styles.terminosTitle}>
              1. Horario del Tsutome Sagrado
            </Text>
            <Text style={styles.terminosParrafo}>
              El Centro Cultural cesa sus actividades, inclusive las
              administrativas, todos los días de 17:30 a 18:45 hs durante el
              horario del Tsutome Sagrado vespertino.
            </Text>

            <Text style={styles.terminosTitle}>2. Cursos</Text>
            <Text style={styles.terminosParrafo}>
              Los cursos de las actividades se dictan durante todo el año
              completo.{"\n\n"}
              2.1 Si por causa de una actividad especial de la Iglesia el centro
              se viera obligado a suspender alguna clase, se notificará al
              profesor, quien deberá notificar a los alumnos.{"\n\n"}
              2.2 En casos de razones de fuerza mayor, como cortes de luz u
              otros, y fuera necesario suspender alguna clase, el Centro
              Cultural notificará a profesores y alumnos.{"\n"}
              Si profesores o alumnos acuerdan recuperar la clase suspendida, el
              Centro Cultural notificará la nueva fecha para su recuperación
              después de haber consultado con los profesores, quienes deberán
              notificar a los alumnos sobre la nueva fecha acordada.
            </Text>

            <Text style={styles.terminosTitle}>3. Continuidad de Clases</Text>
            <Text style={styles.terminosParrafo}>
              El resto del año se dictarán las clases en forma continuada a
              cargo de los profesores titulares o los que ellos mismos designen
              en su eventual ausencia.
            </Text>

            <Text style={styles.terminosTitle}>4. Ausencia del Profesor</Text>
            <Text style={styles.terminosParrafo}>
              En el caso de ausencia del profesor por causas de fuerza mayor, se
              procederá con la misma normativa.
            </Text>

            <Text style={styles.terminosTitle}>5. Horarios</Text>
            <Text style={styles.terminosParrafo}>
              Tanto profesores como alumnos podrán ingresar al dojo o a sus
              respectivas aulas con una antelación de 15 minutos, como máximo,
              al horario de cada clase. También deberán respetar el horario de
              finalización de su clase.
            </Text>

            <Text style={styles.terminosTitle}>6. Certificado Médico</Text>
            <Text style={styles.terminosParrafo}>
              Los alumnos interesados en las disciplinas de Arte Marcial o
              cualquier actividad física deben presentar el Certificado de Apto
              Médico correspondiente, antes de comenzar la clase.
            </Text>

            <Text style={styles.terminosTitle}>7. Clase de Prueba</Text>
            <Text style={styles.terminosParrafo}>
              Para los interesados en todas las Artes Marciales está bonificada
              una clase de prueba sin cargo alguno.
            </Text>

            <Text style={styles.terminosTitle}>8. Pago de Cuotas</Text>
            <Text style={styles.terminosParrafo}>
              El pago de las cuotas mensuales de los alumnos se realizará del 1º
              al 10 de cada mes, sin excepción.
            </Text>

            <Text style={styles.terminosTitle}>
              9. Menores de Edad - Facturación
            </Text>
            <Text style={styles.terminosParrafo}>
              Los menores de edad, para la primera facturación, deben concurrir
              con un mayor responsable para que registre sus datos a los efectos
              de poder emitir la correspondiente factura electrónica.
            </Text>

            <Text style={styles.terminosTitle}>
              10. Inicio de Actividades - Facturación
            </Text>
            <Text style={styles.terminosParrafo}>
              En el caso que un alumno comenzara una actividad anual entre el 1
              y el 14 del mes en curso, deberá abonar la cuota completa. En
              cambio sí comenzara del día 15 en adelante, deberá abonar solo el
              50 % de la cuota por ese mes. Esta excepción solo se considera
              para el primer mes de práctica, no siendo de aplicación en meses
              subsiguientes o en ningún otro caso.
            </Text>

            <Text style={styles.terminosTitle}>11. Inasistencias</Text>
            <Text style={styles.terminosParrafo}>
              En ningún caso se descontará importe alguno del abono por
              inasistencias del alumno.
            </Text>

            <Text style={styles.terminosTitle}>12. Dojo</Text>
            <Text style={styles.terminosParrafo}>
              El Dojo es un lugar sagrado donde se aprende a cultivar el
              espíritu. Una vez purificado el corazón y el cuerpo, finalmente
              podrá habitar en él la auténtica verdad de la técnica del Arte
              Marcial. Por respeto a este lugar, está prohibido caminar sin
              calzado fuera del tatami y, al mismo tiempo, está prohibido
              caminar con zapatos sobre el tatami. De esta manera, se respetan
              también las normas de seguridad e higiene.
            </Text>

            <Text style={styles.terminosTitle}>13. Limpieza e Higiene</Text>
            <Text style={styles.terminosParrafo}>
              Los profesores transmitirán a sus alumnos y acompañantes la
              consigna del buen uso y limpieza de dojos, aulas, baños y
              vestuarios. Está prohibido arrojar basura en todo el predio de la
              Institución.
            </Text>

            <Text style={styles.terminosTitle}>14. Áreas Restringidas</Text>
            <Text style={styles.terminosParrafo}>
              Si algún alumno concurre al establecimiento junto con acompañante,
              el mismo debe permanecer dentro de las inmediaciones del dojo,
              baños, estacionamiento o vestuarios. Todas las demás áreas del
              predio son de uso particular y privado, el acceso es
              restringido.Además, si el acompañante fuese una persona menor de
              edad, deberá ser acompañado y vigilado por un responsable a cargo.
            </Text>

            <View style={styles.terminosFecha}>
              <Text style={styles.terminosFechaText}>
                La Administración se reserva el derecho de ampliar y/o modificar
                el presente REGLAMENTO INTERNO, de ser necesario.
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

// ===== DECLARACIÓN JURADA =====
export function DeclaracionJuradaModal({
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
            <Text style={styles.modalTitle}>Declaración Jurada</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.declaracionHeader}>DECLARACIÓN JURADA</Text>

            <Text style={styles.declaracionParrafo}>
              MEDIANTE EL PRESENTE DOCUMENTO, DECLARO FEHACIENTEMENTE QUE
              PRACTICO LAS CLASES IMPARTIDAS EN EL CENTRO CULTURAL JAPONÉS TENRI
              - CON INDEPENDENCIA DE QUÉ INSTRUCTOR ESTÉ A CARGO -, CON TOTAL
              LIBERTAD Y CONSENTIMIENTO, HACIÉNDOME PLENAMENTE RESPONSABLE DE MI
              ESTADO DE SALUD FÍSICO Y/O MENTAL, ANTE CUALQUIER EVENTUAL TIPO DE
              LESIONES FÍSICAS O ANATÓMICAS, LEVES O GRAVES, QUE PUEDA SUFRIR
              PROPIAS DE TALES PRÁCTICAS.
            </Text>

            <Text style={styles.declaracionParrafo}>
              EN CONSECUENCIA EXIMO Y LIBERO DE TOTAL RESPONSABILIDAD CIVIL Y/O
              PENAL, TANTO A SUS INSTRUCTORES, AL CENTRO CULTURAL JAPONÉS TENRI
              Y A LA ASOCIACIÓN RELIGIOSA IGLESIA TENRIKYO DE BUENOS AIRES,
              DIRIGENTES O PARES DE TOTAL RESPONSABILIDAD CIVIL O PENAL. EN
              CONSECUENCIA RENUNCIO TANTO YO COMO MIS FAMILIARES LEGITIMADOS, A
              PROCURAR CUALQUIER RECLAMO JUDICIAL DE CUALQUIER ÍNDOLE.
            </Text>

            <Text style={styles.declaracionParrafo}>
              ESTA DECLARACIÓN SE HACE EXTENSIVA PARA LOS MISMOS EXIMIDOS, EN
              OTROS DOJOS O GIMNASIOS EN DONDE SE PRACTICA ASIDUAMENTE EL ARTE
              MARCIAL.
            </Text>

            <Text style={styles.terminosTitle}>IMPORTANTE:</Text>

            <Text style={styles.declaracionParrafo}>
              Para el caso que Ud. DESCONOZCA O NIEGUE SU FIRMA O CONTENIDO, o
              pretenda ACCIONAR contra cualquiera de los miembros o personas
              antes enunciadas, PODRÁ SER PASIBLE DE SER IMPUTADO DEL DELITO DE
              FALSO TESTIMONIO conforme al Código Penal Argentino en su Art.
              275: "SERÁ REPRIMIDO CON PRISIÓN DE UN MES A CUATRO AÑOS... el que
              AFIRMARE UNA FALSEDAD O NEGARE O CALLARE LA VERDAD, EN TODO O EN
              PARTE, EN SU DEPOSICIÓN..."
            </Text>

            <Text style={styles.declaracionParrafo}>
              Yo, por la presente, afirmo que he sido advertido e informado
              detalladamente sobre los riesgos inherentes a la práctica de esta
              actividad. Que es una actividad física extenuante y esforzada, por
              lo consiguiente queda a mi cargo y responsabilidad los exámenes
              físico y de salud necesarios para tal práctica, con la obligación
              de presentarlo al instructor a cargo, y si eventualmente resultó
              lesionado como resultado de un ataque cardíaco, pánico,
              hipertermia, deshidratación, etc., YO expresamente asumo los
              riesgos de tales lesiones y no demandaré a mi instructor ni a
              ningún miembro de la escuela por tales causas. Y afirmando que
              conozco todos estos riesgos.
            </Text>

            <Text style={styles.declaracionParrafo}>
              También declaro que soy mayor de edad y plenamente capaz para
              firma de esta Declaración Jurada, o que en caso de no serlo,
              cuento con el consentimiento por escrito de mi padre o tutor el
              cual firma al pie de la presente.
            </Text>

            <Text style={styles.declaracionParrafo}>
              Que la presente es una Declaración LIBRE Y PLENA por parte de mi
              persona, y no un mero enunciado. Y firmo dando conformidad y
              asentando que he leído y entendido este documento por mi propia
              voluntad. Declaro que mi familia conoce mis actividades deportivas
              y el texto íntegro del presente.
            </Text>

            <View style={styles.notaFirmaElectronica}>
              <Text style={styles.notaFirmaTitle}>
                NOTA SOBRE FIRMA ELECTRÓNICA
              </Text>
              <Text style={styles.notaFirmaTexto}>
                Esta Declaración Jurada se formaliza mediante ACEPTACIÓN
                ELECTRÓNICA. Al marcar la casilla de verificación
                correspondiente y completar el registro, usted está otorgando su
                consentimiento y firma de manera digital, con plena validez
                jurídica conforme a la Ley 25.506 de Firma Digital de la
                República Argentina.{"\n\n"}
                Su aceptación electrónica tiene el mismo valor legal que una
                firma manuscrita y constituye prueba fehaciente de su
                consentimiento libre, expreso e informado respecto del contenido
                íntegro de esta Declaración Jurada.{"\n\n"}
                Para menores de edad: La aceptación debe ser realizada por el
                padre, madre o tutor legal responsable, quien asume plena
                responsabilidad por el contenido firmado electrónicamente.
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
  reglamentoHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  declaracionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  declaracionParrafo: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "justify",
  },
  notaFirmaElectronica: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  notaFirmaTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 12,
    textAlign: "center",
  },
  notaFirmaTexto: {
    fontSize: 13,
    color: "#78350f",
    lineHeight: 20,
    textAlign: "justify",
  },
});

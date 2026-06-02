<!-- [LANG:PHP, JavaScript, MySQL] -->
<!-- [DEMO_READY] -->

# Sistema de Gestión y Relevamiento de Arbolado Urbano

<!-- EN -->
## Project Overview
This application is a specialized technical tool designed for the management and inspection of urban forestry. It streamlines the workflow from citizen requests ("trámites") to the generation of professional technical reports and maintenance orders.

### Key Functionalities

#### 1. Dynamic Technical Inspection
The core of the system is a dynamic inspection form that allows technical staff to evaluate trees in the field.
*   **Group Relevancy:** Ability to group multiple trees (1 to 5 groups) in a single inspection to optimize reporting for similar specimens or locations.
*   **Dendrometric Data:** Collection of precise physical data such as height in meters and trunk diameter in centimeters.
*   **Health Assessment:** Qualitative evaluation of the general state (Excellent, Good, Fair, Poor).

#### 2. Environmental Impact & Risk Analysis
Detailed tracking of the interaction between the tree and the urban infrastructure:
*   **Infrastructure Damage:** Specific checklists for root damage to sidewalks (leveling, breakage) and roadways.
*   **Canopy & Branch Management:** Identification of low branches, obstruction of public lighting, or dead/broken branches in the crown.
*   **Risk Situations:** Flags potential hazards such as hollowing, trunk inclination, decay, or risk of branch fall.
*   **Utility Interference:** Mapping of proximity to aerial service lines (Low/Medium/High voltage, Telephony, Cable TV).

#### 3. Automated Report Generation
The system features a logic engine that converts structured form data into a professional narrative report.
*   **Natural Language Processing (Logic):** It automatically builds a justified text that describes the inspection findings in a readable paragraph format.
*   **Botanical Integration:** Automatically matches common names with scientific names from a central database.
*   **Administrative Flow:** Generates specific instructions for municipal crews or property owners, including legal notifications.

#### 4. Logistics & Maintenance Planning
*   **Priority Setting:** Categorization of task urgency.
*   **Tool Requirements:** Identifies specific machinery needed for the job, such as extensible chainsaws or different types of hydra-elevators (up to 24m).
*   **Work Orders:** Integration with "creainforme.php" to trigger subsequent administrative steps.

#### 5. User & Record Management
*   **Secure Access:** Session-based authentication system.
*   **History Tracking:** Integrated log of calls and observations linked to each specific case.
*   **Data Consistency:** Real-time data retrieval from "barrios" (neighborhoods), species, and administrative states.

---

<!-- ES -->
## Resumen del Proyecto
Esta aplicación es una herramienta técnica especializada diseñada para la gestión y el relevamiento del arbolado urbano. Optimiza el flujo de trabajo desde la recepción de reclamos ("trámites") hasta la generación de informes técnicos profesionales y órdenes de mantenimiento.

### Funcionalidades Clave

#### 1. Inspección Técnica Dinámica
El núcleo del sistema es un formulario de inspección dinámico que permite al personal técnico evaluar los árboles en el terreno.
*   **Agrupación Flexible:** Capacidad de agrupar múltiples ejemplares (de 1 a 5 grupos) en una sola inspección para optimizar el reporte de árboles con características similares.
*   **Datos Dendrométricos:** Recolección de datos físicos precisos como altura en metros y diámetro del fuste en centímetros.
*   **Estado Vegetativo:** Evaluación cualitativa del estado general (Muy Bueno, Bueno, Regular, Malo).

#### 2. Análisis de Riesgo e Impacto Ambiental
Seguimiento detallado de la interacción entre el árbol y la infraestructura urbana:
*   **Daños en Infraestructura:** Listas de verificación específicas para daños de raíces en veredas (levantamiento, rotura) y calzadas.
*   **Gestión de Copa y Ramas:** Identificación de ramas bajas, obstrucción de alumbrado público o presencia de ramas secas/quebradas.
*   **Situaciones de Riesgo:** Identificación de peligros potenciales como ahuecamiento, inclinación de fuste, podredumbre o riesgo de desrame/caída.
*   **Interferencia con Servicios:** Mapeo de proximidad a redes de servicios aéreos (Baja/Media/Alta tensión, Telefonía, TV por cable).

#### 3. Generación Automática de Informes
El sistema cuenta con un motor lógico que convierte los datos estructurados del formulario en un informe narrativo profesional.
*   **Lógica de Lenguaje Natural:** Construye automáticamente un texto justificado que describe los hallazgos de la inspección en un formato de párrafo legible para expedientes oficiales.
*   **Integración Botánica:** Cruza automáticamente nombres comunes con nombres científicos desde una base de datos central.
*   **Flujo Administrativo:** Genera indicaciones específicas tanto para cuadrillas municipales como para el propietario, incluyendo la notificación legal.

#### 4. Planificación Logística y de Mantenimiento
*   **Establecimiento de Prioridades:** Categorización de la urgencia de las tareas (Baja, Media, Alta).
*   **Requerimientos de Herramental:** Identifica la maquinaria específica necesaria, como motosierras extensibles o diferentes tipos de hidroelevadores (hasta 24m).
*   **Órdenes de Trabajo:** Integración con procesos de creación de informes para disparar los siguientes pasos administrativos.

#### 5. Gestión de Registros y Usuarios
*   **Acceso Seguro:** Sistema de autenticación basado en sesiones.
*   **Historial de Contacto:** Registro integrado de llamadas y observaciones vinculadas a cada trámite específico.
*   **Consistencia de Datos:** Recuperación en tiempo real de información sobre barrios, especies y estados administrativos.

---

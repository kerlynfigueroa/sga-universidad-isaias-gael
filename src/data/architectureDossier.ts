import {
  ArchitectureActor,
  ArchitectureRequirement,
  UseCase,
  ArchitectureRisk,
  DatabaseEntity,
} from '../types/academic';

export const ARCHITECTURE_METADATA = {
  systemName: 'Sistema de Gestión Académica (SGA) · Universidad Isaías Gael',
  version: '2.5.0-Audited-Release',
  status: 'Aprobado para Implementación',
  author: 'Arquitecto Principal de Software & Comité TI - Universidad Isaías Gael',
  domain: 'Educación Superior Universitaria',
  scope: 'Pregrado, Posgrado y Educación Continua - Universidad Isaías Gael',
  targetScale: '35,000 estudiantes activos, 1,800 docentes, 12 facultades',
};

// 1. Identificación de Actores
export const SYSTEM_ACTORS: ArchitectureActor[] = [
  {
    id: 'ACT-01',
    name: 'Estudiante',
    role: 'Actor Primario (Consumidor y Solicitante)',
    category: 'Primario',
    description: 'Estudiante regular o nuevo que interactúa con el sistema para consultar su oferta académica, realizar matrícula en línea, verificar horarios, consultar calificaciones y solicitar certificaciones.',
    responsibilities: [
      'Inscribir asignaturas respetando la malla curricular y pre-requisitos',
      'Consultar avances y promedios acumulados (PGA)',
      'Descargar órdenes de matrícula y certificados oficiales con hash de validación',
      'Realizar solicitudes de cancelación o adición en las ventanas fijadas',
    ],
    accessChannels: ['Portal Web Responsive (SPA)', 'App Móvil PWA Estudiantil', 'Notificaciones Push / Email'],
  },
  {
    id: 'ACT-02',
    name: 'Docente (Profesor Titular / Cátedra)',
    role: 'Actor Primario (Operativo Académico)',
    category: 'Primario',
    description: 'Docente universitario responsable de la gestión de aula, carga de silabos, registro de asistencia, ingreso de calificaciones por cortes evaluativos y cierre de actas definitivas.',
    responsibilities: [
      'Gestionar listas de clase de sus grupos asignados',
      'Registrar notas parciales y finales dentro de las fechas límite del calendario',
      'Firmar digitalmente o cerrar formalmente las actas de calificación con auditoría',
      'Atender solicitudes de reclamos o rectificación justificada de notas',
    ],
    accessChannels: ['Portal Web Docente (Escritorio / Tablet)', 'Autenticación con 2FA Institucional'],
  },
  {
    id: 'ACT-03',
    name: 'Director de Programa / Decano',
    role: 'Actor de Gestión y Supervisión Curricular',
    category: 'Primario',
    description: 'Autoridad académica responsable de la planificación semestral, apertura de cupos, asignación de docentes a cursos, y aprobación de homologaciones o excepciones académicas.',
    responsibilities: [
      'Aprobar la programación académica del período (oferta de grupos y horarios)',
      'Supervisar el avance del registro de notas y cumplimiento de plazos docentes',
      'Gestionar excepciones de pre-requisitos y solicitudes extraordinarias de matrícula',
      'Monitorear indicadores de deserción y rendimiento por asignatura',
    ],
    accessChannels: ['Dashboard de Analítica y Gestión Curricular (Web)'],
  },
  {
    id: 'ACT-04',
    name: 'Administrador de Registro y Control Académico (Registrar)',
    role: 'Actor Operativo Central',
    category: 'Primario',
    description: 'Equipo central que administra los períodos lectivos, mallas curriculares, aperturas de calendarios de matrícula, emisión de actas consolidadas y grado.',
    responsibilities: [
      'Configuración del calendario institucional y ventanas temporales de matrícula',
      'Parametrización de reglas de negocio (máximo de créditos, políticas de repitencia)',
      'Consolidación y cierre definitivo de período académico',
      'Generación de sábanas oficiales y reportes para ministerios u organismos de acreditación',
    ],
    accessChannels: ['Consola de Administración Central (Web con permisos RBAC estrictos)'],
  },
  {
    id: 'ACT-05',
    name: 'Administrador de Sistemas / DevOps',
    role: 'Actor de Infraestructura y Mantenimiento',
    category: 'Secundario',
    description: 'Ingeniero de infraestructura responsable del aprovisionamiento, seguridad perimetral, backups, observabilidad y balanceo de carga.',
    responsibilities: [
      'Mantenimiento de pipelines CI/CD y despliegue continuo',
      'Monitoreo de SLAs, telemetría y logs de auditoría inmutables',
      'Gestión de políticas de escalado elástico ante picos masivos de matrícula',
    ],
    accessChannels: ['Consola Cloud, Grafana/Prometheus, Bastion SSH / IAM Zero-Trust'],
  },
  {
    id: 'ACT-06',
    name: 'Sistemas Externos Integrados',
    role: 'Actores del Ecosistema Institucional',
    category: 'Sistema Externo',
    description: 'Plataformas satélite que se integran bidireccionalmente vía API Gateway y colas de mensajería.',
    responsibilities: [
      'LMS Institucional (Moodle / Canvas): Sincronización de estudiantes y cursos activos',
      'Sistema Financiero / ERP (SAP / Banner Finanzas): Validación de paz y salvo financiero para habilitar matrícula',
      'Directorio Activo Institucional (Google Workspace / Azure AD): Autenticación centralizada SAML2.0/OIDC',
    ],
    accessChannels: ['REST APIs aseguradas con mTLS / OAuth2 Bearer Tokens, Webhooks firmados'],
  },
];

// 2. Requerimientos Funcionales
export const FUNCTIONAL_REQUIREMENTS: ArchitectureRequirement[] = [
  {
    id: 'RF-01',
    category: 'Gestión de Estudiantes',
    title: 'Registro y Hoja de Vida Académica',
    description: 'El sistema debe permitir registrar, actualizar y consultar la información personal, programa curricular, estado de matrícula, historial semestral y récord de créditos de cada estudiante con identificador único institucional.',
    priority: 'CRITICA',
    rationale: 'Es el núcleo de la identidad académica y base de cálculo para todas las operaciones subsiguientes.',
  },
  {
    id: 'RF-02',
    category: 'Gestión de Docentes',
    title: 'Escalafón, Carga y Asignación de Cursos',
    description: 'Debe permitir la administración del perfil docente, categoría (titular, cátedra), departamento académico, horas semanales contratadas y vinculación a grupos/horarios con detección de choques.',
    priority: 'ALTA',
    rationale: 'Garantiza el cumplimiento normativo laboral y evita la sobrecarga o doble asignación horaria.',
  },
  {
    id: 'RF-03',
    category: 'Gestión de Asignaturas',
    title: 'Malla Curricular, Créditos y Pre-requisitos',
    description: 'El sistema debe mantener el catálogo de asignaturas con código, créditos académicos (SCT), horas teóricas/prácticas, silabo y grafo de pre-requisitos y co-requisitos.',
    priority: 'CRITICA',
    rationale: 'Base computacional para validar la elegibilidad de inscripción en el motor de matrículas.',
  },
  {
    id: 'RF-04',
    category: 'Matrículas',
    title: 'Motor Transaccional de Matrícula en Línea',
    description: 'Permitir al estudiante seleccionar asignaturas para un período específico, validando en tiempo real: cupo disponible en grupo, cumplimiento estricto de pre-requisitos, límite de créditos permitidos (máx 20) y ausencia de traslapes de horario.',
    priority: 'CRITICA',
    rationale: 'Proceso de máxima concurrencia del año académico; requiere integridad transaccional estricta (ACID).',
  },
  {
    id: 'RF-05',
    category: 'Registro de Calificaciones',
    title: 'Libro de Calificaciones Multi-Corte y Cierre de Actas',
    description: 'El docente debe poder registrar notas parciales (Corte 1: 30%, Corte 2: 30%, Final: 40%) en escala de 0.0 a 5.0, calcular automáticamente la definitiva y ejecutar el cierre formal con sello temporal inmutable.',
    priority: 'CRITICA',
    rationale: 'Garantiza la legalidad académica, transparencia evaluativa y previene adulteraciones posteriores.',
  },
  {
    id: 'RF-06',
    category: 'Reportes Académicos',
    title: 'Sábanas de Notas, Certificados Oficiales y Alertas de Rendimiento',
    description: 'Generación instantánea de sábanas consolidadas por curso, certificados de notas oficiales descargables con código QR de verificación criptográfica, y reportes de estudiantes en riesgo académico (PGA < 3.0).',
    priority: 'ALTA',
    rationale: 'Atención a requerimientos de acreditación de alta calidad y seguimiento al éxito estudiantil.',
  },
  {
    id: 'RF-07',
    category: 'Seguridad y Auditoría',
    title: 'Trazabilidad y Log de Modificaciones',
    description: 'Cualquier modificación a una calificación después de guardada debe generar una entrada inmutable de auditoría con: usuario, fecha/hora, valor anterior, nuevo valor y motivo de la modificación.',
    priority: 'ALTA',
    rationale: 'Cumplimiento normativo y prevención de fraude en el historial académico.',
  },
];

// 3. Requerimientos No Funcionales (ISO/IEC 25010)
export const NON_FUNCTIONAL_REQUIREMENTS: ArchitectureRequirement[] = [
  {
    id: 'RNF-01',
    category: 'Rendimiento y Capacidad',
    title: 'Latencia y Concurrencia en Pico de Matrícula',
    description: 'El motor de matrícula debe responder en un percentil p95 menor a 800 ms bajo una carga concurrente sostenida de 5,000 transacciones simultáneas por minuto en fechas de apertura.',
    priority: 'CRITICA',
    rationale: 'Evitar caídas de servidor y frustración masiva estudiantil en las horas de apertura de matrícula.',
    isoStandard: 'ISO/IEC 25010 - Rendimiento & Comportamiento Temporal',
  },
  {
    id: 'RNF-02',
    category: 'Seguridad y Privacidad',
    title: 'Cifrado, RBAC y Protección de Datos Personales',
    description: 'Todos los datos en tránsito deben cifrarse con TLS 1.3 y en reposo con AES-256. Control de acceso granular basado en roles (RBAC) con principio de menor privilegio y cumplimiento de leyes de protección de datos personales.',
    priority: 'CRITICA',
    rationale: 'Protección de historiales de notas, números de identificación y privacidad estudiantil.',
    isoStandard: 'ISO/IEC 25010 - Seguridad & Confidencialidad',
  },
  {
    id: 'RNF-03',
    category: 'Disponibilidad y Resiliencia',
    title: 'SLA 99.9% y Recuperación ante Desastres (RTO / RPO)',
    description: 'Disponibilidad de 99.9% durante el calendario académico regular y 99.99% durante la semana de matrículas. RTO (Recovery Time Objective) < 1 hora y RPO (Recovery Point Objective) < 5 minutos con replicación multi-zona.',
    priority: 'CRITICA',
    rationale: 'La suspensión del servicio paraliza la operación institucional.',
    isoStandard: 'ISO/IEC 25010 - Fiabilidad & Tolerancia a Fallos',
  },
  {
    id: 'RNF-04',
    category: 'Integridad de Datos y Concurrencia',
    title: 'Aislamiento Transaccional Serializable / Bloqueo Pesimista de Cupos',
    description: 'Garantizar que no exista sobrecupo (overbooking) en ninguna asignatura bajo concurrencia extrema, utilizando transacciones con nivel de aislamiento Repeatable Read o bloqueos controlados con Redis / PostgreSQL.',
    priority: 'CRITICA',
    rationale: 'Un cupo no puede ser adjudicado a dos estudiantes en milisegundos idénticos.',
    isoStandard: 'ISO/IEC 25010 - Fiabilidad & Madurez',
  },
  {
    id: 'RNF-05',
    category: 'Usabilidad y Accesibilidad',
    title: 'WCAG 2.1 Nivel AA y Diseño Responsive',
    description: 'Cumplir con las pautas de accesibilidad web WCAG 2.1 nivel AA, soporte para lectores de pantalla, contraste adecuado y adaptación fluida a smartphones, tablets y pantallas de escritorio.',
    priority: 'ALTA',
    rationale: 'Inclusión educativa universal para todos los estudiantes y docentes.',
    isoStandard: 'ISO/IEC 25010 - Usabilidad & Accesibilidad',
  },
  {
    id: 'RNF-06',
    category: 'Mantenibilidad y Modularidad',
    title: 'Arquitectura Modular / Clean Architecture',
    description: 'Separación estricta entre capa de dominio, casos de uso, adaptadores de interfaz e infraestructura para permitir reemplazo de servicios sin reescribir lógica de negocio.',
    priority: 'ALTA',
    rationale: 'Garantiza la evolución del sistema durante más de 10 años sin generar deuda técnica incontrolable.',
    isoStandard: 'ISO/IEC 25010 - Mantenibilidad & Modificabilidad',
  },
];

// 4. Restricciones del Sistema
export const SYSTEM_CONSTRAINTS = [
  {
    id: 'RES-01',
    category: 'Normativa Legal Universitaria',
    name: 'Reglamento Estudiantil y Escala Oficial',
    detail: 'La escala de calificaciones es obligatoriamente de 0.0 a 5.0 con redondeo a un decimal. La nota mínima aprobatoria es 3.0. No se permiten notas negativas ni superiores a 5.0.',
  },
  {
    id: 'RES-02',
    category: 'Regla de Créditos y Carga Académica',
    name: 'Límite Semestral de Créditos',
    detail: 'Un estudiante no puede matricular más de 20 créditos académicos por período ordinario sin autorización explícita y resolución del Consejo de Facultad.',
  },
  {
    id: 'RES-03',
    category: 'Temporalidad y Calendario Académico',
    name: 'Ventanas de Tiempo Rígidas',
    detail: 'El registro y cierre de calificaciones solo está habilitado durante las semanas estipuladas por el Consejo Académico. Vencida la fecha, el acta se bloquea automáticamente en modo de solo lectura.',
  },
  {
    id: 'RES-04',
    category: 'Infraestructura Tecnológica',
    name: 'Despliegue Multi-Nube / Contenedores OCI',
    detail: 'La arquitectura debe empaquetarse en contenedores Docker estandarizados bajo especificación OCI y ser agnóstica de nube (AWS, GCP, Azure o Kubernetes on-premise).',
  },
  {
    id: 'RES-05',
    category: 'Presupuesto y Licenciamiento',
    name: 'Open Source de Grado Empresarial',
    detail: 'Preferencia por motores de bases de datos relacionales robustos de código abierto (PostgreSQL) y stacks sin costos de licencias por núcleo privativo.',
  },
];

// 5. Casos de Uso Principales
export const PRIMARY_USE_CASES: UseCase[] = [
  {
    id: 'CU-01',
    title: 'Inscripción de Asignaturas (Matrícula en Línea)',
    actor: 'Estudiante',
    preconditions: [
      'Estudiante autenticado con sesión activa',
      'Estado financiero activo (Paz y Salvo verificado)',
      'Ventana de matrícula abierta según calendario y turno de prioridad',
    ],
    mainFlow: [
      '1. El estudiante ingresa al módulo de Matrícula y selecciona el período académico vigente.',
      '2. El sistema consulta y proyecta la oferta de cursos con cupos disponibles y horarios compatibles.',
      '3. El estudiante selecciona las asignaturas y grupos deseados.',
      '4. El motor evalúa en paralelo: pre-requisitos aprobados, tope de créditos y ausencia de choques de horario.',
      '5. El estudiante confirma la selección.',
      '6. El sistema inicia una transacción de base de datos, reserva los cupos con bloqueo de fila y genera el comprobante oficial de matrícula.',
      '7. Se notifica al estudiante y se actualiza la lista de clase del docente.',
    ],
    postconditions: [
      'Cupos debitados en la oferta académica',
      'Registro de matrícula persistido con estado CONFIRMADA',
      'Comprobante emitido con código verificable',
    ],
    alternativeFlow: 'Si un cupo se agota durante la confirmación, se reversa la transacción (Rollback), se notifica el grupo conflictivo y se ofrece lista de espera o grupos alternos.',
    businessRules: ['Máx 20 créditos', 'Nota previa de pre-requisito >= 3.0', 'No traslape horario'],
  },
  {
    id: 'CU-02',
    title: 'Registro y Cierre de Calificaciones Parciales y Definitivas',
    actor: 'Docente',
    preconditions: [
      'Docente asignado formalmente al grupo de la asignatura',
      'Período y corte evaluativo dentro de las fechas fijadas en el calendario',
    ],
    mainFlow: [
      '1. El docente selecciona su asignatura y grupo asignado.',
      '2. El sistema carga la lista nominal de estudiantes matriculados.',
      '3. El docente ingresa o edita las notas del corte correspondiente (Corte 1, Corte 2 o Examen Final).',
      '4. El sistema valida en cliente y servidor que cada nota esté en el rango de 0.0 a 5.0.',
      '5. El docente guarda como borrador o selecciona "Cierre Definitivo de Acta".',
      '6. Al cerrar el acta, el sistema calcula la nota ponderada definitiva, marca el estado como CERRADO_AUDITADO y genera un hash de integridad.',
      '7. Las calificaciones impactan el promedio acumulado del estudiante de forma asíncrona.',
    ],
    postconditions: [
      'Calificaciones guardadas e inmutables',
      'Historial de auditoría registrado con usuario, IP y timestamp',
      'Estudiantes notificados de su nota definitiva',
    ],
    alternativeFlow: 'Si la fecha límite venció, el sistema deshabilita la edición y muestra mensaje de contacto a la Decanatura para solicitud formal de reapertura extemporánea.',
    businessRules: ['Corte 1 (30%) + Corte 2 (30%) + Examen Final (40%) = 100%', 'Nota mínima aprobatoria: 3.0'],
  },
  {
    id: 'CU-03',
    title: 'Generación de Certificado de Calificaciones Oficial',
    actor: 'Estudiante / Registrador',
    preconditions: [
      'Estudiante con registro en la institución',
      'Permiso de generación o rol de consulta autorizado',
    ],
    mainFlow: [
      '1. El usuario selecciona el estudiante y solicita el "Certificado de Calificaciones / Récord Académico".',
      '2. El sistema recopila todo el historial de asignaturas cursadas, créditos, notas definitivas y PGA.',
      '3. Se compila el documento en formato formal con membrete universitario, firma digital y código de validación.',
      '4. El usuario puede visualizarlo en pantalla o exportarlo a PDF listo para impresión.',
    ],
    postconditions: ['Documento generado con sello temporal y registro de auditoría de descarga'],
    alternativeFlow: 'Si el estudiante tiene retención académica o administrativa, se muestra la restricción correspondiente.',
    businessRules: ['Incluye promedio ponderado semestral y acumulado oficial'],
  },
  {
    id: 'CU-04',
    title: 'Gestión de Malla Curricular y Catálogo de Asignaturas',
    actor: 'Director de Programa / Administrador',
    preconditions: ['Rol con privilegios de gestión curricular'],
    mainFlow: [
      '1. El director accede al catálogo de asignaturas del programa.',
      '2. Crea o edita una asignatura especificando código, créditos, horas y pre-requisitos.',
      '3. El sistema valida que no existan ciclos infinitos en el grafo de pre-requisitos (ej. A requiere B y B requiere A).',
      '4. Se persiste la asignatura en la versión del plan de estudios vigente.',
    ],
    postconditions: ['Asignatura disponible para la programación de la oferta semestral'],
    alternativeFlow: 'Si se detecta una referencia circular en pre-requisitos, se bloquea el guardado con alerta técnica.',
    businessRules: ['Validación de grafo acíclico dirigido (DAG) para pre-requisitos'],
  },
];

// 6. Arquitectura Recomendada
export const RECOMMENDED_ARCHITECTURE = {
  style: 'Arquitectura Limpia / Hexagonal Modular con API First & Enfoque Híbrido Event-Driven',
  paradigm: 'Dominio Centralizado (Domain-Driven Design) + Microservicios Lógicos o Modular Monolith con alta cohesión',
  frontend: {
    framework: 'React 19 + TypeScript + Vite + Tailwind CSS',
    pattern: 'Single Page Application (SPA) con arquitectura basada en componentes, hooks desacoplados y estado predictivo',
    designSystem: 'Executive Academic Design System con WCAG AA, tipografía Plus Jakarta Sans y números tabulares',
  },
  backend: {
    runtime: 'Node.js / Express con TypeScript (o NestJS en producción masiva)',
    layers: [
      'Capa de Dominio (Entidades de negocio y reglas puras sin dependencias de frameworks)',
      'Capa de Aplicación (Casos de uso: InscribirAsignatura, RegistrarCalificacion, CerrarActa)',
      'Capa de Adaptadores / Interfaces (Controllers REST, DTOs, Serializadores)',
      'Capa de Infraestructura (PostgreSQL con Pool de Conexiones, Redis Cache, Message Broker RabbitMQ/Kafka)',
    ],
  },
  database: {
    engine: 'PostgreSQL 16 Enterprise Relational Database',
    justification: 'Cumplimiento estricto de ACID, soporte para JSONB, índices B-Tree/GIN, y concurrencia MVCC con bloqueo pesimista select for update.',
    cache: 'Redis 7 Cluster para control de sesiones, caché de catálogo y semáforo de cupos en tiempo real',
  },
  deployment: {
    containerization: 'Docker con imágenes ligeras Alpine multi-stage',
    orchestration: 'Kubernetes (EKS/GKE) con Horizontal Pod Autoscaler (HPA) configurado sobre métricas de CPU y latencia',
    edge: 'Cloudflare / AWS CloudFront con WAF para mitigación de DDoS y compresión Brotli/Gzip',
  },
};

// 7. Justificación de la Arquitectura
export const ARCHITECTURE_JUSTIFICATION = [
  {
    aspect: '¿Por qué Arquitectura Limpia / Hexagonal?',
    argument: 'La universidad opera bajo reglamentos académicos que cambian frecuentemente (políticas de repitencia, cálculo de promedios, reglas de créditos). Desacoplar las reglas de negocio de la base de datos y la interfaz gráfica permite modificar las políticas académicas sin riesgo de romper los controladores web ni rehacer la persistencia.',
  },
  {
    aspect: '¿Por qué Base de Datos Relacional (PostgreSQL) y no NoSQL?',
    argument: 'El sistema académico es intrínsecamente relacional (Estudiantes -> Matrículas -> Cursos -> Notas -> Docentes). Requiere integridad referencial estricta, claves foráneas, restricciones UNIQUE y transacciones ACID. Una base NoSQL documentada crearía inconsistencias críticas de datos (ej. un estudiante matriculado en un curso que ya no existe o duplicidad de notas).',
  },
  {
    aspect: '¿Por qué Monolito Modular vs Microservicios Distribuidos en Fase Inicial?',
    argument: 'Un Monolito Modular bien estructurado con límites de contexto claros (Bounded Contexts) evita la sobrecarga de latencia de red, la complejidad del patrón Saga para transacciones distribuidas y la orquestación distribuida, ofreciendo al mismo tiempo la facilidad de separar módulos a microservicios independientes si la escala lo exige en el futuro.',
  },
  {
    aspect: '¿Por qué Redis para el Motor de Cupos de Matrícula?',
    argument: 'Durante la apertura de matrículas a las 8:00 AM, miles de estudiantes compiten simultáneamente por 30 cupos en una asignatura de alta demanda. Ejecutar bloqueos atómicos decrementales en Redis (ej. DECRBY cupos:G-01) absorbe 50,000 req/s en memoria sub-milisegundo antes de escribir en disco, protegiendo la base de datos principal de saturación por bloqueos bloqueantes.',
  },
];

// 8. Componentes del Sistema
export const SYSTEM_COMPONENTS = [
  {
    id: 'COMP-01',
    name: 'Módulo de Gestión de Identidad y Acceso (IAM / RBAC)',
    layer: 'Seguridad y Autenticación',
    technologies: 'OAuth2 / OpenID Connect / JWT / Bcrypt',
    description: 'Control de autenticación multifactor (MFA), asignación de roles y permisos granulares, auditoría de sesiones y protección contra ataques de fuerza bruta.',
  },
  {
    id: 'COMP-02',
    name: 'Módulo de Gestión Estudiantil y Docente',
    layer: 'Dominio Académico',
    technologies: 'TypeScript / DDD Entities / Validation Schema',
    description: 'Mantenimiento del ciclo de vida del estudiante (admisión, matrícula regular, retiro, egreso) y del perfil docente (escalafón, carga académica, departamento).',
  },
  {
    id: 'COMP-03',
    name: 'Motor de Malla Curricular y Validación de Pre-requisitos',
    layer: 'Motor de Reglas de Negocio',
    technologies: 'Directed Acyclic Graph (DAG) Engine',
    description: 'Verificación topológica del plan de estudios. Evalúa en milisegundos si un estudiante cumple con la totalidad de asignaturas pre-requisito y créditos mínimos exigidos.',
  },
  {
    id: 'COMP-04',
    name: 'Motor Transaccional de Matrícula (Enrollment Engine)',
    layer: 'Núcleo Transaccional',
    technologies: 'PostgreSQL Transactions + Redis Atomic Counters',
    description: 'Gestión concurrente de inscripciones, control de cupos en tiempo real, detección de choques de horario y generación de actas de inscripción.',
  },
  {
    id: 'COMP-05',
    name: 'Libro de Calificaciones y Cierre de Actas (Gradebook)',
    layer: 'Evaluación y Registro',
    technologies: 'Audit Trail Engine / Immutable Event Store',
    description: 'Ingreso multi-corte con ponderaciones configurables, cálculo en coma flotante con redondeo institucional y sellado criptográfico de actas cerradas.',
  },
  {
    id: 'COMP-06',
    name: 'Motor de Reportes y Analítica Académica',
    layer: 'Inteligencia de Datos y Reportes',
    technologies: 'Worker Asíncrono / PDF Generator / Tabular Views',
    description: 'Generación de sábanas de notas, certificados oficiales con código de barras / QR, cálculo de PGA acumulado y detección temprana de riesgo de deserción.',
  },
];

// 9. Entidades de Base de Datos
export const DATABASE_ENTITIES: DatabaseEntity[] = [
  {
    name: 'Estudiante',
    table: 'estudiantes',
    description: 'Información institucional, personal y estado curricular de los alumnos.',
    primaryKey: 'id (UUID)',
    attributes: [
      { name: 'id', type: 'UUID', nullable: false, constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Identificador único interno' },
      { name: 'codigo', type: 'VARCHAR(20)', nullable: false, constraint: 'UNIQUE', description: 'Código institucional (ej. EST-2024-1082)' },
      { name: 'documento_identidad', type: 'VARCHAR(30)', nullable: false, constraint: 'UNIQUE', description: 'Cédula de ciudadanía o pasaporte' },
      { name: 'nombres', type: 'VARCHAR(100)', nullable: false, description: 'Nombres del estudiante' },
      { name: 'apellidos', type: 'VARCHAR(100)', nullable: false, description: 'Apellidos del estudiante' },
      { name: 'correo_institucional', type: 'VARCHAR(120)', nullable: false, constraint: 'UNIQUE', description: 'Correo institucional @universidad.edu' },
      { name: 'programa_id', type: 'UUID', nullable: false, constraint: 'REFERENCES programas(id)', description: 'Carrera académica' },
      { name: 'semestre_actual', type: 'INTEGER', nullable: false, constraint: 'CHECK (semestre_actual BETWEEN 1 AND 12)', description: 'Nivel semestral' },
      { name: 'estado', type: 'VARCHAR(20)', nullable: false, constraint: "CHECK (estado IN ('ACTIVO', 'EN_RIESGO', 'MATRICULADO', 'EGRESADO', 'RETIRADO'))", description: 'Estado administrativo' },
      { name: 'creditos_aprobados', type: 'INTEGER', nullable: false, constraint: 'DEFAULT 0', description: 'Total de créditos SCT acumulados' },
      { name: 'pga_acumulado', type: 'NUMERIC(3,2)', nullable: false, constraint: 'CHECK (pga_acumulado BETWEEN 0.00 AND 5.00)', description: 'Promedio general acumulado' },
    ],
    relationships: ['1:N con matriculas', '1:N con calificaciones', 'N:1 con programas'],
  },
  {
    name: 'Docente',
    table: 'docentes',
    description: 'Registro de profesores, su categorización y departamento.',
    primaryKey: 'id (UUID)',
    attributes: [
      { name: 'id', type: 'UUID', nullable: false, constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Identificador interno' },
      { name: 'codigo', type: 'VARCHAR(20)', nullable: false, constraint: 'UNIQUE', description: 'Código docente (ej. DOC-1044)' },
      { name: 'documento_identidad', type: 'VARCHAR(30)', nullable: false, constraint: 'UNIQUE', description: 'Cédula' },
      { name: 'nombres', type: 'VARCHAR(100)', nullable: false, description: 'Nombres completos' },
      { name: 'apellidos', type: 'VARCHAR(100)', nullable: false, description: 'Apellidos completos' },
      { name: 'correo_institucional', type: 'VARCHAR(120)', nullable: false, constraint: 'UNIQUE', description: 'Email corporativo' },
      { name: 'departamento', type: 'VARCHAR(100)', nullable: false, description: 'Departamento académico' },
      { name: 'categoria', type: 'VARCHAR(30)', nullable: false, constraint: "CHECK (categoria IN ('TITULAR', 'ASOCIADO', 'ASISTENTE', 'CATEDRA'))", description: 'Escalafón' },
      { name: 'horas_semanales', type: 'INTEGER', nullable: false, constraint: 'CHECK (horas_semanales BETWEEN 1 AND 40)', description: 'Carga horaria tope' },
      { name: 'estado', type: 'VARCHAR(20)', nullable: false, constraint: "DEFAULT 'ACTIVO'", description: 'Estado laboral' },
    ],
    relationships: ['1:N con cursos_ofertados (grupos asignados)'],
  },
  {
    name: 'Asignatura',
    table: 'asignaturas',
    description: 'Catálogo de materias académicas con créditos y contenidos.',
    primaryKey: 'id (UUID)',
    attributes: [
      { name: 'id', type: 'UUID', nullable: false, constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID de la asignatura' },
      { name: 'codigo', type: 'VARCHAR(20)', nullable: false, constraint: 'UNIQUE', description: 'Código mnemónico (ej. SIS-301)' },
      { name: 'nombre', type: 'VARCHAR(150)', nullable: false, description: 'Nombre de la materia' },
      { name: 'creditos', type: 'INTEGER', nullable: false, constraint: 'CHECK (creditos BETWEEN 1 AND 12)', description: 'Créditos académicos' },
      { name: 'semestre_sugerido', type: 'INTEGER', nullable: false, description: 'Semestre de la malla curricular' },
      { name: 'horas_teoricas', type: 'INTEGER', nullable: false, description: 'Horas de teoría semanal' },
      { name: 'horas_practicas', type: 'INTEGER', nullable: false, description: 'Horas de laboratorio/práctica' },
      { name: 'departamento', type: 'VARCHAR(100)', nullable: false, description: 'Área académica responsable' },
    ],
    relationships: ['N:N consigo misma para pre-requisitos (tabla requisitos_asignatura)', '1:N con cursos_ofertados'],
  },
  {
    name: 'Curso Ofertado (Grupo)',
    table: 'cursos_ofertados',
    description: 'Instancia física de una asignatura en un período específico con docente, horario y aula.',
    primaryKey: 'id (UUID)',
    attributes: [
      { name: 'id', type: 'UUID', nullable: false, constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID de la oferta' },
      { name: 'asignatura_id', type: 'UUID', nullable: false, constraint: 'REFERENCES asignaturas(id)', description: 'Asignatura ofertada' },
      { name: 'periodo_academico', type: 'VARCHAR(10)', nullable: false, description: 'Período lectivo (ej. 2026-1)' },
      { name: 'grupo', type: 'VARCHAR(10)', nullable: false, description: 'Identificador del grupo (ej. G-01)' },
      { name: 'docente_id', type: 'UUID', nullable: false, constraint: 'REFERENCES docentes(id)', description: 'Docente titular' },
      { name: 'horario', type: 'VARCHAR(100)', nullable: false, description: 'Días y horas de clase' },
      { name: 'aula', type: 'VARCHAR(50)', nullable: false, description: 'Espacio físico o virtual' },
      { name: 'cupo_maximo', type: 'INTEGER', nullable: false, constraint: 'CHECK (cupo_maximo > 0)', description: 'Capacidad de alumnos' },
      { name: 'cupos_ocupados', type: 'INTEGER', nullable: false, constraint: 'CHECK (cupos_ocupados <= cupo_maximo)', description: 'Inscritos actuales' },
    ],
    relationships: ['N:1 con asignaturas', 'N:1 con docentes', '1:N con detalle_matricula', '1:N con calificaciones'],
  },
  {
    name: 'Matrícula',
    table: 'matriculas',
    description: 'Cabecera de inscripción formal del estudiante en un período académico.',
    primaryKey: 'id (UUID)',
    attributes: [
      { name: 'id', type: 'UUID', nullable: false, constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID de la matrícula' },
      { name: 'codigo_matricula', type: 'VARCHAR(30)', nullable: false, constraint: 'UNIQUE', description: 'Código transaccional' },
      { name: 'estudiante_id', type: 'UUID', nullable: false, constraint: 'REFERENCES estudiantes(id)', description: 'Estudiante matriculado' },
      { name: 'periodo_academico', type: 'VARCHAR(10)', nullable: false, description: 'Período (ej. 2026-1)' },
      { name: 'fecha_registro', type: 'TIMESTAMPTZ', nullable: false, constraint: 'DEFAULT NOW()', description: 'Fecha y hora de registro' },
      { name: 'total_creditos', type: 'INTEGER', nullable: false, constraint: 'CHECK (total_creditos <= 20)', description: 'Suma de créditos' },
      { name: 'estado', type: 'VARCHAR(20)', nullable: false, constraint: "CHECK (estado IN ('CONFIRMADA', 'PENDIENTE', 'CANCELADA'))", description: 'Estado de la matrícula' },
    ],
    relationships: ['N:1 con estudiantes', '1:N con detalle_matricula'],
  },
  {
    name: 'Calificación (Acta de Notas)',
    table: 'calificaciones',
    description: 'Registro evaluativo individual por estudiante en un curso ofertado.',
    primaryKey: 'id (UUID)',
    attributes: [
      { name: 'id', type: 'UUID', nullable: false, constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID de la nota' },
      { name: 'curso_ofertado_id', type: 'UUID', nullable: false, constraint: 'REFERENCES cursos_ofertados(id)', description: 'Curso/Grupo evaluado' },
      { name: 'estudiante_id', type: 'UUID', nullable: false, constraint: 'REFERENCES estudiantes(id)', description: 'Estudiante calificado' },
      { name: 'nota_corte1', type: 'NUMERIC(3,1)', nullable: true, constraint: 'CHECK (nota_corte1 BETWEEN 0.0 AND 5.0)', description: 'Corte 1 (30%)' },
      { name: 'nota_corte2', type: 'NUMERIC(3,1)', nullable: true, constraint: 'CHECK (nota_corte2 BETWEEN 0.0 AND 5.0)', description: 'Corte 2 (30%)' },
      { name: 'nota_examen_final', type: 'NUMERIC(3,1)', nullable: true, constraint: 'CHECK (nota_examen_final BETWEEN 0.0 AND 5.0)', description: 'Examen Final (40%)' },
      { name: 'nota_definitiva', type: 'NUMERIC(3,1)', nullable: true, constraint: 'CHECK (nota_definitiva BETWEEN 0.0 AND 5.0)', description: 'Definitiva calculada' },
      { name: 'aprobado', type: 'BOOLEAN', nullable: true, description: 'Aprobó si nota_definitiva >= 3.0' },
      { name: 'estado', type: 'VARCHAR(25)', nullable: false, constraint: "CHECK (estado IN ('BORRADOR', 'ENVIADO', 'CERRADO_AUDITADO'))", description: 'Estado del acta' },
      { name: 'ultima_modificacion', type: 'TIMESTAMPTZ', nullable: false, constraint: 'DEFAULT NOW()', description: 'Timestamp de auditoría' },
      { name: 'modificado_por', type: 'VARCHAR(100)', nullable: false, description: 'Usuario que realizó la operación' },
    ],
    relationships: ['N:1 con cursos_ofertados', 'N:1 con estudiantes', '1:N con auditoria_calificaciones'],
  },
];

// 10. Riesgos Arquitectónicos
export const ARCHITECTURAL_RISKS: ArchitectureRisk[] = [
  {
    id: 'RSK-01',
    title: 'Condición de Carrera y Sobrecupo en Matrícula Concurrente',
    impact: 'Crítico',
    probability: 'Alta',
    description: 'En el instante de apertura de matrículas, múltiples solicitudes concurrentes leen cupos disponibles > 0 simultáneamente y proceden a insertar la matrícula, excediendo la capacidad física de aulas.',
    mitigationStrategy: 'Implementar aislamiento transaccional con SELECT FOR UPDATE en PostgreSQL y reserva previa atómica en Redis con TTL de 10 minutos para retención temporal del cupo.',
    contingencyPlan: 'Proceso automatizado de reubicación de aulas a espacios con mayor aforo o desdoblamiento inmediato de grupos si la demanda supera el umbral previsto.',
  },
  {
    id: 'RSK-02',
    title: 'Adulteración o Modificación No Autorizada de Calificaciones',
    impact: 'Crítico',
    probability: 'Media',
    description: 'Riesgo de fraude académico donde un usuario con privilegios comprometidos altere notas de períodos pasados o actas ya consolidadas.',
    mitigationStrategy: 'Arquitectura de Base de Datos con tabla inmutable Append-Only de auditoría protegida mediante triggers de PostgreSQL que impiden el DELETE o UPDATE en actas con estado CERRADO_AUDITADO.',
    contingencyPlan: 'Sellado con hash SHA-256 de las actas al momento del cierre oficial y verificación periódica criptográfica de consistencia.',
  },
  {
    id: 'RSK-03',
    title: 'Dependencia Crítica de Sistemas Financieros Externos (ERP)',
    impact: 'Alto',
    probability: 'Alta',
    description: 'Si el ERP financiero institucional sufre caídas durante el día de matrículas, el SGA no podría verificar el paz y salvo financiero del estudiante en tiempo real.',
    mitigationStrategy: 'Patrón Circuit Breaker con caché local sincronizada asíncronamente en batch durante la noche previa con los estados de habilitación financiera.',
    contingencyPlan: 'Modo contingencia "Matrícula Condicionada": permite al estudiante seleccionar sus materias y reserva el cupo por 48 horas mientras el servicio financiero se restablece.',
  },
  {
    id: 'RSK-04',
    title: 'Degradación de Rendimiento por Reportes Pesados (Sábanas de Notas)',
    impact: 'Medio',
    probability: 'Alta',
    description: 'Consultas analíticas pesadas que agregan millones de registros para generar sábanas generales bloquean tablas transaccionales de la base de datos primaria.',
    mitigationStrategy: 'Separación CQRS (Command Query Responsibility Segregation) utilizando réplicas de lectura (Read Replicas) de PostgreSQL y vistas materializadas refrescadas periódicamente.',
    contingencyPlan: 'Generación asíncrona de reportes mediante colas de background jobs con descarga vía enlace temporal pre-firmado.',
  },
];

// 11. Atributos de Calidad (Escenarios ISO/IEC 25010)
export const QUALITY_ATTRIBUTES = [
  {
    attribute: 'Rendimiento (Performance Efficiency)',
    scenario: 'Bajo el inicio simultáneo de matrícula de 3,500 estudiantes de último año, el 95% de las transacciones de reserva de asignaturas debe completarse en menos de 800 milisegundos sin errores de conexión.',
    metric: 'Percentil p95 < 800ms, tasa de error HTTP 5xx < 0.01%.',
    tactic: 'Caché distribuida Redis para la oferta de cursos, pool de conexiones PgBouncer y consultas indexadas por periodo_academico y codigo.',
  },
  {
    attribute: 'Integridad y Consistencia de Datos (Data Integrity)',
    scenario: 'Si el servidor web o el cliente experimenta una desconexión abrupta a mitad del proceso de confirmación de matrícula, el sistema no debe dejar cupos fantasma ni matrículas a medio persistir.',
    metric: '100% de consistencia ACID en la base de datos relacional.',
    tactic: 'Transacciones atómicas delimitadas por bloques BEGIN / COMMIT / ROLLBACK estrictos.',
  },
  {
    attribute: 'Seguridad (Security & Non-repudiation)',
    scenario: 'Un docente intenta modificar una calificación después de la fecha de cierre de actas sin la aprobación formal del Consejo de Facultad.',
    metric: '0 modificaciones permitidas sin token de autorización de decanatura y registro del intento en el log de auditoría.',
    tactic: 'Reglas de negocio reforzadas en la capa de dominio y a nivel de triggers de base de datos que abortan la escritura.',
  },
  {
    attribute: 'Escalabilidad (Scalability)',
    scenario: 'El tráfico institucional pasa de 150 usuarios concurrentes en semana regular a 6,000 en el primer día del calendario de matrículas.',
    metric: 'Autoescalado horizontal automático en menos de 90 segundos sin degradación del SLA de disponibilidad (99.9%).',
    tactic: 'Despliegue stateless en Kubernetes con escalado HPA basado en métricas de peticiones por segundo en el Ingress Controller.',
  },
  {
    attribute: 'Auditabilidad y Trazabilidad (Auditability)',
    scenario: 'Se requiere auditar el origen, la fecha exacta y la dirección IP desde donde se efectuó un cambio de calificación en un litigio estudiantil.',
    metric: 'Historial inalterable accesible por el Registrador en menos de 5 segundos con el registro completo de eventos.',
    tactic: 'Patrón Event Sourcing / Change Data Capture (CDC) en tabla particionada de auditoría académica.',
  },
];

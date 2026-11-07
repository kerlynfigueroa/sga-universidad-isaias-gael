/**
 * @file storage.js
 * Módulo de persistencia en LocalStorage para la UNIVERSIDAD ISAÍAS GAEL (SGA)
 * Simulación de base de datos relacional con integridad, semillas iniciales y gestión de tutorías.
 */

const STORAGE_KEYS = {
  USERS: 'sga_users',
  STUDENTS: 'sga_students',
  TEACHERS: 'sga_teachers',
  COURSES: 'sga_courses',
  OFFERINGS: 'sga_offerings',
  ENROLLMENTS: 'sga_enrollments',
  GRADES: 'sga_grades',
  TUTORIAS: 'sga_tutorias',
  CURRENT_USER: 'sga_current_user',
};

// Datos semilla oficiales de la UNIVERSIDAD ISAÍAS GAEL
const SEED_USERS = [
  {
    id: 'usr-admin',
    name: 'Ing. Administrador de Registro',
    email: 'admin@isaiasgael.edu',
    password: 'admin123',
    role: 'ADMIN',
    avatar: 'IG',
  },
  {
    id: 'usr-docente',
    name: 'Dr. Roberto Guzmán Echeverri',
    email: 'docente@isaiasgael.edu',
    password: 'docente123',
    role: 'DOCENTE',
    teacherId: 'doc-001',
    avatar: 'RG',
  },
  {
    id: 'usr-estudiante',
    name: 'Alejandro Morales Vargas',
    email: 'estudiante@isaiasgael.edu',
    password: 'estudiante123',
    role: 'ESTUDIANTE',
    studentId: 'est-001',
    avatar: 'AM',
  },
];

const SEED_STUDENTS = [
  {
    id: 'est-001',
    code: 'EST-2024-1082',
    documentId: '1098234567',
    firstName: 'Alejandro',
    lastName: 'Morales Vargas',
    email: 'alejandro.morales@isaiasgael.edu',
    phone: '+57 310 452 8891',
    program: 'Ingeniería de Sistemas y Computación',
    faculty: 'Facultad de Ingeniería',
    currentSemester: 5,
    status: 'ACTIVO',
    creditsEarned: 84,
    cumulativeGpa: 4.45,
    admissionDate: '2024-02-01',
  },
  {
    id: 'est-002',
    code: 'EST-2024-1090',
    documentId: '1085443219',
    firstName: 'Valentina',
    lastName: 'Ríos Cárdenas',
    email: 'valentina.rios@isaiasgael.edu',
    phone: '+57 312 901 3344',
    program: 'Ingeniería de Sistemas y Computación',
    faculty: 'Facultad de Ingeniería',
    currentSemester: 5,
    status: 'ACTIVO',
    creditsEarned: 88,
    cumulativeGpa: 4.72,
    admissionDate: '2024-02-01',
  },
  {
    id: 'est-003',
    code: 'EST-2023-0854',
    documentId: '1076554321',
    firstName: 'Camilo Andrés',
    lastName: 'Herrera Gómez',
    email: 'camilo.herrera@isaiasgael.edu',
    phone: '+57 320 675 1122',
    program: 'Ingeniería de Sistemas y Computación',
    faculty: 'Facultad de Ingeniería',
    currentSemester: 6,
    status: 'EN_RIESGO',
    creditsEarned: 76,
    cumulativeGpa: 2.85,
    admissionDate: '2023-08-01',
  },
  {
    id: 'est-004',
    code: 'EST-2025-0142',
    documentId: '1099887766',
    firstName: 'Mariana',
    lastName: 'Zapata Montoya',
    email: 'mariana.zapata@isaiasgael.edu',
    phone: '+57 315 223 9900',
    program: 'Ingeniería de Sistemas y Computación',
    faculty: 'Facultad de Ingeniería',
    currentSemester: 3,
    status: 'ACTIVO',
    creditsEarned: 48,
    cumulativeGpa: 4.15,
    admissionDate: '2025-02-01',
  },
  {
    id: 'est-005',
    code: 'EST-2022-0430',
    documentId: '1067223344',
    firstName: 'Sebastián',
    lastName: 'Peña Delgado',
    email: 'sebastian.pena@isaiasgael.edu',
    phone: '+57 317 889 0012',
    program: 'Ingeniería de Sistemas y Computación',
    faculty: 'Facultad de Ingeniería',
    currentSemester: 8,
    status: 'MATRICULADO',
    creditsEarned: 132,
    cumulativeGpa: 4.3,
    admissionDate: '2022-08-01',
  },
  {
    id: 'est-006',
    code: 'EST-2024-1105',
    documentId: '1094332211',
    firstName: 'Daniela Sofía',
    lastName: 'Mendoza Castro',
    email: 'daniela.mendoza@isaiasgael.edu',
    phone: '+57 311 556 7788',
    program: 'Administración de Empresas',
    faculty: 'Facultad de Ciencias Económicas',
    currentSemester: 4,
    status: 'ACTIVO',
    creditsEarned: 64,
    cumulativeGpa: 4.6,
    admissionDate: '2024-02-01',
  },
];

// Estructura Académica Oficial - UNIVERSIDAD ISAÍAS GAEL
export const ACADEMIC_FACULTIES = [
  {
    id: 'ingenieria',
    name: 'Facultad de Ingeniería y Tecnologías',
    programs: [
      'Ingeniería de Sistemas y Computación',
      'Ingeniería de Software y Cloud Computing',
      'Ingeniería de Ciberseguridad',
      'Ingeniería Electrónica y Telecomunicaciones',
    ],
  },
  {
    id: 'economicas',
    name: 'Facultad de Ciencias Económicas y Administrativas',
    programs: [
      'Administración de Empresas',
      'Contaduría Pública e Inteligencia Financiera',
      'Negocios Internacionales',
      'Economía y Analítica de Datos',
    ],
  },
  {
    id: 'salud_basicas',
    name: 'Facultad de Ciencias Básicas y de la Salud',
    programs: [
      'Matemáticas Aplicadas y Ciencias de Datos',
      'Física Médica y Bioingeniería',
      'Enfermería y Cuidados Críticos',
      'Medicina General y Salud Pública',
    ],
  },
  {
    id: 'juridicas_humanas',
    name: 'Facultad de Ciencias Jurídicas, Humanas y Sociales',
    programs: [
      'Derecho y Regulación Digital',
      'Psicología Organizacional y Clínica',
      'Comunicación Social y Medios Digitales',
    ],
  },
];

export const CONTRACT_TYPES = [
  'Tiempo Completo',
  'Medio Tiempo',
  'Catedrático',
  'Ocasional',
  'Coordinador Académico',
];

export const ACADEMIC_LEVELS = [
  'Pregrado / Profesional',
  'Especialización',
  'Maestría',
  'Doctorado (Ph.D.)',
  'Postdoctorado',
];

export const TEACHER_STATUSES = ['Activo', 'En Comisión', 'Sabático', 'Inactivo'];

const SEED_TEACHERS = [
  {
    id: 'doc-001',
    code: 'DOC-1044',
    documentId: '79845120',
    fullName: 'Dr. Roberto Guzmán Echeverri',
    firstName: 'Roberto',
    lastName: 'Guzmán Echeverri',
    email: 'roberto.guzman@isaiasgael.edu',
    phone: '+57 (601) 745-9000 ext. 204',
    faculty: 'Facultad de Ingeniería y Tecnologías',
    program: 'Ingeniería de Sistemas y Computación',
    department: 'Ingeniería de Software',
    contractType: 'Tiempo Completo',
    category: 'Tiempo Completo',
    professionalTitle: 'Ingeniero de Sistemas y Computación',
    academicLevel: 'Doctorado (Ph.D.)',
    specialization: 'Arquitectura de Software y Sistemas Distribuidos',
    weeklyHours: 40,
    status: 'Activo',
    office: 'Edificio de Ingeniería · Despacho 402',
    admissionDate: '2020-01-15',
  },
  {
    id: 'doc-002',
    code: 'DOC-1052',
    documentId: '52431980',
    fullName: 'Dra. Claudia Salazar Restrepo',
    firstName: 'Claudia',
    lastName: 'Salazar Restrepo',
    email: 'claudia.salazar@isaiasgael.edu',
    phone: '+57 (601) 745-9000 ext. 208',
    faculty: 'Facultad de Ingeniería y Tecnologías',
    program: 'Ingeniería de Software y Cloud Computing',
    department: 'Ciencias de la Computación',
    contractType: 'Tiempo Completo',
    category: 'Tiempo Completo',
    professionalTitle: 'Ingeniera de Software y Magíster en TI',
    academicLevel: 'Doctorado (Ph.D.)',
    specialization: 'Bases de Datos Relacionales y Big Data',
    weeklyHours: 40,
    status: 'Activo',
    office: 'Edificio de Ingeniería · Despacho 406',
    admissionDate: '2021-07-20',
  },
  {
    id: 'doc-003',
    code: 'DOC-1060',
    documentId: '80123456',
    fullName: 'Mag. Carlos Benavides Ochoa',
    firstName: 'Carlos',
    lastName: 'Benavides Ochoa',
    email: 'carlos.benavides@isaiasgael.edu',
    phone: '+57 320 889 1234',
    faculty: 'Facultad de Ingeniería y Tecnologías',
    program: 'Ingeniería de Ciberseguridad',
    department: 'Redes y Telecomunicaciones',
    contractType: 'Medio Tiempo',
    category: 'Medio Tiempo',
    professionalTitle: 'Ingeniero Electrónico y Especialista en Ciberdefensa',
    academicLevel: 'Maestría',
    specialization: 'Seguridad Informática, Criptografía y DevOps',
    weeklyHours: 20,
    status: 'Activo',
    office: 'Laboratorio de Redes · Puesto 12',
    admissionDate: '2022-02-01',
  },
  {
    id: 'doc-004',
    code: 'DOC-1077',
    documentId: '43990112',
    fullName: 'Dra. María Elena Duque Roldán',
    firstName: 'María Elena',
    lastName: 'Duque Roldán',
    email: 'maria.duque@isaiasgael.edu',
    phone: '+57 311 445 6789',
    faculty: 'Facultad de Ciencias Básicas y de la Salud',
    program: 'Matemáticas Aplicadas y Ciencias de Datos',
    department: 'Matemáticas Aplicadas',
    contractType: 'Coordinador Académico',
    category: 'Coordinador Académico',
    professionalTitle: 'Licenciada en Matemáticas y Física',
    academicLevel: 'Postdoctorado',
    specialization: 'Modelamiento Matemático y Métodos Numéricos',
    weeklyHours: 40,
    status: 'Activo',
    office: 'Coordinación Ciencias Básicas · Of. 201',
    admissionDate: '2019-08-10',
  },
  {
    id: 'doc-005',
    code: 'DOC-1085',
    documentId: '1020439812',
    fullName: 'Mag. Fernando Javier Ortiz Silva',
    firstName: 'Fernando Javier',
    lastName: 'Ortiz Silva',
    email: 'fernando.ortiz@isaiasgael.edu',
    phone: '+57 316 554 9901',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    program: 'Administración de Empresas',
    department: 'Gestión Empresarial',
    contractType: 'Catedrático',
    category: 'Catedrático',
    professionalTitle: 'Administrador de Empresas y Consultor Organizacional',
    academicLevel: 'Maestría',
    specialization: 'Estrategia Corporativa y Emprendimiento Tecnológico',
    weeklyHours: 16,
    status: 'Activo',
    office: 'Edificio de Ciencias Económicas · Sala Docentes 3',
    admissionDate: '2023-01-20',
  },
  {
    id: 'doc-006',
    code: 'DOC-1093',
    documentId: '51984210',
    fullName: 'Esp. Marcela Quintana Pineda',
    firstName: 'Marcela',
    lastName: 'Quintana Pineda',
    email: 'marcela.quintana@isaiasgael.edu',
    phone: '+57 318 776 2345',
    faculty: 'Facultad de Ciencias Jurídicas, Humanas y Sociales',
    program: 'Derecho y Regulación Digital',
    department: 'Ciencias Jurídicas',
    contractType: 'Ocasional',
    category: 'Ocasional',
    professionalTitle: 'Abogada con Énfasis en Derecho Digital',
    academicLevel: 'Especialización',
    specialization: 'Protección de Datos Personales, IA y Habeas Data',
    weeklyHours: 20,
    status: 'Activo',
    office: 'Consultorio Jurídico · Despacho 105',
    admissionDate: '2024-02-01',
  },
  {
    id: 'doc-007',
    code: 'DOC-1102',
    documentId: '71345998',
    fullName: 'Dr. Hernán Darío Velásquez López',
    firstName: 'Hernán Darío',
    lastName: 'Velásquez López',
    email: 'hernan.velasquez@isaiasgael.edu',
    phone: '+57 (601) 745-9000 ext. 312',
    faculty: 'Facultad de Ingeniería y Tecnologías',
    program: 'Ingeniería Electrónica y Telecomunicaciones',
    department: 'Telecomunicaciones y Hardware',
    contractType: 'Coordinador Académico',
    category: 'Coordinador Académico',
    professionalTitle: 'Ingeniero Electrónico y de Telecomunicaciones',
    academicLevel: 'Doctorado (Ph.D.)',
    specialization: 'Internet de las Cosas (IoT) y Redes Inalámbricas 5G/6G',
    weeklyHours: 40,
    status: 'Activo',
    office: 'Coordinación Telecomunicaciones · Of. 301',
    admissionDate: '2018-09-01',
  },
  {
    id: 'doc-008',
    code: 'DOC-1110',
    documentId: '63548902',
    fullName: 'Mag. Sandra Milena Caicedo Barreto',
    firstName: 'Sandra Milena',
    lastName: 'Caicedo Barreto',
    email: 'sandra.caicedo@isaiasgael.edu',
    phone: '+57 315 998 4411',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    program: 'Contaduría Pública e Inteligencia Financiera',
    department: 'Contabilidad y Finanzas',
    contractType: 'Catedrático',
    category: 'Catedrático',
    professionalTitle: 'Contadora Pública y Auditora de Sistemas',
    academicLevel: 'Maestría',
    specialization: 'Auditoría Forense Digital y Normas NIIF',
    weeklyHours: 12,
    status: 'Activo',
    office: 'Edificio de Ciencias Económicas · Sala Docentes 2',
    admissionDate: '2023-08-01',
  },
];

const SEED_COURSES = [
  {
    id: 'crs-001',
    code: 'SIS-301',
    name: 'Arquitectura y Diseño de Software',
    credits: 4,
    semester: 5,
    department: 'Ingeniería de Software',
    faculty: 'Facultad de Ingeniería y Tecnologías',
    program: 'Ingeniería de Sistemas y Computación',
    prerequisites: ['SIS-201'],
    hoursTheory: 3,
    hoursPractice: 2,
    description: 'Patrones arquitectónicos, DDD, microservicios, C4 model y atributos de calidad ISO 25010.',
  },
  {
    id: 'crs-002',
    code: 'SIS-302',
    name: 'Bases de Datos Avanzadas y Transacciones',
    credits: 4,
    semester: 5,
    department: 'Ciencias de la Computación',
    faculty: 'Facultad de Ingeniería y Tecnologías',
    program: 'Ingeniería de Software y Cloud Computing',
    prerequisites: ['SIS-202'],
    hoursTheory: 3,
    hoursPractice: 2,
    description: 'Motores relacionales PostgreSQL, propiedades ACID, niveles de aislamiento e índices B-Tree.',
  },
  {
    id: 'crs-003',
    code: 'SIS-303',
    name: 'Seguridad Informática y Criptografía',
    credits: 3,
    semester: 5,
    department: 'Redes y Telecomunicaciones',
    faculty: 'Facultad de Ingeniería y Tecnologías',
    program: 'Ingeniería de Ciberseguridad',
    prerequisites: ['SIS-203'],
    hoursTheory: 2,
    hoursPractice: 2,
    description: 'Protocolos seguros TLS 1.3, autenticación OIDC/OAuth2, OWASP Top 10 y gestión de riesgos.',
  },
  {
    id: 'crs-004',
    code: 'SIS-401',
    name: 'Ingeniería de Requisitos y Gestión de Proyectos',
    credits: 3,
    semester: 6,
    department: 'Ingeniería de Software',
    faculty: 'Facultad de Ingeniería y Tecnologías',
    program: 'Ingeniería de Sistemas y Computación',
    prerequisites: ['SIS-301'],
    hoursTheory: 3,
    hoursPractice: 1,
    description: 'Especificación IEEE 830, metodologías ágiles Scrum/Kanban y casos de uso.',
  },
  {
    id: 'crs-005',
    code: 'MAT-301',
    name: 'Probabilidad y Estadística para Computación',
    credits: 3,
    semester: 4,
    department: 'Matemáticas Aplicadas',
    faculty: 'Facultad de Ciencias Básicas y de la Salud',
    program: 'Matemáticas Aplicadas y Ciencias de Datos',
    prerequisites: ['MAT-201'],
    hoursTheory: 3,
    hoursPractice: 1,
    description: 'Variables aleatorias, distribuciones continuas, inferencia bayesiana y análisis de datos.',
  },
  {
    id: 'crs-006',
    code: 'SIS-201',
    name: 'Programación Orientada a Objetos',
    credits: 4,
    semester: 3,
    department: 'Ingeniería de Software',
    faculty: 'Facultad de Ingeniería y Tecnologías',
    program: 'Ingeniería de Sistemas y Computación',
    prerequisites: [],
    hoursTheory: 3,
    hoursPractice: 2,
    description: 'Principios SOLID, polimorfismo, manejo de excepciones y patrones de diseño.',
  },
  {
    id: 'crs-007',
    code: 'ADM-201',
    name: 'Gestión Estratégica y Emprendimiento Digital',
    credits: 3,
    semester: 4,
    department: 'Gestión Empresarial',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    program: 'Administración de Empresas',
    prerequisites: [],
    hoursTheory: 3,
    hoursPractice: 1,
    description: 'Modelos Canvas, planeación prospectiva, OKRs y creación de valor en modelos digitales.',
  },
  {
    id: 'crs-008',
    code: 'JUR-105',
    name: 'Derecho Informático y Privacidad de Datos',
    credits: 3,
    semester: 3,
    department: 'Ciencias Jurídicas',
    faculty: 'Facultad de Ciencias Jurídicas, Humanas y Sociales',
    program: 'Derecho y Regulación Digital',
    prerequisites: [],
    hoursTheory: 3,
    hoursPractice: 1,
    description: 'Marco legal de protección de datos, ciberdelitos, contratos electrónicos y regulación de IA.',
  },
  {
    id: 'crs-009',
    code: 'TEL-301',
    name: 'Comunicaciones Móviles e Internet de las Cosas',
    credits: 4,
    semester: 6,
    department: 'Telecomunicaciones y Hardware',
    faculty: 'Facultad de Ingeniería y Tecnologías',
    program: 'Ingeniería Electrónica y Telecomunicaciones',
    prerequisites: ['SIS-303'],
    hoursTheory: 3,
    hoursPractice: 2,
    description: 'Protocolos MQTT, CoAP, redes 5G/6G, sensores embebidos y computación en el borde (Edge).',
  },
  {
    id: 'crs-010',
    code: 'CON-304',
    name: 'Inteligencia Financiera y Auditoría Forense',
    credits: 3,
    semester: 5,
    department: 'Contabilidad y Finanzas',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    program: 'Contaduría Pública e Inteligencia Financiera',
    prerequisites: [],
    hoursTheory: 2,
    hoursPractice: 2,
    description: 'Analítica financiera con Python, auditoría de transacciones blockchain y normas NIIF.',
  },
];

const SEED_OFFERINGS = [
  {
    id: 'off-001',
    courseCode: 'SIS-301',
    courseName: 'Arquitectura y Diseño de Software',
    credits: 4,
    group: 'G-01',
    teacherId: 'doc-001',
    teacherName: 'Dr. Roberto Guzmán Echeverri',
    classroom: 'Laboratorio de Software 402 - Campus Isaías Gael',
    schedule: 'Lun/Mie 08:00 - 10:00',
    capacity: 30,
    enrolledCount: 28,
    term: '2026-1',
  },
  {
    id: 'off-002',
    courseCode: 'SIS-301',
    courseName: 'Arquitectura y Diseño de Software',
    credits: 4,
    group: 'G-02',
    teacherId: 'doc-001',
    teacherName: 'Dr. Roberto Guzmán Echeverri',
    classroom: 'Aula 304 - Edificio Central',
    schedule: 'Mar/Jue 14:00 - 16:00',
    capacity: 30,
    enrolledCount: 22,
    term: '2026-1',
  },
  {
    id: 'off-003',
    courseCode: 'SIS-302',
    courseName: 'Bases de Datos Avanzadas y Transacciones',
    credits: 4,
    group: 'G-01',
    teacherId: 'doc-002',
    teacherName: 'Dra. Claudia Salazar Restrepo',
    classroom: 'Laboratorio de Servidores 201',
    schedule: 'Mar/Jue 10:00 - 12:00',
    capacity: 28,
    enrolledCount: 27,
    term: '2026-1',
  },
  {
    id: 'off-004',
    courseCode: 'SIS-303',
    courseName: 'Seguridad Informática y Criptografía',
    credits: 3,
    group: 'G-01',
    teacherId: 'doc-003',
    teacherName: 'Mag. Carlos Benavides Ochoa',
    classroom: 'Laboratorio de Redes 105',
    schedule: 'Viernes 08:00 - 12:00',
    capacity: 25,
    enrolledCount: 24,
    term: '2026-1',
  },
  {
    id: 'off-005',
    courseCode: 'MAT-301',
    courseName: 'Probabilidad y Estadística para Computación',
    credits: 3,
    group: 'G-01',
    teacherId: 'doc-004',
    teacherName: 'Dra. María Elena Duque Roldán',
    classroom: 'Auditorio de Ciencias 102',
    schedule: 'Lun/Mie 10:00 - 12:00',
    capacity: 35,
    enrolledCount: 31,
    term: '2026-1',
  },
  {
    id: 'off-006',
    courseCode: 'ADM-201',
    courseName: 'Gestión Estratégica y Emprendimiento Digital',
    credits: 3,
    group: 'G-01',
    teacherId: 'doc-005',
    teacherName: 'Mag. Fernando Javier Ortiz Silva',
    classroom: 'Aula 204 - Ciencias Económicas',
    schedule: 'Mar/Jue 08:00 - 10:00',
    capacity: 30,
    enrolledCount: 26,
    term: '2026-1',
  },
  {
    id: 'off-007',
    courseCode: 'JUR-105',
    courseName: 'Derecho Informático y Privacidad de Datos',
    credits: 3,
    group: 'G-01',
    teacherId: 'doc-006',
    teacherName: 'Esp. Marcela Quintana Pineda',
    classroom: 'Sala de Juicios Orales 101',
    schedule: 'Viernes 14:00 - 18:00',
    capacity: 25,
    enrolledCount: 21,
    term: '2026-1',
  },
  {
    id: 'off-008',
    courseCode: 'TEL-301',
    courseName: 'Comunicaciones Móviles e Internet de las Cosas',
    credits: 4,
    group: 'G-01',
    teacherId: 'doc-007',
    teacherName: 'Dr. Hernán Darío Velásquez López',
    classroom: 'Laboratorio de Telecomunicaciones 302',
    schedule: 'Lun/Mie 16:00 - 18:00',
    capacity: 28,
    enrolledCount: 25,
    term: '2026-1',
  },
  {
    id: 'off-009',
    courseCode: 'CON-304',
    courseName: 'Inteligencia Financiera y Auditoría Forense',
    credits: 3,
    group: 'G-01',
    teacherId: 'doc-008',
    teacherName: 'Mag. Sandra Milena Caicedo Barreto',
    classroom: 'Laboratorio Financiero Bloomberg',
    schedule: 'Sábados 08:00 - 12:00',
    capacity: 30,
    enrolledCount: 29,
    term: '2026-1',
  },
];

const SEED_ENROLLMENTS = [
  {
    id: 'mat-001',
    code: 'MAT-2026-1-0182',
    studentId: 'est-001',
    studentName: 'Alejandro Morales Vargas',
    studentCode: 'EST-2024-1082',
    term: '2026-1',
    date: '2026-01-22 09:14:32',
    totalCredits: 14,
    status: 'CONFIRMADA',
    items: [
      {
        offeringId: 'off-001',
        courseCode: 'SIS-301',
        courseName: 'Arquitectura y Diseño de Software',
        credits: 4,
        group: 'G-01',
        schedule: 'Lun/Mie 08:00 - 10:00',
        teacherName: 'Dr. Roberto Guzmán Echeverri',
      },
      {
        offeringId: 'off-003',
        courseCode: 'SIS-302',
        courseName: 'Bases de Datos Avanzadas y Transacciones',
        credits: 4,
        group: 'G-01',
        schedule: 'Mar/Jue 10:00 - 12:00',
        teacherName: 'Dra. Claudia Salazar Restrepo',
      },
      {
        offeringId: 'off-004',
        courseCode: 'SIS-303',
        courseName: 'Seguridad Informática y Criptografía',
        credits: 3,
        group: 'G-01',
        schedule: 'Viernes 08:00 - 12:00',
        teacherName: 'Mag. Carlos Benavides Ochoa',
      },
      {
        offeringId: 'off-005',
        courseCode: 'MAT-301',
        courseName: 'Probabilidad y Estadística para Computación',
        credits: 3,
        group: 'G-01',
        schedule: 'Lun/Mie 10:00 - 12:00',
        teacherName: 'Dra. María Elena Duque Roldán',
      },
    ],
  },
  {
    id: 'mat-002',
    code: 'MAT-2026-1-0190',
    studentId: 'est-002',
    studentName: 'Valentina Ríos Cárdenas',
    studentCode: 'EST-2024-1090',
    term: '2026-1',
    date: '2026-01-22 09:18:04',
    totalCredits: 14,
    status: 'CONFIRMADA',
    items: [
      {
        offeringId: 'off-001',
        courseCode: 'SIS-301',
        courseName: 'Arquitectura y Diseño de Software',
        credits: 4,
        group: 'G-01',
        schedule: 'Lun/Mie 08:00 - 10:00',
        teacherName: 'Dr. Roberto Guzmán Echeverri',
      },
      {
        offeringId: 'off-003',
        courseCode: 'SIS-302',
        courseName: 'Bases de Datos Avanzadas y Transacciones',
        credits: 4,
        group: 'G-01',
        schedule: 'Mar/Jue 10:00 - 12:00',
        teacherName: 'Dra. Claudia Salazar Restrepo',
      },
    ],
  },
];

const SEED_GRADES = [
  {
    id: 'grd-001',
    offeringId: 'off-001',
    studentId: 'est-001',
    studentCode: 'EST-2024-1082',
    studentName: 'Alejandro Morales Vargas',
    grade1: 4.5,
    grade2: 4.8,
    grade3: 4.6,
    finalGrade: 4.6,
    approved: true,
    status: 'CERRADO_AUDITADO',
    lastUpdated: '2026-11-05 14:32',
    updatedBy: 'Dr. Roberto Guzmán Echeverri',
  },
  {
    id: 'grd-002',
    offeringId: 'off-001',
    studentId: 'est-002',
    studentCode: 'EST-2024-1090',
    studentName: 'Valentina Ríos Cárdenas',
    grade1: 4.9,
    grade2: 4.8,
    grade3: 5.0,
    finalGrade: 4.9,
    approved: true,
    status: 'CERRADO_AUDITADO',
    lastUpdated: '2026-11-05 14:32',
    updatedBy: 'Dr. Roberto Guzmán Echeverri',
  },
  {
    id: 'grd-003',
    offeringId: 'off-001',
    studentId: 'est-003',
    studentCode: 'EST-2023-0854',
    studentName: 'Camilo Andrés Herrera Gómez',
    grade1: 2.8,
    grade2: 2.5,
    grade3: 3.1,
    finalGrade: 2.8,
    approved: false,
    status: 'BORRADOR',
    lastUpdated: '2026-11-06 09:15',
    updatedBy: 'Dr. Roberto Guzmán Echeverri',
  },
  {
    id: 'grd-004',
    offeringId: 'off-001',
    studentId: 'est-004',
    studentCode: 'EST-2025-0142',
    studentName: 'Mariana Zapata Montoya',
    grade1: 4.2,
    grade2: 4.0,
    grade3: 4.4,
    finalGrade: 4.2,
    approved: true,
    status: 'BORRADOR',
    lastUpdated: '2026-11-07 08:10',
    updatedBy: 'Dr. Roberto Guzmán Echeverri',
  },
  {
    id: 'grd-005',
    offeringId: 'off-001',
    studentId: 'est-005',
    studentCode: 'EST-2022-0430',
    studentName: 'Sebastián Peña Delgado',
    grade1: 4.0,
    grade2: 4.3,
    grade3: 4.1,
    finalGrade: 4.1,
    approved: true,
    status: 'BORRADOR',
    lastUpdated: '2026-11-07 08:10',
    updatedBy: 'Dr. Roberto Guzmán Echeverri',
  },
];

const SEED_TUTORIAS = [
  {
    id: 'tut-001',
    studentId: 'est-003',
    studentCode: 'EST-2023-0854',
    studentName: 'Camilo Andrés Herrera Gómez',
    teacherId: 'doc-001',
    teacherName: 'Dr. Roberto Guzmán Echeverri',
    courseCode: 'SIS-301',
    courseName: 'Arquitectura y Diseño de Software',
    topic: 'Refuerzo en Modelado Arquitectónico y Patrones GoF',
    dateScheduled: '2026-11-12 14:00',
    status: 'PROGRAMADA',
    notes: 'Estudiante con riesgo académico (PGA 2.85). Se orientará en preparación para examen extraordinario.',
    createdAt: '2026-11-07 09:30',
  },
  {
    id: 'tut-002',
    studentId: 'est-001',
    studentCode: 'EST-2024-1082',
    studentName: 'Alejandro Morales Vargas',
    teacherId: 'doc-002',
    teacherName: 'Dra. Claudia Salazar Restrepo',
    courseCode: 'SIS-302',
    courseName: 'Bases de Datos Avanzadas y Transacciones',
    topic: 'Optimización de Consultas SQL y Particionamiento en PostgreSQL',
    dateScheduled: '2026-11-14 10:00',
    status: 'PROGRAMADA',
    notes: 'Profundización en índices B-Tree y planes de ejecución EXPLAIN ANALYZE.',
    createdAt: '2026-11-07 10:00',
  },
  {
    id: 'tut-003',
    studentId: 'est-002',
    studentCode: 'EST-2024-1090',
    studentName: 'Valentina Ríos Cárdenas',
    teacherId: 'doc-003',
    teacherName: 'Mag. Carlos Benavides Ochoa',
    courseCode: 'SIS-303',
    courseName: 'Seguridad Informática y Criptografía',
    topic: 'Configuración de PKI y Certificados TLS 1.3 Mutuos',
    dateScheduled: '2026-11-15 15:00',
    status: 'EN_CURSO',
    notes: 'Asesoría para proyecto semestral de cifrado end-to-end con certificados X.509.',
    createdAt: '2026-11-07 10:15',
  },
  {
    id: 'tut-004',
    studentId: 'est-003',
    studentCode: 'EST-2023-0854',
    studentName: 'Camilo Andrés Herrera Gómez',
    teacherId: 'doc-004',
    teacherName: 'Dra. María Elena Duque Roldán',
    courseCode: 'MAT-301',
    courseName: 'Probabilidad y Estadística para Computación',
    topic: 'Distribuciones Continuas e Inferencia Bayesiana',
    dateScheduled: '2026-11-16 11:00',
    status: 'PROGRAMADA',
    notes: 'Nivelación previa al segundo corte de evaluación.',
    createdAt: '2026-11-07 11:00',
  },
  {
    id: 'tut-005',
    studentId: 'est-006',
    studentCode: 'EST-2024-1105',
    studentName: 'Daniela Sofía Mendoza Castro',
    teacherId: 'doc-005',
    teacherName: 'Mag. Fernando Javier Ortiz Silva',
    courseCode: 'ADM-201',
    courseName: 'Gestión Estratégica y Emprendimiento Digital',
    topic: 'Validación de Modelo Canvas y Finanzas de Startups',
    dateScheduled: '2026-11-18 09:00',
    status: 'PROGRAMADA',
    notes: 'Tutoría de plan de negocio y formulación de pitch ante inversionistas.',
    createdAt: '2026-11-07 11:30',
  },
  {
    id: 'tut-006',
    studentId: 'est-005',
    studentCode: 'EST-2022-0430',
    studentName: 'Sebastián Peña Delgado',
    teacherId: 'doc-007',
    teacherName: 'Dr. Hernán Darío Velásquez López',
    courseCode: 'TEL-301',
    courseName: 'Comunicaciones Móviles e Internet de las Cosas',
    topic: 'Diseño de Red de Sensores con Protocolo MQTT y LoRaWAN',
    dateScheduled: '2026-11-19 14:00',
    status: 'PROGRAMADA',
    notes: 'Orientación para trabajo de grado en Internet de las Cosas.',
    createdAt: '2026-11-07 11:45',
  },
];

export const Storage = {
  /** Inicializa los datos en LocalStorage si no existen o migra esquemas anteriores */
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(SEED_COURSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFERINGS)) {
      localStorage.setItem(STORAGE_KEYS.OFFERINGS, JSON.stringify(SEED_OFFERINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ENROLLMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(SEED_ENROLLMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GRADES)) {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(SEED_GRADES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TUTORIAS)) {
      localStorage.setItem(STORAGE_KEYS.TUTORIAS, JSON.stringify(SEED_TUTORIAS));
    }

    // Inicialización y Migración inteligente de Docentes a la nueva estructura oficial
    const storedTeachersRaw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!storedTeachersRaw) {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(SEED_TEACHERS));
    } else {
      try {
        const currentList = JSON.parse(storedTeachersRaw);
        let updated = false;

        // Validar si requiere migración de categorías o campos nuevos
        const migratedList = currentList.map((t) => {
          const isOldCategory = ['TITULAR', 'ASOCIADO', 'ASISTENTE', 'CATEDRA'].includes(t.category);
          if (!t.contractType || isOldCategory || !t.phone || !t.faculty || !t.program || !t.professionalTitle || !t.academicLevel) {
            updated = true;
            let contractType = t.contractType;
            if (!contractType || isOldCategory) {
              if (t.category === 'TITULAR') contractType = 'Tiempo Completo';
              else if (t.category === 'ASOCIADO') contractType = 'Tiempo Completo';
              else if (t.category === 'ASISTENTE') contractType = 'Medio Tiempo';
              else if (t.category === 'CATEDRA') contractType = 'Catedrático';
              else contractType = 'Tiempo Completo';
            }

            const faculty = t.faculty === 'Facultad de Ingeniería'
              ? 'Facultad de Ingeniería y Tecnologías'
              : (t.faculty || 'Facultad de Ingeniería y Tecnologías');

            const program = t.program || (t.department ? `${t.department}` : 'Ingeniería de Sistemas y Computación');
            const fullName = t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim();

            return {
              ...t,
              fullName: fullName || 'Docente Universitario',
              contractType,
              category: contractType,
              faculty,
              program,
              phone: t.phone || '+57 (601) 745-9000 ext. 200',
              professionalTitle: t.professionalTitle || (t.specialization ? `Especialista en ${t.specialization}` : 'Ingeniero de Sistemas'),
              academicLevel: t.academicLevel || 'Maestría',
              status: t.status === 'ACTIVO' ? 'Activo' : (t.status || 'Activo'),
              weeklyHours: t.weeklyHours || (contractType === 'Tiempo Completo' ? 40 : contractType === 'Medio Tiempo' ? 20 : 16),
            };
          }
          return t;
        });

        // Asegurar que los 8 docentes representativos de la Universidad Isaías Gael estén presentes
        const existingIds = new Set(migratedList.map((m) => m.id));
        SEED_TEACHERS.forEach((seedT) => {
          if (!existingIds.has(seedT.id)) {
            migratedList.push(seedT);
            updated = true;
          }
        });

        if (updated) {
          localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(migratedList));
        }
      } catch (err) {
        console.warn('Reinicializando docentes tras error en parse:', err);
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(SEED_TEACHERS));
      }
    }

    // Asegurar que las ofertas académicas para los nuevos docentes estén registradas
    const storedOfferings = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERINGS) || '[]');
    const existingOffIds = new Set(storedOfferings.map((o) => o.id));
    let offeringsAdded = false;
    SEED_OFFERINGS.forEach((seedOff) => {
      if (!existingOffIds.has(seedOff.id)) {
        storedOfferings.push(seedOff);
        offeringsAdded = true;
      }
    });
    if (offeringsAdded) {
      localStorage.setItem(STORAGE_KEYS.OFFERINGS, JSON.stringify(storedOfferings));
    }

    // Asegurar que las tutorías ampliadas estén sincronizadas
    const storedTutorias = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORIAS) || '[]');
    const existingTutIds = new Set(storedTutorias.map((t) => t.id));
    let tutoriasAdded = false;
    SEED_TUTORIAS.forEach((seedTut) => {
      if (!existingTutIds.has(seedTut.id)) {
        storedTutorias.push(seedTut);
        tutoriasAdded = true;
      }
    });
    if (tutoriasAdded) {
      localStorage.setItem(STORAGE_KEYS.TUTORIAS, JSON.stringify(storedTutorias));
    }
  },

  /** Restablece la base de datos a sus valores iniciales de prueba de la Universidad Isaías Gael */
  resetDatabase() {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(SEED_TEACHERS));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(SEED_COURSES));
    localStorage.setItem(STORAGE_KEYS.OFFERINGS, JSON.stringify(SEED_OFFERINGS));
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(SEED_ENROLLMENTS));
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(SEED_GRADES));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.TUTORIAS, JSON.stringify(SEED_TUTORIAS));
  },

  // --- CATÁLOGOS ACADÉMICOS ---
  getFaculties() {
    return ACADEMIC_FACULTIES;
  },

  getContractTypes() {
    return CONTRACT_TYPES;
  },

  getAcademicLevels() {
    return ACADEMIC_LEVELS;
  },

  getTeacherStatuses() {
    return TEACHER_STATUSES;
  },

  /**
   * Calcula las métricas vivas de un docente a partir de ofertas, matrículas y tutorías
   */
  getTeacherMetrics(teacherId) {
    const offerings = this.getOfferings().filter((o) => o.teacherId === teacherId);
    const tutorias = this.getTutorias().filter((t) => t.teacherId === teacherId && t.status !== 'COMPLETADA' && t.status !== 'CANCELADA');
    const estudiantesAtendidos = offerings.reduce((sum, o) => sum + (o.enrolledCount || 0), 0);

    return {
      cursosAsignados: offerings.length,
      offerings,
      estudiantesAtendidos,
      tutoriasActivas: tutorias.length,
      tutorias,
    };
  },

  // --- USUARIOS & AUTENTICACIÓN ---
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // --- ESTUDIANTES ---
  getStudents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  },

  saveStudent(student) {
    const list = this.getStudents();
    const index = list.findIndex((s) => s.id === student.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...student };
    } else {
      list.unshift(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    return student;
  },

  deleteStudent(id) {
    const list = this.getStudents().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    return true;
  },

  // --- DOCENTES ---
  getTeachers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
  },

  saveTeacher(teacher) {
    const list = this.getTeachers();
    const index = list.findIndex((t) => t.id === teacher.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...teacher };
    } else {
      list.unshift(teacher);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(list));
    return teacher;
  },

  deleteTeacher(id) {
    const list = this.getTeachers().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(list));
    return true;
  },

  // --- ASIGNATURAS ---
  getCourses() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');
  },

  saveCourse(course) {
    const list = this.getCourses();
    const index = list.findIndex((c) => c.id === course.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...course };
    } else {
      list.unshift(course);
    }
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(list));
    return course;
  },

  deleteCourse(id) {
    const list = this.getCourses().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(list));
    return true;
  },

  // --- OFERTA DE CURSOS ---
  getOfferings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERINGS) || '[]');
  },

  saveOffering(offering) {
    const list = this.getOfferings();
    const index = list.findIndex((o) => o.id === offering.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...offering };
    } else {
      list.unshift(offering);
    }
    localStorage.setItem(STORAGE_KEYS.OFFERINGS, JSON.stringify(list));
  },

  // --- MATRÍCULAS ---
  getEnrollments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS) || '[]');
  },

  saveEnrollment(enrollment) {
    const list = this.getEnrollments();
    list.unshift(enrollment);
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(list));

    // Incrementar cupos ocupados en la oferta académica
    const offerings = this.getOfferings();
    enrollment.items.forEach((item) => {
      const off = offerings.find((o) => o.id === item.offeringId);
      if (off) {
        off.enrolledCount = (off.enrolledCount || 0) + 1;
      }
    });
    localStorage.setItem(STORAGE_KEYS.OFFERINGS, JSON.stringify(offerings));

    return enrollment;
  },

  // --- CALIFICACIONES ---
  getGrades() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
  },

  saveGrades(gradesList) {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(gradesList));
  },

  // --- TUTORÍAS ACADÉMICAS ---
  getTutorias() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORIAS) || '[]');
  },

  saveTutoria(tutoria) {
    const list = this.getTutorias();
    const index = list.findIndex((t) => t.id === tutoria.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...tutoria };
    } else {
      list.unshift(tutoria);
    }
    localStorage.setItem(STORAGE_KEYS.TUTORIAS, JSON.stringify(list));
    return tutoria;
  },

  deleteTutoria(id) {
    const list = this.getTutorias().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TUTORIAS, JSON.stringify(list));
    return true;
  },
};

/**
 * Tipos de datos para el Sistema de Gestión Académica (SGA)
 * y el Dossier de Arquitectura de Software
 */

export type Role = 'ADMIN' | 'DEAN' | 'TEACHER' | 'STUDENT' | 'REGISTRAR';

export type StudentStatus = 'ACTIVO' | 'EN_RIESGO' | 'MATRICULADO' | 'EGRESADO' | 'RETIRADO';

export type TeacherCategory = 'TITULAR' | 'ASOCIADO' | 'ASISTENTE' | 'CATEDRA';

export interface Student {
  id: string;
  code: string; // ej. EST-2024-1082
  documentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: string;
  faculty: string;
  currentSemester: number;
  status: StudentStatus;
  creditsEarned: number;
  cumulativeGpa: number; // 0.0 - 5.0
  admissionDate: string;
}

export interface Teacher {
  id: string;
  code: string; // ej. DOC-1044
  documentId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  faculty: string;
  category: TeacherCategory;
  specialization: string;
  weeklyHours: number;
  status: 'ACTIVO' | 'SABATICO' | 'INACTIVO';
}

export interface Course {
  id: string;
  code: string; // ej. SIS-301
  name: string;
  credits: number;
  semester: number;
  department: string;
  faculty: string;
  prerequisites: string[]; // Códigos de asignaturas previas
  hoursTheory: number;
  hoursPractice: number;
  description: string;
  syllabusUrl?: string;
}

export interface CourseOffering {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  group: string; // ej. G-01
  teacherId: string;
  teacherName: string;
  classroom: string;
  schedule: string; // ej. Lun/Mie 08:00 - 10:00
  capacity: number;
  enrolledCount: number;
  term: string; // ej. 2026-1
}

export interface EnrollmentItem {
  offeringId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  group: string;
  schedule: string;
  teacherName: string;
}

export interface EnrollmentRecord {
  id: string;
  code: string; // ej. MAT-2026-1-0089
  studentId: string;
  studentName: string;
  studentCode: string;
  term: string; // ej. 2026-1
  date: string;
  totalCredits: number;
  status: 'CONFIRMADA' | 'PENDIENTE' | 'CANCELADA';
  items: EnrollmentItem[];
}

export interface GradeItem {
  id: string;
  offeringId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  grade1: number; // 30%
  grade2: number; // 30%
  grade3: number; // 40% (Final)
  finalGrade: number; // Calculada
  approved: boolean;
  status: 'BORRADOR' | 'ENVIADO' | 'CERRADO_AUDITADO';
  lastUpdated: string;
  updatedBy: string;
}

// Arquitectura Data Structures
export interface ArchitectureActor {
  id: string;
  name: string;
  role: string;
  category: 'Primario' | 'Secundario' | 'Sistema Externo';
  description: string;
  responsibilities: string[];
  accessChannels: string[];
}

export interface ArchitectureRequirement {
  id: string; // ej. RF-01, RNF-01
  category: string;
  title: string;
  description: string;
  priority: 'ALTA' | 'MEDIA' | 'CRITICA';
  rationale: string;
  isoStandard?: string;
}

export interface UseCase {
  id: string; // CU-01
  title: string;
  actor: string;
  preconditions: string[];
  mainFlow: string[];
  postconditions: string[];
  alternativeFlow: string;
  businessRules: string[];
}

export interface ArchitectureRisk {
  id: string;
  title: string;
  impact: 'Alto' | 'Medio' | 'Crítico';
  probability: 'Alta' | 'Media' | 'Baja';
  description: string;
  mitigationStrategy: string;
  contingencyPlan: string;
}

export interface DatabaseEntity {
  name: string;
  table: string;
  description: string;
  primaryKey: string;
  attributes: {
    name: string;
    type: string;
    nullable: boolean;
    constraint?: string;
    description: string;
  }[];
  relationships: string[];
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { ArchitectureDossierView } from './components/architecture/ArchitectureDossierView';
import { StudentsModule } from './components/academic/StudentsModule';
import { TeachersModule } from './components/academic/TeachersModule';
import { CoursesModule } from './components/academic/CoursesModule';
import { EnrollmentModule } from './components/academic/EnrollmentModule';
import { GradesModule } from './components/academic/GradesModule';
import { ReportsModule } from './components/academic/ReportsModule';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_COURSES,
  INITIAL_OFFERINGS,
  INITIAL_ENROLLMENTS,
  INITIAL_GRADES,
} from './data/mockAcademicData';
import {
  Student,
  Teacher,
  Course,
  CourseOffering,
  EnrollmentRecord,
  GradeItem,
} from './types/academic';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  FileText,
  Layers,
  ShieldCheck,
  Building2,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [systemMode, setSystemMode] = useState<'architecture' | 'app'>('architecture');
  const [currentTab, setCurrentTab] = useState<string>('overview');

  // Academic System State
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [offerings, setOfferings] = useState<CourseOffering[]>(INITIAL_OFFERINGS);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>(INITIAL_ENROLLMENTS);
  const [grades, setGrades] = useState<GradeItem[]>(INITIAL_GRADES);

  // App module tab
  const [appModule, setAppModule] = useState<
    'students' | 'teachers' | 'courses' | 'enrollment' | 'grades' | 'reports'
  >('students');

  const handleAddStudent = (newStudent: Student) => {
    setStudents([newStudent, ...students]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const handleAddTeacher = (newTeacher: Teacher) => {
    setTeachers([newTeacher, ...teachers]);
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses([...courses, newCourse]);
  };

  const handleConfirmEnrollment = (newRecord: EnrollmentRecord) => {
    setEnrollments([newRecord, ...enrollments]);
    // update offering enrolled counts
    const updatedOfferingIds = newRecord.items.map((it) => it.offeringId);
    setOfferings(
      offerings.map((off) => {
        if (updatedOfferingIds.includes(off.id)) {
          return { ...off, enrolledCount: off.enrolledCount + 1 };
        }
        return off;
      })
    );
  };

  const handleUpdateGrades = (updatedGrades: GradeItem[]) => {
    setGrades(updatedGrades);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (['students', 'teachers', 'courses', 'enrollment', 'grades', 'reports'].includes(tab)) {
            setAppModule(tab as any);
          }
        }}
        systemMode={systemMode}
        onToggleMode={(mode) => setSystemMode(mode)}
      />

      <main className="flex-1">
        {systemMode === 'architecture' ? (
          <ArchitectureDossierView />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* SGA Operational Hero / KPI Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-indigo-700">Plataforma Operativa SGA</span>
                    <span aria-hidden="true">·</span>
                    <span>Período Vigente 2026-1</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium">Motor Transaccional Activo</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Universidad Isaías Gael · Sistema de Gestión Académica
                  </h1>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    Módulos operativos en vivo para la gestión integral de la Universidad Isaías Gael: estudiantes, docentes,
                    asignaturas, matrícula con control de cupos y topes de crédito, calificaciones y tutorías.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSystemMode('architecture')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Ver Dossier Arquitectónico</span>
                  </button>
                </div>
              </div>

              {/* Module Selector Segmented Controls */}
              <div className="mt-6 flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl overflow-x-auto">
                {[
                  { id: 'students', label: '1. Estudiantes', icon: Users, count: students.length },
                  { id: 'teachers', label: '2. Docentes', icon: GraduationCap, count: teachers.length },
                  { id: 'courses', label: '3. Asignaturas', icon: BookOpen, count: courses.length },
                  { id: 'enrollment', label: '4. Matrículas', icon: ClipboardList, count: enrollments.length },
                  { id: 'grades', label: '5. Calificaciones', icon: CheckCircle2, count: grades.length },
                  { id: 'reports', label: '6. Reportes', icon: FileText, count: null },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = appModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAppModule(item.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                      {item.count !== null && (
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                            isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active SGA Module Viewport */}
            <div className="bg-transparent">
              {appModule === 'students' && (
                <StudentsModule
                  students={students}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                />
              )}

              {appModule === 'teachers' && (
                <TeachersModule
                  teachers={teachers}
                  offerings={offerings}
                  onAddTeacher={handleAddTeacher}
                />
              )}

              {appModule === 'courses' && (
                <CoursesModule
                  courses={courses}
                  onAddCourse={handleAddCourse}
                />
              )}

              {appModule === 'enrollment' && (
                <EnrollmentModule
                  students={students}
                  courses={courses}
                  offerings={offerings}
                  enrollments={enrollments}
                  onConfirmEnrollment={handleConfirmEnrollment}
                />
              )}

              {appModule === 'grades' && (
                <GradesModule
                  offerings={offerings}
                  grades={grades}
                  onUpdateGrades={handleUpdateGrades}
                />
              )}

              {appModule === 'reports' && (
                <ReportsModule
                  students={students}
                  offerings={offerings}
                  grades={grades}
                  courses={courses}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* University Official Engineering Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Sistema de Gestión Académica (SGA)</span>
            <span aria-hidden="true">·</span>
            <span>Arquitectura Hexagonal & Limpia (DDD)</span>
            <span aria-hidden="true">·</span>
            <span>PostgreSQL 16 ACID</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Cumplimiento ISO/IEC 25010</span>
            <span aria-hidden="true">·</span>
            <span>IEEE 830 SRS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

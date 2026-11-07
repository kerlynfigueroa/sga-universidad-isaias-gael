import React, { useState } from 'react';
import { Student, CourseOffering, GradeItem, Course } from '../../types/academic';
import { FileText, Printer, Download, Award, AlertTriangle, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface ReportsModuleProps {
  students: Student[];
  offerings: CourseOffering[];
  grades: GradeItem[];
  courses: Course[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  students,
  offerings,
  grades,
  courses,
}) => {
  const [activeReportType, setActiveReportType] = useState<'certificate' | 'gradeSheet' | 'academicRisk'>('certificate');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(offerings[0]?.id || '');

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedOffering = offerings.find((o) => o.id === selectedOfferingId);
  const currentGrades = grades.filter((g) => g.offeringId === selectedOfferingId);

  // Risk students
  const riskStudents = students.filter((s) => s.cumulativeGpa < 3.0 || s.status === 'EN_RIESGO');

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeReportType === 'gradeSheet') {
      csvContent += 'Codigo_Estudiante,Nombre,Corte_1,Corte_2,Examen_Final,Definitiva,Aprobado,Estado\n';
      currentGrades.forEach((g) => {
        csvContent += `${g.studentCode},"${g.studentName}",${g.grade1},${g.grade2},${g.grade3},${g.finalGrade},${g.approved ? 'SI' : 'NO'},${g.status}\n`;
      });
    } else {
      csvContent += 'Codigo,Nombre,Programa,Semestre,PGA,Creditos,Estado\n';
      students.forEach((s) => {
        csvContent += `${s.code},"${s.firstName} ${s.lastName}","${s.program}",${s.currentSemester},${s.cumulativeGpa},${s.creditsEarned},${s.status}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_academico_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Módulo de Reportes Académicos</h2>
          <p className="text-xs text-slate-600 mt-1">
            Certificados oficiales con validez jurídica, sábanas de notas por curso y reportes de riesgo institucional.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Reporte</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto no-print">
        <button
          type="button"
          onClick={() => setActiveReportType('certificate')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeReportType === 'certificate'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Certificado Oficial de Calificaciones
        </button>
        <button
          type="button"
          onClick={() => setActiveReportType('gradeSheet')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeReportType === 'gradeSheet'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Sábana General de Notas (Acta de Curso)
        </button>
        <button
          type="button"
          onClick={() => setActiveReportType('academicRisk')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeReportType === 'academicRisk'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Reporte de Riesgo y Alerta Temprana
        </button>
      </div>

      {/* REPORT 1: CERTIFICADO OFICIAL */}
      {activeReportType === 'certificate' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 no-print bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="text-xs font-semibold text-slate-700">Seleccionar Estudiante:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="p-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.firstName} {st.lastName} ({st.code}) - Semestre {st.currentSemester}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="bg-white border-2 border-slate-300 rounded-xl p-8 shadow-sm space-y-6 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
              {/* University Header */}
              <div className="text-center pb-6 border-b-2 border-slate-800 space-y-1">
                <span className="text-xs uppercase tracking-widest font-bold text-slate-500">
                  República de Colombia · Ministerio de Educación Nacional
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  UNIVERSIDAD NACIONAL DE EDUCACIÓN SUPERIOR
                </h1>
                <p className="text-xs text-slate-600">
                  División de Registro y Control Académico · NIT: 899.999.001-4
                </p>
                <div className="inline-block mt-2 px-3 py-0.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                  Certificado Oficial de Calificaciones y Récord Académico
                </div>
              </div>

              {/* Student Identification Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Estudiante:</span>
                  <span className="font-bold text-slate-900">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Identificación:</span>
                  <span className="font-mono font-bold text-slate-900">CC {selectedStudent.documentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Código Estudiantil:</span>
                  <span className="font-mono font-bold text-indigo-700">{selectedStudent.code}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Programa Académico:</span>
                  <span className="font-semibold text-slate-900">{selectedStudent.program}</span>
                </div>
              </div>

              {/* Academic History Transcript */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Historial de Asignaturas y Calificaciones Definitivas
                </span>
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Asignatura</th>
                        <th className="py-2.5 px-3 text-center">Créditos</th>
                        <th className="py-2.5 px-3 text-center">Calificación</th>
                        <th className="py-2.5 px-3 text-center">Concepto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">SIS-301</td>
                        <td className="py-2 px-3 font-sans text-slate-900">Arquitectura y Diseño de Software</td>
                        <td className="py-2 px-3 text-center">4</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-700">4.6</td>
                        <td className="py-2 px-3 text-center font-sans font-semibold text-emerald-800">APROBADA</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">SIS-302</td>
                        <td className="py-2 px-3 font-sans text-slate-900">Bases de Datos Avanzadas y Transacciones</td>
                        <td className="py-2 px-3 text-center">4</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-700">4.5</td>
                        <td className="py-2 px-3 text-center font-sans font-semibold text-emerald-800">APROBADA</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">SIS-303</td>
                        <td className="py-2 px-3 font-sans text-slate-900">Seguridad Informática y Criptografía</td>
                        <td className="py-2 px-3 text-center">3</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-700">4.4</td>
                        <td className="py-2 px-3 text-center font-sans font-semibold text-emerald-800">APROBADA</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">MAT-301</td>
                        <td className="py-2 px-3 font-sans text-slate-900">Probabilidad y Estadística para Computación</td>
                        <td className="py-2 px-3 text-center">3</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-700">4.2</td>
                        <td className="py-2 px-3 text-center font-sans font-semibold text-emerald-800">APROBADA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cumulative GPA Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Total Créditos Aprobados</span>
                  <span className="font-mono text-lg font-bold text-slate-100">
                    {selectedStudent.creditsEarned} SCT de 160 SCT ({(selectedStudent.creditsEarned / 160 * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Promedio General Acumulado (PGA)</span>
                  <span className="font-mono text-2xl font-bold text-emerald-400">
                    {selectedStudent.cumulativeGpa.toFixed(2)} / 5.00
                  </span>
                </div>
              </div>

              {/* Signatures & Security Seal */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                <div className="border-t border-slate-400 pt-2 text-center">
                  <span className="font-bold text-slate-900 block">Dr. Roberto Guzmán Echeverri</span>
                  <span className="text-slate-500">Secretario General y Registrador Académico</span>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-3 text-slate-500 text-[11px]">
                  <div className="p-2 border border-slate-300 rounded bg-slate-50 font-mono text-[9px] text-center">
                    <div>HASH CRIPTOGRÁFICO SHA-256</div>
                    <div className="font-bold text-slate-800">e3b0c44298fc1c149afbf4c8996fb924</div>
                    <div className="text-emerald-700 font-semibold">VALIDACIÓN DIGITAL OFICIAL</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORT 2: SÁBANA GENERAL DE NOTAS */}
      {activeReportType === 'gradeSheet' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 no-print bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="text-xs font-semibold text-slate-700">Seleccionar Curso / Grupo:</label>
            <select
              value={selectedOfferingId}
              onChange={(e) => setSelectedOfferingId(e.target.value)}
              className="p-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
            >
              {offerings.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.courseCode} ({off.group}) - {off.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Sábana Consolidada de Notas: {selectedOffering?.courseName} ({selectedOffering?.courseCode})
                </h3>
                <span className="text-xs text-slate-500">
                  Docente: {selectedOffering?.teacherName} · Período 2026-1
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">
                {currentGrades.length} Alumnos Evaluados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Estudiante</th>
                    <th className="py-2.5 px-3 text-center">Corte 1 (30%)</th>
                    <th className="py-2.5 px-3 text-center">Corte 2 (30%)</th>
                    <th className="py-2.5 px-3 text-center">Final (40%)</th>
                    <th className="py-2.5 px-3 text-right">Definitiva</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {currentGrades.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{g.studentCode}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{g.studentName}</td>
                      <td className="py-2.5 px-3 text-center">{g.grade1.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-center">{g.grade2.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-center">{g.grade3.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-indigo-700">
                        {g.finalGrade.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            g.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {g.approved ? 'APROBADO' : 'REPROBADO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: RIESGO ACADÉMICO */}
      {activeReportType === 'academicRisk' && (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <span>Alerta Temprana de Riesgo de Deserción y Pérdida de Cupo</span>
            </div>
            <p className="text-rose-700">
              Estudiantes con Promedio General Acumulado (PGA) inferior a 3.00 o en condición reglamentaria de prueba académica.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4">Programa</th>
                    <th className="py-3 px-4 text-center">Semestre</th>
                    <th className="py-3 px-4 text-right">PGA Actual</th>
                    <th className="py-3 px-4">Condición</th>
                    <th className="py-3 px-4 text-right">Acción Tutorial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {riskStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{st.code}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                        {st.firstName} {st.lastName}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600">{st.program}</td>
                      <td className="py-3 px-4 text-center">{st.currentSemester}</td>
                      <td className="py-3 px-4 text-right font-bold text-rose-700 text-xs">
                        {st.cumulativeGpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                          {st.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => alert(`Se ha remitido al estudiante ${st.firstName} ${st.lastName} al programa de Acompañamiento Académico y Tutorías.`)}
                          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                        >
                          Asignar Tutor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

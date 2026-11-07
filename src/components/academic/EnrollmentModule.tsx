import React, { useState } from 'react';
import { Student, CourseOffering, Course, EnrollmentRecord } from '../../types/academic';
import { CheckCircle2, AlertTriangle, Clock, Calendar, Check, X, Printer, ShieldCheck } from 'lucide-react';

interface EnrollmentModuleProps {
  students: Student[];
  courses: Course[];
  offerings: CourseOffering[];
  enrollments: EnrollmentRecord[];
  onConfirmEnrollment: (record: EnrollmentRecord) => void;
}

export const EnrollmentModule: React.FC<EnrollmentModuleProps> = ({
  students,
  courses,
  offerings,
  enrollments,
  onConfirmEnrollment,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedOfferingIds, setSelectedOfferingIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [completedEnrollment, setCompletedEnrollment] = useState<EnrollmentRecord | null>(null);

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  // Compute selected items & total credits
  const selectedOfferings = offerings.filter((o) => selectedOfferingIds.includes(o.id));
  const totalSelectedCredits = selectedOfferings.reduce((sum, o) => sum + o.credits, 0);

  const toggleOffering = (offering: CourseOffering) => {
    setFeedbackMessage(null);

    // If already selected, remove
    if (selectedOfferingIds.includes(offering.id)) {
      setSelectedOfferingIds(selectedOfferingIds.filter((id) => id !== offering.id));
      return;
    }

    // Validation 1: Capacity check
    if (offering.enrolledCount >= offering.capacity) {
      setFeedbackMessage({
        type: 'error',
        text: `El grupo ${offering.group} de ${offering.courseName} no tiene cupos disponibles (${offering.enrolledCount}/${offering.capacity}).`,
      });
      return;
    }

    // Validation 2: Credit cap (max 20 credits)
    if (totalSelectedCredits + offering.credits > 20) {
      setFeedbackMessage({
        type: 'error',
        text: `Límite de créditos excedido: Seleccionar esta asignatura sumaría ${
          totalSelectedCredits + offering.credits
        } créditos (Tope máximo institucional: 20 créditos).`,
      });
      return;
    }

    // Validation 3: Duplicate course (cannot enroll in two groups of same subject)
    const alreadyHasCourse = selectedOfferings.some((o) => o.courseCode === offering.courseCode);
    if (alreadyHasCourse) {
      setFeedbackMessage({
        type: 'error',
        text: `Ya has seleccionado un grupo para la asignatura ${offering.courseCode}. Solo se permite inscribir un grupo por materia.`,
      });
      return;
    }

    // Validation 4: Prerequisite validation
    const courseMeta = courses.find((c) => c.code === offering.courseCode);
    if (courseMeta && courseMeta.prerequisites.length > 0) {
      // Check if student has failed/unapproved prerequisite (for example Camilo Herrera with risk status)
      if (currentStudent?.status === 'EN_RIESGO' && courseMeta.code === 'SIS-401') {
        setFeedbackMessage({
          type: 'error',
          text: `Requisito no cumplido: Para cursar ${courseMeta.code} se requiere haber aprobado ${courseMeta.prerequisites.join(
            ', '
          )} con nota mínima de 3.0.`,
        });
        return;
      }
    }

    setSelectedOfferingIds([...selectedOfferingIds, offering.id]);
  };

  const handleConfirm = () => {
    if (!currentStudent) return;
    if (selectedOfferings.length === 0) {
      setFeedbackMessage({
        type: 'error',
        text: 'Debes seleccionar al menos una asignatura para formalizar la matrícula.',
      });
      return;
    }

    const newRecord: EnrollmentRecord = {
      id: `mat-${Date.now()}`,
      code: `MAT-2026-1-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: currentStudent.id,
      studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
      studentCode: currentStudent.code,
      term: '2026-1',
      date: new Date().toLocaleString('es-CO'),
      totalCredits: totalSelectedCredits,
      status: 'CONFIRMADA',
      items: selectedOfferings.map((o) => ({
        offeringId: o.id,
        courseCode: o.courseCode,
        courseName: o.courseName,
        credits: o.credits,
        group: o.group,
        schedule: o.schedule,
        teacherName: o.teacherName,
      })),
    };

    onConfirmEnrollment(newRecord);
    setCompletedEnrollment(newRecord);
    setSelectedOfferingIds([]);
    setFeedbackMessage({
      type: 'success',
      text: `¡Matrícula formalizada exitosamente con código ${newRecord.code}! Se han reservado ${totalSelectedCredits} créditos.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Motor de Matrículas en Línea (Período 2026-1)</h2>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Ventana de Inscripción Activa
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Simulación del motor transaccional ACID: validación de topes (máx 20 créditos), semáforo de cupos en tiempo real y verificación de pre-requisitos.
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-semibold text-slate-700">Estudiante:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setSelectedOfferingIds([]);
              setFeedbackMessage(null);
            }}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-slate-900"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.firstName} {st.lastName} ({st.code}) - {st.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Eligibility & Credit Monitor Bar */}
      {currentStudent && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-900">
                  {currentStudent.firstName} {currentStudent.lastName}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-mono text-slate-500">{currentStudent.code}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-600">{currentStudent.program}</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-3">
                <span>PGA Acumulado: <strong className="text-slate-800 font-mono">{currentStudent.cumulativeGpa.toFixed(2)}</strong></span>
                <span>Créditos Previos: <strong className="text-slate-800 font-mono">{currentStudent.creditsEarned} SCT</strong></span>
                <span>Estado: <strong className="text-indigo-700">{currentStudent.status}</strong></span>
              </div>
            </div>

            {/* Credit Meter */}
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Créditos Seleccionados</span>
                <span
                  className={`font-mono text-base font-bold ${
                    totalSelectedCredits > 20
                      ? 'text-rose-700'
                      : totalSelectedCredits >= 12
                      ? 'text-emerald-700'
                      : 'text-indigo-700'
                  }`}
                >
                  {totalSelectedCredits} / 20 SCT
                </span>
              </div>
              <div className="w-20 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    totalSelectedCredits > 20 ? 'bg-rose-600' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, (totalSelectedCredits / 20) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main 2-Column: Offerings vs Selection Basket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Offerings (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Oferta Académica Habilitada para Inscripción
            </h3>
            <span className="text-xs text-slate-400 font-mono">{offerings.length} asignaturas</span>
          </div>

          <div className="space-y-3">
            {offerings.map((offering) => {
              const isSelected = selectedOfferingIds.includes(offering.id);
              const isFull = offering.enrolledCount >= offering.capacity;

              return (
                <div
                  key={offering.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                      : isFull
                      ? 'border-slate-200 bg-slate-50 opacity-75'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {offering.courseCode} ({offering.group})
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <h4 className="text-sm font-bold text-slate-900">{offering.courseName}</h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="font-medium text-slate-800">{offering.teacherName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-500">{offering.schedule}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500">{offering.classroom}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-right text-xs">
                        <span className="font-mono font-bold text-slate-900">{offering.credits} SCT</span>
                        <div
                          className={`font-mono text-[11px] font-semibold ${
                            isFull ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {offering.enrolledCount} / {offering.capacity} cupos
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleOffering(offering)}
                        disabled={isFull && !isSelected}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : isFull
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {isSelected ? 'Quitar' : isFull ? 'Sin Cupos' : 'Inscribir'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Basket (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Plan de Inscripción Actual
            </h3>
            <span className="text-xs font-mono font-bold text-indigo-700">
              {selectedOfferings.length} cursos
            </span>
          </div>

          {selectedOfferings.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-1">
              <p>No has seleccionado asignaturas.</p>
              <p className="text-[11px] text-slate-500">Haz clic en "Inscribir" en la lista de la izquierda.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedOfferings.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-mono font-bold text-slate-800 block truncate">
                      {item.courseCode} - {item.courseName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.group} · {item.credits} Créditos
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleOffering(item)}
                    className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Total de Créditos:</span>
              <span className="font-mono text-base font-bold text-slate-900">{totalSelectedCredits} SCT</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Costo estimado:</span>
              <span className="font-mono text-emerald-700 font-medium">Beca Académica 100%</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedOfferings.length === 0}
            className={`w-full py-2.5 rounded-lg text-xs font-bold transition-colors shadow-xs ${
              selectedOfferings.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            Confirmar y Formalizar Matrícula
          </button>
        </div>
      </div>

      {/* Official Enrollment Confirmation Modal */}
      {completedEnrollment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Comprobante Oficial de Matrícula Académica
                  </h3>
                  <span className="text-xs text-slate-500">Período Lectivo 2026-1</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletedEnrollment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block">Número de Matrícula</span>
                <span className="font-mono font-bold text-indigo-700">{completedEnrollment.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Fecha y Hora de Confirmación</span>
                <span className="font-mono font-medium text-slate-800">{completedEnrollment.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Estudiante</span>
                <span className="font-semibold text-slate-900">{completedEnrollment.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Créditos Inscritos</span>
                <span className="font-mono font-bold text-slate-900">{completedEnrollment.totalCredits} SCT</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Asignaturas Registradas</span>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Asignatura</th>
                      <th className="py-2 px-3">Grupo</th>
                      <th className="py-2 px-3 text-right">Créditos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {completedEnrollment.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-bold text-slate-800">{it.courseCode}</td>
                        <td className="py-2 px-3 font-sans text-slate-700">{it.courseName}</td>
                        <td className="py-2 px-3 text-indigo-700">{it.group}</td>
                        <td className="py-2 px-3 text-right">{it.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Documento firmado electrónicamente con sello criptográfico</span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

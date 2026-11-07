import React, { useState } from 'react';
import { GradeItem, CourseOffering } from '../../types/academic';
import { Lock, Unlock, CheckCircle2, AlertTriangle, ShieldCheck, Save, Clock } from 'lucide-react';

interface GradesModuleProps {
  offerings: CourseOffering[];
  grades: GradeItem[];
  onUpdateGrades: (updatedGrades: GradeItem[]) => void;
}

export const GradesModule: React.FC<GradesModuleProps> = ({
  offerings,
  grades,
  onUpdateGrades,
}) => {
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(offerings[0]?.id || '');
  const [localGrades, setLocalGrades] = useState<GradeItem[]>(grades);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentOffering = offerings.find((o) => o.id === selectedOfferingId);
  const currentGrades = localGrades.filter((g) => g.offeringId === selectedOfferingId);

  // Check if any grade in this offering is CERRADO_AUDITADO
  const allClosed = currentGrades.every((g) => g.status === 'CERRADO_AUDITADO');

  const handleGradeChange = (
    gradeId: string,
    field: 'grade1' | 'grade2' | 'grade3',
    valueStr: string
  ) => {
    if (allClosed || isLocked) return;

    let val = parseFloat(valueStr);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 5.0) val = 5.0;

    const updated = localGrades.map((item) => {
      if (item.id === gradeId) {
        const g1 = field === 'grade1' ? val : item.grade1;
        const g2 = field === 'grade2' ? val : item.grade2;
        const g3 = field === 'grade3' ? val : item.grade3;

        // Formula: 30% + 30% + 40%
        const computedFinal = Number(((g1 * 0.3) + (g2 * 0.3) + (g3 * 0.4)).toFixed(1));
        const approved = computedFinal >= 3.0;

        return {
          ...item,
          [field]: val,
          finalGrade: computedFinal,
          approved,
          lastUpdated: new Date().toISOString(),
          status: 'BORRADOR' as const,
        };
      }
      return item;
    });

    setLocalGrades(updated);
  };

  const handleSaveDraft = () => {
    onUpdateGrades(localGrades);
    setFeedback('Borrador de calificaciones guardado exitosamente.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCloseActa = () => {
    const updated = localGrades.map((item) => {
      if (item.offeringId === selectedOfferingId) {
        return {
          ...item,
          status: 'CERRADO_AUDITADO' as const,
          lastUpdated: new Date().toISOString(),
          updatedBy: `${currentOffering?.teacherName} (Firma Digital Verificada)`,
        };
      }
      return item;
    });

    setLocalGrades(updated);
    onUpdateGrades(updated);
    setIsLocked(true);
    setFeedback(
      '¡Acta Cerrada y Auditada! Las calificaciones han quedado selladas criptográficamente y en modo de solo lectura.'
    );
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Libro de Calificaciones Docente</h2>
            <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              Evaluación Período 2026-1
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Registro ponderado: Corte 1 (30%), Corte 2 (30%), Examen Final (40%). Escala oficial de 0.0 a 5.0 con aprobación mínima en 3.0.
          </p>
        </div>

        {/* Course Offering Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-semibold text-slate-700">Asignatura / Grupo:</label>
          <select
            value={selectedOfferingId}
            onChange={(e) => {
              setSelectedOfferingId(e.target.value);
              setIsLocked(false);
              setFeedback(null);
            }}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-slate-900"
          >
            {offerings.map((off) => (
              <option key={off.id} value={off.id}>
                {off.courseCode} ({off.group}) - {off.courseName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Banner Info */}
      {currentOffering && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-900">{currentOffering.courseName}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-indigo-700 font-semibold">{currentOffering.courseCode} ({currentOffering.group})</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600">{currentOffering.credits} Créditos</span>
            </div>
            <div className="text-xs text-slate-500">
              <span>Docente Titular: <strong className="text-slate-800">{currentOffering.teacherName}</strong></span>
              <span className="mx-2">·</span>
              <span>Horario: <strong className="text-slate-800 font-mono">{currentOffering.schedule}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {allClosed || isLocked ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Acta Cerrada (Solo Lectura)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Borrador</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseActa}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-700 hover:bg-rose-800 text-white transition-colors shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Cierre Definitivo de Acta</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Gradebook Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-4 text-center">Corte 1 (30%)</th>
                <th className="py-3 px-4 text-center">Corte 2 (30%)</th>
                <th className="py-3 px-4 text-center">Examen Final (40%)</th>
                <th className="py-3 px-4 text-right">Definitiva</th>
                <th className="py-3 px-4 text-center">Resultado</th>
                <th className="py-3 px-4 text-center">Estado Acta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {currentGrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No hay estudiantes registrados en este grupo.
                  </td>
                </tr>
              ) : (
                currentGrades.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700">{row.studentCode}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                      {row.studentName}
                    </td>

                    {/* Corte 1 input */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5.0"
                        disabled={allClosed || isLocked}
                        value={row.grade1}
                        onChange={(e) => handleGradeChange(row.id, 'grade1', e.target.value)}
                        className={`w-16 py-1 px-2 border rounded text-center font-mono font-bold text-xs ${
                          allClosed || isLocked
                            ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                            : 'bg-white border-slate-300 focus:ring-1 focus:ring-slate-900 text-slate-900'
                        }`}
                      />
                    </td>

                    {/* Corte 2 input */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5.0"
                        disabled={allClosed || isLocked}
                        value={row.grade2}
                        onChange={(e) => handleGradeChange(row.id, 'grade2', e.target.value)}
                        className={`w-16 py-1 px-2 border rounded text-center font-mono font-bold text-xs ${
                          allClosed || isLocked
                            ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                            : 'bg-white border-slate-300 focus:ring-1 focus:ring-slate-900 text-slate-900'
                        }`}
                      />
                    </td>

                    {/* Examen Final input */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5.0"
                        disabled={allClosed || isLocked}
                        value={row.grade3}
                        onChange={(e) => handleGradeChange(row.id, 'grade3', e.target.value)}
                        className={`w-16 py-1 px-2 border rounded text-center font-mono font-bold text-xs ${
                          allClosed || isLocked
                            ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                            : 'bg-white border-slate-300 focus:ring-1 focus:ring-slate-900 text-slate-900'
                        }`}
                      />
                    </td>

                    {/* Definitiva Calculada */}
                    <td className="py-3 px-4 text-right tabular-nums">
                      <span
                        className={`font-mono text-sm font-bold ${
                          row.finalGrade >= 3.0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {row.finalGrade.toFixed(1)}
                      </span>
                    </td>

                    {/* Resultado */}
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          row.approved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {row.approved ? 'Aprobado' : 'Reprobado'}
                      </span>
                    </td>

                    {/* Estado Acta */}
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.status === 'CERRADO_AUDITADO'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : row.status === 'ENVIADO'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {row.status === 'CERRADO_AUDITADO' && <Lock className="w-2.5 h-2.5" />}
                        <span>{row.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Statistics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-slate-500 block">Total Estudiantes Evaluados</span>
          <span className="font-mono font-bold text-slate-900 text-base">{currentGrades.length}</span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-slate-500 block">Aprobados (&gt;= 3.0)</span>
          <span className="font-mono font-bold text-emerald-700 text-base">
            {currentGrades.filter((g) => g.approved).length} ({currentGrades.length ? Math.round((currentGrades.filter((g) => g.approved).length / currentGrades.length) * 100) : 0}%)
          </span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-slate-500 block">Reprobados (&lt; 3.0)</span>
          <span className="font-mono font-bold text-rose-700 text-base">
            {currentGrades.filter((g) => !g.approved).length} ({currentGrades.length ? Math.round((currentGrades.filter((g) => !g.approved).length / currentGrades.length) * 100) : 0}%)
          </span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-slate-500 block">Promedio del Grupo</span>
          <span className="font-mono font-bold text-indigo-700 text-base">
            {currentGrades.length
              ? (
                  currentGrades.reduce((sum, g) => sum + g.finalGrade, 0) / currentGrades.length
                ).toFixed(2)
              : '0.00'}
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Student } from '../../types/academic';
import { Search, Plus, UserCheck, AlertTriangle, GraduationCap, X, Check } from 'lucide-react';

interface StudentsModuleProps {
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
}

export const StudentsModule: React.FC<StudentsModuleProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newDocumentId, setNewDocumentId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newProgram, setNewProgram] = useState('Ingeniería de Sistemas y Computación');
  const [newSemester, setNewSemester] = useState(1);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.documentId.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newDocumentId) return;

    const newCode = `EST-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const student: Student = {
      id: `est-${Date.now()}`,
      code: newCode,
      documentId: newDocumentId,
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail || `${newFirstName.toLowerCase().replace(/\s+/g, '.')}.${newLastName.toLowerCase().replace(/\s+/g, '.')}@universidad.edu`,
      phone: '+57 300 000 0000',
      program: newProgram,
      faculty: 'Facultad de Ingeniería',
      currentSemester: newSemester,
      status: 'ACTIVO',
      creditsEarned: (newSemester - 1) * 16,
      cumulativeGpa: 4.0,
      admissionDate: '2026-02-01',
    };

    onAddStudent(student);
    setIsAddModalOpen(false);
    setNewFirstName('');
    setNewLastName('');
    setNewDocumentId('');
    setNewEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Gestión de Estudiantes</h2>
            <span className="text-xs text-slate-500 font-mono">({filteredStudents.length} registrados)</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Administración del expediente curricular, créditos acumulados y promedio general acumulado (PGA).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Estudiante</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, cédula o nombre..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
          />
        </div>

        {/* Interactive Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'ACTIVO', label: 'Activos' },
            { id: 'EN_RIESGO', label: 'En Riesgo' },
            { id: 'MATRICULADO', label: 'Matriculados' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">Código / Cédula</th>
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-4">Programa / Semestre</th>
                <th className="py-3 px-4 text-right">Créditos</th>
                <th className="py-3 px-4 text-right">PGA Acumulado</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron estudiantes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-900">{student.code}</div>
                      <div className="text-[11px] text-slate-400">CC {student.documentId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-slate-400 text-[11px]">{student.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{student.program}</div>
                      <div className="text-slate-500 text-[11px]">Semestre {student.currentSemester}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700 tabular-nums">
                      {student.creditsEarned} SCT
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span
                        className={`font-bold ${
                          student.cumulativeGpa >= 4.0
                            ? 'text-emerald-700'
                            : student.cumulativeGpa >= 3.0
                            ? 'text-slate-800'
                            : 'text-rose-700'
                        }`}
                      >
                        {student.cumulativeGpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          student.status === 'ACTIVO'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : student.status === 'EN_RIESGO'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {student.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600">{selectedStudent.code}</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <span className="text-xs text-slate-500">{selectedStudent.program}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Documento de Identidad</span>
                <span className="font-semibold text-slate-900 font-mono">CC {selectedStudent.documentId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Correo Institucional</span>
                <span className="font-semibold text-slate-900 truncate block">{selectedStudent.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Promedio Acumulado (PGA)</span>
                <span className="font-bold text-indigo-700 font-mono text-base">
                  {selectedStudent.cumulativeGpa.toFixed(2)} / 5.0
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Créditos Aprobados</span>
                <span className="font-bold text-slate-900 font-mono text-base">
                  {selectedStudent.creditsEarned} SCT
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Historial y Auditoría Académica</span>
              <div className="space-y-1 text-slate-600">
                <p>· Admisión registrada el {selectedStudent.admissionDate}</p>
                <p>· Estado actual de matrícula: {selectedStudent.status}</p>
                <p>· Semestre en curso: Semestre {selectedStudent.currentSemester} de 10</p>
                <p>· Facultad adscrita: {selectedStudent.faculty}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateStudent}
            className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Registrar Nuevo Estudiante</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombres *</label>
                <input
                  type="text"
                  required
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  placeholder="Ej. Sofía"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Apellidos *</label>
                <input
                  type="text"
                  required
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  placeholder="Ej. Restrepo Orozco"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cédula / Documento *</label>
                <input
                  type="text"
                  required
                  value={newDocumentId}
                  onChange={(e) => setNewDocumentId(e.target.value)}
                  placeholder="Ej. 1098456123"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Semestre de Ingreso</label>
                <select
                  value={newSemester}
                  onChange={(e) => setNewSemester(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                    <option key={s} value={s}>
                      Semestre {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Programa Académico</label>
                <select
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Ingeniería de Sistemas y Computación">
                    Ingeniería de Sistemas y Computación
                  </option>
                  <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                  <option value="Administración de Empresas">Administración de Empresas</option>
                  <option value="Ciencias de la Computación">Ciencias de la Computación</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded"
              >
                Guardar en Registro
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

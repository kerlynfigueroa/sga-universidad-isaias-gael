import React, { useState } from 'react';
import { Teacher, CourseOffering } from '../../types/academic';
import { Search, Plus, Award, BookOpen, Clock, X } from 'lucide-react';

interface TeachersModuleProps {
  teachers: Teacher[];
  offerings: CourseOffering[];
  onAddTeacher: (teacher: Teacher) => void;
}

export const TeachersModule: React.FC<TeachersModuleProps> = ({
  teachers,
  offerings,
  onAddTeacher,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [department, setDepartment] = useState('Departamento de Ingeniería de Software');
  const [category, setCategory] = useState<'TITULAR' | 'ASOCIADO' | 'ASISTENTE' | 'CATEDRA'>('ASOCIADO');
  const [specialization, setSpecialization] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(40);

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !documentId) return;

    const newTeacher: Teacher = {
      id: `doc-${Date.now()}`,
      code: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      documentId,
      firstName,
      lastName,
      email: `${firstName.toLowerCase().replace(/[^a-z]/g, '')}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}@universidad.edu`,
      department,
      faculty: 'Facultad de Ingeniería',
      category,
      specialization: specialization || 'Ingeniería y Computación',
      weeklyHours,
      status: 'ACTIVO',
    };

    onAddTeacher(newTeacher);
    setIsAddModalOpen(false);
    setFirstName('');
    setLastName('');
    setDocumentId('');
    setSpecialization('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Gestión de Docentes</h2>
            <span className="text-xs text-slate-500 font-mono">({filteredTeachers.length} profesores)</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Control de escalafón profesoral, departamentos académicos, horas de dedicación y cursos asignados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Vincular Docente</span>
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
            placeholder="Buscar por nombre, código o departamento..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'TITULAR', label: 'Titulares' },
            { id: 'ASOCIADO', label: 'Asociados' },
            { id: 'ASISTENTE', label: 'Asistentes' },
            { id: 'CATEDRA', label: 'Cátedra' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                categoryFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Teachers Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeachers.map((teacher) => {
          const teacherOfferings = offerings.filter((o) => o.teacherId === teacher.id);
          return (
            <div
              key={teacher.id}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{teacher.code}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {teacher.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  <div className="text-xs text-slate-500">{teacher.department}</div>
                </div>

                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {teacher.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 italic">"{teacher.specialization}"</p>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Dedicación Semanal</span>
                  <span className="font-mono font-bold text-slate-800">{teacher.weeklyHours} horas/semana</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cursos Asignados (2026-1)</span>
                  <span className="font-mono font-bold text-indigo-700">{teacherOfferings.length} grupos activos</span>
                </div>
              </div>

              {teacherOfferings.length > 0 && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-slate-800 block text-[11px]">Grupos a cargo:</span>
                  {teacherOfferings.map((off) => (
                    <div key={off.id} className="flex items-center justify-between text-slate-600">
                      <span className="font-mono font-medium text-slate-800">
                        {off.courseCode} ({off.group}): {off.courseName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{off.schedule}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Vincular Nuevo Docente</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombres *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Dr. Andrés"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Apellidos *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Gómez Cadavid"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cédula *</label>
                <input
                  type="text"
                  required
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  placeholder="Ej. 71923456"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Categoría Escalafón</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded"
                >
                  <option value="TITULAR">Titular</option>
                  <option value="ASOCIADO">Asociado</option>
                  <option value="ASISTENTE">Asistente</option>
                  <option value="CATEDRA">Cátedra</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Departamento</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Especialización / Área</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Ej. Inteligencia Artificial y Machine Learning"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Horas Semanales</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
                Vincular a Nómina
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Course } from '../../types/academic';
import { Search, Plus, BookOpen, GitBranch, Clock, X } from 'lucide-react';

interface CoursesModuleProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
}

export const CoursesModule: React.FC<CoursesModuleProps> = ({
  courses,
  onAddCourse,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<number | 'ALL'>('ALL');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(4);
  const [semester, setSemester] = useState(5);
  const [hoursTheory, setHoursTheory] = useState(3);
  const [hoursPractice, setHoursPractice] = useState(2);
  const [department, setDepartment] = useState('Ingeniería de Software');
  const [prereqCode, setPrereqCode] = useState('');
  const [description, setDescription] = useState('');

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSemester = semesterFilter === 'ALL' || c.semester === semesterFilter;
    return matchesSearch && matchesSemester;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    const newCourse: Course = {
      id: `crs-${Date.now()}`,
      code: code.toUpperCase(),
      name,
      credits,
      semester,
      department,
      faculty: 'Facultad de Ingeniería',
      prerequisites: prereqCode ? [prereqCode.toUpperCase()] : [],
      hoursTheory,
      hoursPractice,
      description: description || 'Contenido programático de la asignatura.',
    };

    onAddCourse(newCourse);
    setIsAddModalOpen(false);
    setCode('');
    setName('');
    setDescription('');
    setPrereqCode('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Catálogo de Asignaturas y Malla Curricular</h2>
            <span className="text-xs text-slate-500 font-mono">({filteredCourses.length} asignaturas)</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Estructura de créditos SCT, horas lectivas, silabo y grafo acíclico dirigido de pre-requisitos (DAG).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Crear Asignatura</span>
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
            placeholder="Buscar por código, asignatura o área..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => setSemesterFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              semesterFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          {[3, 4, 5, 6].map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => setSemesterFilter(sem)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                semesterFilter === sem
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semestre {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {course.code}
                </span>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  Semestre {course.semester}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">{course.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{course.department}</p>

              <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Créditos Académicos:</span>
                <span className="font-mono font-bold text-slate-900">{course.credits} SCT</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Carga Horaria:</span>
                <span className="font-mono">
                  {course.hoursTheory}h Teoría · {course.hoursPractice}h Práctica
                </span>
              </div>

              {course.prerequisites.length > 0 ? (
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
                  <GitBranch className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Pre-requisito:</span>
                  <span className="font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    {course.prerequisites.join(', ')}
                  </span>
                </div>
              ) : (
                <div className="pt-1 text-[11px] text-emerald-700 font-medium">
                  ✓ Sin pre-requisitos (Asignatura Base)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Agregar Asignatura al Plan Curricular</h3>
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
                <label className="block text-slate-700 font-semibold mb-1">Código Mnemónico *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ej. SIS-402"
                  className="w-full p-2 border border-slate-300 rounded font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Semestre Sugerido</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Nombre de la Asignatura *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Inteligencia Artificial y Redes Neuronales"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Créditos SCT</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Código Pre-requisito (Opcional)</label>
                <input
                  type="text"
                  value={prereqCode}
                  onChange={(e) => setPrereqCode(e.target.value)}
                  placeholder="Ej. SIS-301"
                  className="w-full p-2 border border-slate-300 rounded font-mono uppercase"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Descripción y Silabo</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Competencias, unidades temáticas y resultados de aprendizaje..."
                  className="w-full p-2 border border-slate-300 rounded"
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
                Registrar en Malla
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

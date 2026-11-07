/**
 * @file teachers.js
 * Módulo de Gestión Docente - UNIVERSIDAD ISAÍAS GAEL
 * 
 * Cumplimiento total de requerimientos:
 * 1. Categorías oficiales: Tiempo Completo, Medio Tiempo, Catedrático, Ocasional, Coordinador Académico.
 * 2. 11 campos completos: Código, Nombre completo, Correo institucional, Teléfono, Facultad, Programa,
 *    Tipo de vinculación, Título profesional, Nivel académico, Horas semanales, Estado.
 * 3. Métricas vivas: Cursos asignados, Estudiantes atendidos, Tutorías activas.
 * 4. Datos de ejemplo enriquecidos y realistas.
 * 5. Facultades y programas académicos coherentes.
 * 6. Tarjetas docentes con diseño moderno, iniciales, insignias y desglose de grupos.
 * 7. Persistencia completa en LocalStorage.
 * 8. Filtro por tipo de vinculación.
 * 9. Búsqueda multicriterio (Nombre, Código, Facultad, Programa) sin pérdida de foco.
 * 10. Actualización automática de estadísticas globales y de tarjetas sin recarga de página.
 */

import { Storage, ACADEMIC_FACULTIES, CONTRACT_TYPES, ACADEMIC_LEVELS, TEACHER_STATUSES } from './storage.js';
import { Auth } from './auth.js';

export const TeachersModule = {
  searchTerm: '',
  contractFilter: 'ALL',
  facultyFilter: 'ALL',
  pendingDeleteId: null,

  /**
   * Renderiza el módulo completo en el contenedor principal
   */
  render(container) {
    const canEdit = Auth.hasRole('ADMIN');

    container.innerHTML = `
      <div class="space-y-4">
        <!-- 1. Encabezado Institucional -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-indigo-subtle text-primary border px-2 py-1 font-mono" id="teachers-count-badge">
                Cargando...
              </span>
              <span class="text-muted small">·</span>
              <span class="text-muted small fw-semibold">UNIVERSIDAD ISAÍAS GAEL</span>
              <span class="text-muted small">·</span>
              <span class="badge bg-light text-secondary border font-mono">Período 2026-1</span>
            </div>
            <h2 class="h4 fw-bold text-dark mb-0">Gestión de Personal Docente</h2>
            <p class="text-muted small mb-0">
              Administración del claustro profesoral de la Universidad Isaías Gael: escalafón, vinculación, carga académica y tutorías.
            </p>
          </div>

          <div class="d-flex gap-2 align-items-center">
            <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5" id="btn-print-teachers">
              <i class="bi bi-printer"></i>
              <span>Imprimir Nómina</span>
            </button>
            ${
              canEdit
                ? `
              <button class="btn btn-sga-primary btn-sm d-flex align-items-center gap-2" id="btn-create-teacher">
                <i class="bi bi-person-plus-fill"></i>
                <span>Nuevo Docente</span>
              </button>
            `
                : ''
            }
          </div>
        </div>

        <!-- 2. Tira de Métricas Globales del Módulo Docente (Actualización Automática) -->
        <div class="row g-3" id="teachers-stats-strip">
          <!-- Inyectado dinámicamente -->
        </div>

        <!-- 3. Controles de Búsqueda y Filtros Multicriterio (Estables en el DOM para evitar pérdida de foco) -->
        <div class="sga-card p-3">
          <div class="row g-2 align-items-center justify-content-between">
            <!-- Buscador en tiempo real multicriterio (Nombre, Código, Facultad, Programa) -->
            <div class="col-12 col-md-5">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-white border-end-0 text-muted">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  id="search-teachers-input"
                  class="form-control border-start-0"
                  placeholder="Buscar por nombre, código, facultad o programa..."
                  value="${this.searchTerm}"
                  autocomplete="off"
                  aria-label="Buscar docentes"
                />
                <button
                  class="btn btn-outline-secondary ${this.searchTerm ? '' : 'd-none'}"
                  id="clear-teacher-search"
                  type="button"
                  title="Limpiar búsqueda"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <!-- Filtro por Facultad -->
            <div class="col-12 col-sm-6 col-md-3">
              <select class="form-select form-select-sm" id="filter-faculty-select">
                <option value="ALL">Todas las Facultades</option>
                ${ACADEMIC_FACULTIES.map(
                  (f) => `<option value="${f.name}" ${this.facultyFilter === f.name ? 'selected' : ''}>${f.name}</option>`
                ).join('')}
              </select>
            </div>

            <!-- Contador de Resultados -->
            <div class="col-12 col-sm-6 col-md-auto text-md-end text-muted small">
              <span id="filtered-teachers-indicator" class="fw-semibold text-dark">0 docentes</span> encontrados
            </div>
          </div>

          <!-- Filtros de Vinculación Oficiales -->
          <div class="d-flex flex-wrap align-items-center gap-1.5 mt-2.5 pt-2 border-top">
            <span class="text-muted x-small fw-semibold text-uppercase me-1">Vinculación:</span>
            <div class="btn-group btn-group-sm flex-wrap" role="group" id="teacher-contract-filter-group">
              <button
                type="button"
                class="btn btn-outline-secondary ${this.contractFilter === 'ALL' ? 'active' : ''}"
                data-contract="ALL"
              >
                Todos
              </button>
              ${CONTRACT_TYPES.map(
                (type) => `
                <button
                  type="button"
                  class="btn btn-outline-secondary ${this.contractFilter === type ? 'active' : ''}"
                  data-contract="${type}"
                >
                  ${type}
                </button>
              `
              ).join('')}
            </div>
          </div>
        </div>

        <!-- 4. Contenedor Dinámico de Tarjetas de Docentes -->
        <div class="row g-3" id="teachers-cards-container">
          <!-- Inyectado dinámicamente -->
        </div>
      </div>

      <!-- 5. Modal de Formulario: Crear / Editar Docente con los 11 Campos -->
      <div class="modal fade" id="modalTeacherForm" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <form id="form-teacher">
              <div class="modal-header">
                <div>
                  <h5 class="modal-title h6 fw-bold mb-0" id="modalTeacherTitle">Vincular Docente</h5>
                  <span class="text-muted x-small">Universidad Isaías Gael · Registro Institucional de Claustro</span>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="teacher-id" />

                <div class="row g-3">
                  <!-- Campo 1: Código Docente -->
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-semibold">Código Docente *</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light font-mono text-muted">#</span>
                      <input
                        type="text"
                        id="teacher-code"
                        class="form-control font-mono fw-bold"
                        required
                        placeholder="Ej. DOC-1044"
                      />
                      <button class="btn btn-outline-secondary" type="button" id="btn-generate-code" title="Generar código automático">
                        <i class="bi bi-magic"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Documento de Identidad -->
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-semibold">Documento de Identidad *</label>
                    <input
                      type="text"
                      id="teacher-doc"
                      class="form-control form-control-sm font-mono"
                      required
                      placeholder="Ej. 79845120"
                    />
                  </div>

                  <!-- Campo 11: Estado -->
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-semibold">Estado de Vinculación *</label>
                    <select id="teacher-status" class="form-select form-select-sm" required>
                      ${TEACHER_STATUSES.map((st) => `<option value="${st}">${st}</option>`).join('')}
                    </select>
                  </div>

                  <!-- Campo 2: Nombre Completo -->
                  <div class="col-12 col-md-8">
                    <label class="form-label small fw-semibold">Nombre Completo (con distinción académica) *</label>
                    <input
                      type="text"
                      id="teacher-fullname"
                      class="form-control form-control-sm"
                      required
                      placeholder="Ej. Dr. Roberto Guzmán Echeverri"
                    />
                  </div>

                  <!-- Campo 10: Horas Semanales -->
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-semibold">Horas Semanales *</label>
                    <div class="input-group input-group-sm">
                      <input
                        type="number"
                        id="teacher-hours"
                        class="form-control font-mono"
                        min="1"
                        max="48"
                        value="40"
                        required
                      />
                      <span class="input-group-text bg-light font-mono">h/sem</span>
                    </div>
                  </div>

                  <!-- Campo 3: Correo Institucional -->
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Correo Institucional (@isaiasgael.edu) *</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted"><i class="bi bi-envelope"></i></span>
                      <input
                        type="email"
                        id="teacher-email"
                        class="form-control"
                        required
                        placeholder="nombre.apellido@isaiasgael.edu"
                      />
                    </div>
                  </div>

                  <!-- Campo 4: Teléfono -->
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Teléfono / Celular / Extensión *</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted"><i class="bi bi-telephone"></i></span>
                      <input
                        type="text"
                        id="teacher-phone"
                        class="form-control"
                        required
                        placeholder="Ej. +57 (601) 745-9000 ext. 204 o +57 310 452 8891"
                      />
                    </div>
                  </div>

                  <!-- Campo 5: Facultad -->
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Facultad *</label>
                    <select id="teacher-faculty" class="form-select form-select-sm" required>
                      ${ACADEMIC_FACULTIES.map((fac) => `<option value="${fac.name}">${fac.name}</option>`).join('')}
                    </select>
                  </div>

                  <!-- Campo 6: Programa Académico -->
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Programa Académico Adscrito *</label>
                    <select id="teacher-program" class="form-select form-select-sm" required>
                      <!-- Opciones dinámicas según la facultad seleccionada -->
                    </select>
                  </div>

                  <!-- Campo 7: Tipo de Vinculación (5 oficiales) -->
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Tipo de Vinculación Oficial *</label>
                    <select id="teacher-contract" class="form-select form-select-sm" required>
                      ${CONTRACT_TYPES.map((c) => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                  </div>

                  <!-- Campo 9: Nivel Académico -->
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Nivel Académico Alcanzado *</label>
                    <select id="teacher-level" class="form-select form-select-sm" required>
                      ${ACADEMIC_LEVELS.map((lvl) => `<option value="${lvl}">${lvl}</option>`).join('')}
                    </select>
                  </div>

                  <!-- Campo 8: Título Profesional -->
                  <div class="col-12">
                    <label class="form-label small fw-semibold">Título Profesional Principal *</label>
                    <input
                      type="text"
                      id="teacher-title"
                      class="form-control form-control-sm"
                      required
                      placeholder="Ej. Ingeniero de Sistemas y Computación / Especialista en Ciberseguridad"
                    />
                  </div>

                  <!-- Área de Especialización o Trayectoria -->
                  <div class="col-12 col-md-8">
                    <label class="form-label small fw-semibold">Líneas de Investigación / Especialidad</label>
                    <input
                      type="text"
                      id="teacher-spec"
                      class="form-control form-control-sm"
                      placeholder="Ej. Arquitectura de Software, Computación en la Nube y Sistemas Distribuidos"
                    />
                  </div>

                  <!-- Despacho / Oficina -->
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-semibold">Ubicación / Despacho</label>
                    <input
                      type="text"
                      id="teacher-office"
                      class="form-control form-control-sm"
                      placeholder="Ej. Edificio de Ingeniería Of. 402"
                    />
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-sga-primary btn-sm">
                  <i class="bi bi-check2-circle me-1"></i> Guardar Ficha Docente
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 6. Modal de Confirmación para Desvincular / Eliminar Docente -->
      <div class="modal fade" id="modalDeleteTeacher" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content">
            <div class="modal-header border-bottom-0 pb-0">
              <h5 class="modal-title h6 fw-bold text-danger">
                <i class="bi bi-exclamation-triangle-fill me-1"></i> Desvincular Docente
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body py-3 small">
              <p class="mb-1 text-dark">¿Estás seguro de que deseas desvincular al docente de la Universidad Isaías Gael?</p>
              <div class="p-2 bg-light rounded mt-2 border">
                <strong id="delete-teacher-name" class="d-block text-dark font-mono small"></strong>
                <span id="delete-teacher-details" class="text-muted x-small d-block mt-0.5"></span>
              </div>
              <span class="text-danger x-small d-block mt-2">
                <i class="bi bi-info-circle me-1"></i> Esta acción actualizará la nómina y métricas en LocalStorage.
              </span>
            </div>
            <div class="modal-footer border-top-0 pt-0">
              <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger btn-sm" id="btn-confirm-delete-teacher">
                Confirmar Desvinculación
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. Modal de Consulta: Ficha Académica Completa del Docente -->
      <div class="modal fade" id="modalViewTeacher" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <div>
                <h5 class="modal-title h6 fw-bold mb-0">Ficha Académica del Docente</h5>
                <span class="text-muted x-small">Universidad Isaías Gael · Expediente Curricular y Carga Lectiva</span>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body p-4" id="view-teacher-content">
              <!-- Inyectado dinámicamente -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Inicializar sub-vistas y eventos
    this.updateStats(container);
    this.renderCards(container);
    this.bindStaticEvents(container);
  },

  /**
   * Actualiza en tiempo real las estadísticas globales superiores (Requisito 10)
   */
  updateStats(container) {
    const teachers = Storage.getTeachers();
    const offerings = Storage.getOfferings();
    const tutorias = Storage.getTutorias();

    const totalTeachers = teachers.length;
    const totalWeeklyHours = teachers.reduce((sum, t) => sum + (t.weeklyHours || 0), 0);
    const avgWeeklyHours = totalTeachers > 0 ? (totalWeeklyHours / totalTeachers).toFixed(1) : 0;

    // Conteo total de cursos dictados
    const totalAssignedCourses = offerings.length;

    // Total de estudiantes atendidos
    const totalStudentsServed = offerings.reduce((sum, o) => sum + (o.enrolledCount || 0), 0);

    // Total de tutorías activas
    const activeTutorias = tutorias.filter((t) => t.status !== 'COMPLETADA' && t.status !== 'CANCELADA').length;

    // Distribución por vinculación
    const countTiempoCompleto = teachers.filter((t) => (t.contractType || t.category) === 'Tiempo Completo').length;
    const countCatedraticos = teachers.filter((t) => (t.contractType || t.category) === 'Catedrático').length;
    const countCoordinadores = teachers.filter((t) => (t.contractType || t.category) === 'Coordinador Académico').length;

    const statsStrip = container.querySelector('#teachers-stats-strip');
    if (!statsStrip) return;

    statsStrip.innerHTML = `
      <div class="col-6 col-md-3 col-xl-2">
        <div class="sga-metric-card p-3">
          <span class="text-muted x-small fw-semibold d-block text-uppercase">Claustro Docente</span>
          <div class="d-flex align-items-baseline gap-2 mt-1">
            <span class="h4 fw-bold text-dark font-mono mb-0">${totalTeachers}</span>
            <span class="badge bg-primary-subtle text-primary x-small">Activos</span>
          </div>
          <span class="text-muted x-small d-block mt-1">Universidad Isaías Gael</span>
        </div>
      </div>

      <div class="col-6 col-md-3 col-xl-2">
        <div class="sga-metric-card p-3">
          <span class="text-muted x-small fw-semibold d-block text-uppercase">Cursos Ofertados</span>
          <div class="d-flex align-items-baseline gap-2 mt-1">
            <span class="h4 fw-bold text-indigo font-mono mb-0 text-primary">${totalAssignedCourses}</span>
            <span class="badge bg-indigo-subtle text-primary x-small font-mono">2026-1</span>
          </div>
          <span class="text-muted x-small d-block mt-1">Grupos con aula asignada</span>
        </div>
      </div>

      <div class="col-6 col-md-3 col-xl-3">
        <div class="sga-metric-card p-3">
          <span class="text-muted x-small fw-semibold d-block text-uppercase">Estudiantes Atendidos</span>
          <div class="d-flex align-items-baseline gap-2 mt-1">
            <span class="h4 fw-bold text-success font-mono mb-0">${totalStudentsServed}</span>
            <span class="badge bg-success-subtle text-success x-small font-mono">Cupos ocupados</span>
          </div>
          <span class="text-muted x-small d-block mt-1">Promedio: ${totalTeachers > 0 ? Math.round(totalStudentsServed / totalTeachers) : 0} por docente</span>
        </div>
      </div>

      <div class="col-6 col-md-3 col-xl-2">
        <div class="sga-metric-card p-3">
          <span class="text-muted x-small fw-semibold d-block text-uppercase">Tutorías Activas</span>
          <div class="d-flex align-items-baseline gap-2 mt-1">
            <span class="h4 fw-bold text-warning-emphasis font-mono mb-0">${activeTutorias}</span>
            <span class="badge bg-warning-subtle text-warning-emphasis x-small font-mono">En curso</span>
          </div>
          <span class="text-muted x-small d-block mt-1">Acompañamiento integral</span>
        </div>
      </div>

      <div class="col-12 col-md-12 col-xl-3">
        <div class="sga-metric-card p-3">
          <span class="text-muted x-small fw-semibold d-block text-uppercase">Vinculación & Horas</span>
          <div class="d-flex align-items-center justify-content-between mt-1">
            <span class="fw-bold text-dark font-mono small">${avgWeeklyHours} h/sem promedio</span>
            <span class="text-muted x-small font-mono">${totalWeeklyHours} h globales</span>
          </div>
          <div class="d-flex gap-1.5 mt-2 x-small">
            <span class="badge bg-light text-dark border">TC: ${countTiempoCompleto}</span>
            <span class="badge bg-light text-dark border">Cátedra: ${countCatedraticos}</span>
            <span class="badge bg-light text-dark border">Coord: ${countCoordinadores}</span>
          </div>
        </div>
      </div>
    `;

    // Actualizar badge del encabezado
    const badge = container.querySelector('#teachers-count-badge');
    if (badge) badge.textContent = `${totalTeachers} Docentes Registrados`;
  },

  /**
   * Renderiza las tarjetas de docentes aplicando filtros de búsqueda y vinculación
   */
  renderCards(container) {
    const teachers = Storage.getTeachers();
    const canEdit = Auth.hasRole('ADMIN');

    const cleanSearch = this.searchTerm.trim().toLowerCase();

    // Filtro multicriterio por Nombre, Código, Facultad, Programa (Requisito 9)
    const filtered = teachers.filter((t) => {
      const teacherName = (t.fullName || `${t.firstName || ''} ${t.lastName || ''}`).toLowerCase();
      const code = (t.code || '').toLowerCase();
      const faculty = (t.faculty || '').toLowerCase();
      const program = (t.program || '').toLowerCase();
      const professionalTitle = (t.professionalTitle || '').toLowerCase();
      const email = (t.email || '').toLowerCase();

      const matchSearch =
        !cleanSearch ||
        teacherName.includes(cleanSearch) ||
        code.includes(cleanSearch) ||
        faculty.includes(cleanSearch) ||
        program.includes(cleanSearch) ||
        professionalTitle.includes(cleanSearch) ||
        email.includes(cleanSearch);

      // Filtro por vinculación (Requisito 8)
      const teacherContract = t.contractType || t.category;
      const matchContract = this.contractFilter === 'ALL' || teacherContract === this.contractFilter;

      // Filtro por facultad
      const matchFaculty = this.facultyFilter === 'ALL' || t.faculty === this.facultyFilter;

      return matchSearch && matchContract && matchFaculty;
    });

    // Actualizar indicador de cantidad de resultados
    const indicator = container.querySelector('#filtered-teachers-indicator');
    if (indicator) {
      indicator.textContent = `${filtered.length} de ${teachers.length} docentes`;
    }

    // Botón de limpiar búsqueda
    const clearBtn = container.querySelector('#clear-teacher-search');
    if (clearBtn) {
      if (this.searchTerm) {
        clearBtn.classList.remove('d-none');
      } else {
        clearBtn.classList.add('d-none');
      }
    }

    const cardsContainer = container.querySelector('#teachers-cards-container');
    if (!cardsContainer) return;

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="p-4 bg-light rounded-3 border d-inline-block max-w-md">
            <i class="bi bi-person-x fs-1 text-muted d-block mb-2"></i>
            <h5 class="h6 fw-bold text-dark mb-1">No se encontraron docentes</h5>
            <p class="text-muted small mb-3">
              No hay coincidencias para los criterios de búsqueda o filtros seleccionados en la Universidad Isaías Gael.
            </p>
            <button class="btn btn-outline-secondary btn-sm" id="btn-reset-filters">
              <i class="bi bi-arrow-repeat me-1"></i> Restablecer Filtros
            </button>
          </div>
        </div>
      `;

      const btnReset = cardsContainer.querySelector('#btn-reset-filters');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          this.searchTerm = '';
          this.contractFilter = 'ALL';
          this.facultyFilter = 'ALL';

          const searchInput = container.querySelector('#search-teachers-input');
          if (searchInput) searchInput.value = '';

          const facSelect = container.querySelector('#filter-faculty-select');
          if (facSelect) facSelect.value = 'ALL';

          const contractGroup = container.querySelector('#teacher-contract-filter-group');
          if (contractGroup) {
            contractGroup.querySelectorAll('[data-contract]').forEach((b) => b.classList.remove('active'));
            const allBtn = contractGroup.querySelector('[data-contract="ALL"]');
            if (allBtn) allBtn.classList.add('active');
          }

          this.renderCards(container);
        });
      }
      return;
    }

    cardsContainer.innerHTML = filtered
      .map((teacher) => {
        // Cálculo de métricas en tiempo real para este docente (Requisito 3)
        const metrics = Storage.getTeacherMetrics(teacher.id);

        const fullName = teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
        const contract = teacher.contractType || teacher.category || 'Tiempo Completo';
        const initials = this.getInitials(fullName);

        // Estilos semánticos según tipo de vinculación
        const contractBadgeClass = this.getContractBadgeClass(contract);
        const avatarGradient = this.getAvatarGradient(contract);

        // Estado
        const isActivo = (teacher.status || 'Activo').toLowerCase() === 'activo';
        const statusBadge = isActivo
          ? `<span class="badge bg-success-subtle text-success border border-success-subtle font-mono x-small"><i class="bi bi-check-circle me-1"></i>${teacher.status || 'Activo'}</span>`
          : `<span class="badge bg-warning-subtle text-warning-emphasis border font-mono x-small">${teacher.status}</span>`;

        return `
        <div class="col-12 col-lg-6">
          <div class="sga-card p-3 p-md-4 h-100 d-flex flex-column justify-content-between position-relative">
            <div>
              <!-- Cabecera de la tarjeta con Avatar, Código, Estado y Vinculación -->
              <div class="d-flex align-items-start gap-3 mb-3">
                <!-- Avatar Circular estilizado -->
                <div
                  class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                  style="width: 48px; height: 48px; background: ${avatarGradient}; font-size: 1rem;"
                >
                  ${initials}
                </div>

                <!-- Info principal -->
                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-1">
                    <div class="d-flex align-items-center gap-1.5">
                      <span class="badge bg-light text-dark border font-mono x-small fw-bold">${teacher.code || 'DOC'}</span>
                      <span class="badge ${contractBadgeClass} font-mono x-small">${contract}</span>
                    </div>
                    ${statusBadge}
                  </div>

                  <h3 class="h6 fw-bold text-dark mb-0 text-truncate" title="${fullName}">
                    ${fullName}
                  </h3>

                  <div class="text-muted small text-truncate mt-0.5">
                    <span class="fw-medium text-secondary">${teacher.professionalTitle || 'Profesor Universitario'}</span>
                    ${teacher.academicLevel ? ` · <span class="badge bg-light text-secondary border x-small">${teacher.academicLevel}</span>` : ''}
                  </div>
                </div>
              </div>

              <!-- Facultad y Programa Académico Coherentes (Requisito 5) -->
              <div class="p-2.5 bg-light rounded-2 mb-3 border">
                <div class="d-flex align-items-center gap-1.5 text-truncate mb-1">
                  <i class="bi bi-building text-primary small"></i>
                  <strong class="text-dark x-small text-truncate">${teacher.faculty || 'Facultad de Ingeniería y Tecnologías'}</strong>
                </div>
                <div class="d-flex align-items-center gap-1.5 text-truncate text-muted x-small">
                  <i class="bi bi-mortarboard text-secondary"></i>
                  <span class="text-truncate">${teacher.program || 'Ingeniería de Sistemas y Computación'}</span>
                </div>
              </div>

              <!-- TIRA DE 3 MÉTRICAS VIVAS (Requisito 3) -->
              <div class="row g-2 text-center mb-3">
                <!-- Métrica 1: Cursos asignados -->
                <div class="col-4">
                  <div class="p-2 border rounded bg-white shadow-xs">
                    <span class="text-muted x-small d-block text-uppercase fw-semibold" style="font-size: 0.65rem;">Cursos Asignados</span>
                    <div class="d-flex align-items-center justify-content-center gap-1 mt-0.5">
                      <i class="bi bi-journal-check text-primary small"></i>
                      <strong class="h5 fw-bold text-dark font-mono mb-0">${metrics.cursosAsignados}</strong>
                    </div>
                    <span class="text-muted x-small d-block" style="font-size: 0.65rem;">grupos activos</span>
                  </div>
                </div>

                <!-- Métrica 2: Estudiantes atendidos -->
                <div class="col-4">
                  <div class="p-2 border rounded bg-white shadow-xs">
                    <span class="text-muted x-small d-block text-uppercase fw-semibold" style="font-size: 0.65rem;">Estudiantes</span>
                    <div class="d-flex align-items-center justify-content-center gap-1 mt-0.5">
                      <i class="bi bi-people text-success small"></i>
                      <strong class="h5 fw-bold text-success font-mono mb-0">${metrics.estudiantesAtendidos}</strong>
                    </div>
                    <span class="text-muted x-small d-block" style="font-size: 0.65rem;">atendidos en aula</span>
                  </div>
                </div>

                <!-- Métrica 3: Tutorías activas -->
                <div class="col-4">
                  <div class="p-2 border rounded bg-white shadow-xs">
                    <span class="text-muted x-small d-block text-uppercase fw-semibold" style="font-size: 0.65rem;">Tutorías Activas</span>
                    <div class="d-flex align-items-center justify-content-center gap-1 mt-0.5">
                      <i class="bi bi-chat-heart text-warning-emphasis small"></i>
                      <strong class="h5 fw-bold text-warning-emphasis font-mono mb-0">${metrics.tutoriasActivas}</strong>
                    </div>
                    <span class="text-muted x-small d-block" style="font-size: 0.65rem;">en seguimiento</span>
                  </div>
                </div>
              </div>

              <!-- Listado de Cursos Asignados con Grupo y Horario -->
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-muted x-small text-uppercase fw-semibold">
                    <i class="bi bi-calendar-week me-1"></i>Carga Académica 2026-1:
                  </span>
                  <span class="badge bg-light text-dark font-mono x-small">${teacher.weeklyHours || 40} h/sem</span>
                </div>

                ${
                  metrics.offerings.length === 0
                    ? '<div class="text-muted x-small p-2 bg-light rounded text-center">Sin cursos asignados para el período 2026-1</div>'
                    : `
                    <div class="list-group list-group-flush border rounded-2 overflow-hidden">
                      ${metrics.offerings
                        .map(
                          (o) => `
                        <div class="list-group-item p-2 d-flex justify-content-between align-items-center x-small bg-white">
                          <div class="text-truncate pe-2">
                            <span class="fw-bold text-dark font-mono">${o.courseCode} (${o.group}):</span>
                            <span class="text-secondary">${o.courseName}</span>
                            <div class="text-muted x-small font-mono mt-0.5">
                              <i class="bi bi-clock me-1"></i>${o.schedule} · <i class="bi bi-geo-alt me-0.5"></i>${o.classroom}
                            </div>
                          </div>
                          <span class="badge bg-primary-subtle text-primary font-mono flex-shrink-0">
                            ${o.enrolledCount || 0} est.
                          </span>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                  `
                }
              </div>

              <!-- Información de Contacto -->
              <div class="row g-2 small text-muted pt-2 border-top">
                <div class="col-12 col-sm-7 text-truncate">
                  <i class="bi bi-envelope text-primary me-1"></i>
                  <a href="mailto:${teacher.email}" class="text-decoration-none text-muted font-mono x-small text-truncate">
                    ${teacher.email}
                  </a>
                </div>
                <div class="col-12 col-sm-5 text-sm-end text-truncate">
                  <i class="bi bi-telephone text-success me-1"></i>
                  <span class="font-mono x-small">${teacher.phone || '+57 (601) 745-9000'}</span>
                </div>
              </div>
            </div>

            <!-- Botones de Acción (Ver Ficha, Editar, Eliminar) -->
            <div class="d-flex justify-content-between align-items-center gap-2 pt-3 mt-3 border-top">
              <button class="btn btn-outline-secondary btn-sm btn-view-teacher d-flex align-items-center gap-1" data-id="${teacher.id}">
                <i class="bi bi-eye"></i>
                <span>Ver Ficha</span>
              </button>

              <div class="d-flex gap-1.5">
                ${
                  canEdit
                    ? `
                  <button class="btn btn-outline-primary btn-sm btn-edit-teacher d-flex align-items-center gap-1" data-id="${teacher.id}">
                    <i class="bi bi-pencil-square"></i>
                    <span>Editar</span>
                  </button>
                  <button class="btn btn-outline-danger btn-sm btn-delete-teacher d-flex align-items-center gap-1" data-id="${teacher.id}">
                    <i class="bi bi-trash"></i>
                    <span>Desvincular</span>
                  </button>
                `
                    : ''
                }
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    this.bindCardEvents(container);
  },

  /**
   * Vincula eventos estáticos del contenedor (Buscadores, filtros, formularios, modales)
   */
  bindStaticEvents(container) {
    // 1. Buscador en tiempo real multicriterio SIN pérdida de foco (Requisito 9)
    const searchInput = container.querySelector('#search-teachers-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.renderCards(container);
      });
    }

    // 2. Botón para limpiar búsqueda
    const clearBtn = container.querySelector('#clear-teacher-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.searchTerm = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        this.renderCards(container);
      });
    }

    // 3. Filtro por tipo de vinculación (Requisito 8)
    const contractGroup = container.querySelector('#teacher-contract-filter-group');
    if (contractGroup) {
      contractGroup.querySelectorAll('[data-contract]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          contractGroup.querySelectorAll('[data-contract]').forEach((b) => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          this.contractFilter = e.currentTarget.getAttribute('data-contract');
          this.renderCards(container);
        });
      });
    }

    // 4. Filtro por Facultad
    const facultySelect = container.querySelector('#filter-faculty-select');
    if (facultySelect) {
      facultySelect.addEventListener('change', (e) => {
        this.facultyFilter = e.target.value;
        this.renderCards(container);
      });
    }

    // 5. Botón de Imprimir Nómina
    const btnPrint = container.querySelector('#btn-print-teachers');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // 6. Botón de Nuevo Docente
    const btnCreate = container.querySelector('#btn-create-teacher');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        const form = container.querySelector('#form-teacher');
        form.reset();

        container.querySelector('#teacher-id').value = '';
        container.querySelector('#modalTeacherTitle').textContent = 'Vincular Docente · Universidad Isaías Gael';

        // Auto-generar código sugerido
        const teachers = Storage.getTeachers();
        const nextNum = 1040 + teachers.length + Math.floor(Math.random() * 5);
        container.querySelector('#teacher-code').value = `DOC-${nextNum}`;

        // Cargar programas para la primera facultad
        this.populateProgramsDropdown(container, ACADEMIC_FACULTIES[0].name);

        const modal = new window.bootstrap.Modal(container.querySelector('#modalTeacherForm'));
        modal.show();
      });
    }

    // 7. Botón de generar código en modal
    const btnGenCode = container.querySelector('#btn-generate-code');
    if (btnGenCode) {
      btnGenCode.addEventListener('click', () => {
        const codeInput = container.querySelector('#teacher-code');
        const randNum = Math.floor(1000 + Math.random() * 9000);
        codeInput.value = `DOC-${randNum}`;
      });
    }

    // 8. Cambio dinámico de programas al seleccionar facultad en modal
    const facultyModalSelect = container.querySelector('#teacher-faculty');
    if (facultyModalSelect) {
      facultyModalSelect.addEventListener('change', (e) => {
        this.populateProgramsDropdown(container, e.target.value);
      });
    }

    // 9. Auto-ajuste de horas al seleccionar vinculación
    const contractModalSelect = container.querySelector('#teacher-contract');
    if (contractModalSelect) {
      contractModalSelect.addEventListener('change', (e) => {
        const hoursInput = container.querySelector('#teacher-hours');
        const val = e.target.value;
        if (val === 'Tiempo Completo' || val === 'Coordinador Académico') {
          hoursInput.value = 40;
        } else if (val === 'Medio Tiempo' || val === 'Ocasional') {
          hoursInput.value = 20;
        } else if (val === 'Catedrático') {
          hoursInput.value = 16;
        }
      });
    }

    // 10. Envío del formulario de docente (Crear / Modificar) -> Auto actualiza estadísticas (Requisito 10)
    const form = container.querySelector('#form-teacher');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = container.querySelector('#teacher-id').value || `doc-${Date.now()}`;
        const isNew = !container.querySelector('#teacher-id').value;

        const codeVal = container.querySelector('#teacher-code').value.trim() || `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
        const fullNameVal = container.querySelector('#teacher-fullname').value.trim();
        const emailVal = container.querySelector('#teacher-email').value.trim();
        const phoneVal = container.querySelector('#teacher-phone').value.trim();
        const facultyVal = container.querySelector('#teacher-faculty').value;
        const programVal = container.querySelector('#teacher-program').value;
        const contractVal = container.querySelector('#teacher-contract').value;
        const levelVal = container.querySelector('#teacher-level').value;
        const titleVal = container.querySelector('#teacher-title').value.trim();
        const hoursVal = parseInt(container.querySelector('#teacher-hours').value, 10) || 40;
        const statusVal = container.querySelector('#teacher-status').value;
        const specVal = container.querySelector('#teacher-spec').value.trim();
        const officeVal = container.querySelector('#teacher-office').value.trim();
        const docVal = container.querySelector('#teacher-doc').value.trim();

        // Dividir nombre y apellido para compatibilidad con módulos anteriores
        const nameParts = fullNameVal.replace(/^(Dr\.|Dra\.|Ing\.|Mag\.|Esp\.|Lic\.)\s*/i, '').trim().split(' ');
        const firstName = nameParts[0] || 'Docente';
        const lastName = nameParts.slice(1).join(' ') || 'Isaías Gael';

        const teacherRecord = {
          id,
          code: codeVal,
          fullName: fullNameVal,
          firstName,
          lastName,
          documentId: docVal,
          email: emailVal,
          phone: phoneVal,
          faculty: facultyVal,
          program: programVal,
          department: programVal,
          contractType: contractVal,
          category: contractVal,
          academicLevel: levelVal,
          professionalTitle: titleVal,
          weeklyHours: hoursVal,
          status: statusVal,
          specialization: specVal || 'Docencia e Investigación Universitaria',
          office: officeVal || 'Campus Central Universidad Isaías Gael',
        };

        if (isNew) {
          teacherRecord.admissionDate = new Date().toISOString().split('T')[0];
        } else {
          const current = Storage.getTeachers().find((t) => t.id === id);
          if (current) {
            teacherRecord.admissionDate = current.admissionDate || '2022-01-15';
          }
        }

        // Guardar en LocalStorage
        Storage.saveTeacher(teacherRecord);

        // Ocultar modal
        const modalEl = container.querySelector('#modalTeacherForm');
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        // Actualizar estadísticas superiores y tarjetas en tiempo real sin recargar página (Requisito 10)
        this.updateStats(container);
        this.renderCards(container);
      });
    }

    // 11. Confirmación de desvinculación / eliminación (Requisito 10)
    const btnConfirmDelete = container.querySelector('#btn-confirm-delete-teacher');
    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener('click', () => {
        if (this.pendingDeleteId) {
          Storage.deleteTeacher(this.pendingDeleteId);
          this.pendingDeleteId = null;

          const modalEl = container.querySelector('#modalDeleteTeacher');
          const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();

          // Actualizar estadísticas superiores y tarjetas en tiempo real (Requisito 10)
          this.updateStats(container);
          this.renderCards(container);
        }
      });
    }
  },

  /**
   * Vincula eventos dinámicos de cada tarjeta de docente
   */
  bindCardEvents(container) {
    // 1. Ver Ficha Docente Completa
    container.querySelectorAll('.btn-view-teacher').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const teacher = Storage.getTeachers().find((t) => t.id === id);
        if (!teacher) return;

        this.showTeacherDossier(container, teacher);
      });
    });

    // 2. Editar Docente
    container.querySelectorAll('.btn-edit-teacher').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const teacher = Storage.getTeachers().find((t) => t.id === id);
        if (!teacher) return;

        container.querySelector('#teacher-id').value = teacher.id;
        container.querySelector('#teacher-code').value = teacher.code;
        container.querySelector('#teacher-doc').value = teacher.documentId || '';
        container.querySelector('#teacher-status').value = teacher.status || 'Activo';
        container.querySelector('#teacher-fullname').value = teacher.fullName || `${teacher.firstName} ${teacher.lastName}`;
        container.querySelector('#teacher-hours').value = teacher.weeklyHours || 40;
        container.querySelector('#teacher-email').value = teacher.email;
        container.querySelector('#teacher-phone').value = teacher.phone || '';
        container.querySelector('#teacher-faculty').value = teacher.faculty || ACADEMIC_FACULTIES[0].name;

        // Actualizar opciones de programa y seleccionar
        this.populateProgramsDropdown(container, teacher.faculty || ACADEMIC_FACULTIES[0].name);
        container.querySelector('#teacher-program').value = teacher.program || '';

        container.querySelector('#teacher-contract').value = teacher.contractType || teacher.category || 'Tiempo Completo';
        container.querySelector('#teacher-level').value = teacher.academicLevel || 'Maestría';
        container.querySelector('#teacher-title').value = teacher.professionalTitle || '';
        container.querySelector('#teacher-spec').value = teacher.specialization || '';
        container.querySelector('#teacher-office').value = teacher.office || '';

        container.querySelector('#modalTeacherTitle').textContent = `Editar Docente: ${teacher.code} · ${teacher.fullName || teacher.firstName}`;

        const modal = new window.bootstrap.Modal(container.querySelector('#modalTeacherForm'));
        modal.show();
      });
    });

    // 3. Desvincular / Eliminar Docente
    container.querySelectorAll('.btn-delete-teacher').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const teacher = Storage.getTeachers().find((t) => t.id === id);
        if (!teacher) return;

        this.pendingDeleteId = id;
        container.querySelector('#delete-teacher-name').textContent = `${teacher.fullName || `${teacher.firstName} ${teacher.lastName}`} (${teacher.code})`;
        container.querySelector('#delete-teacher-details').textContent = `${teacher.faculty} · ${teacher.contractType || teacher.category}`;

        const modal = new window.bootstrap.Modal(container.querySelector('#modalDeleteTeacher'));
        modal.show();
      });
    });
  },

  /**
   * Despliega la ficha o expediente docente en el modal de consulta
   */
  showTeacherDossier(container, teacher) {
    const metrics = Storage.getTeacherMetrics(teacher.id);
    const fullName = teacher.fullName || `${teacher.firstName} ${teacher.lastName}`;
    const contract = teacher.contractType || teacher.category;
    const initials = this.getInitials(fullName);
    const avatarGradient = this.getAvatarGradient(contract);
    const contractBadgeClass = this.getContractBadgeClass(contract);

    const contentEl = container.querySelector('#view-teacher-content');
    if (!contentEl) return;

    contentEl.innerHTML = `
      <!-- Cabecera Institucional del Expediente -->
      <div class="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom">
        <div
          class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow"
          style="width: 60px; height: 60px; background: ${avatarGradient}; font-size: 1.25rem;"
        >
          ${initials}
        </div>
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-light text-dark border font-mono">${teacher.code}</span>
            <span class="badge ${contractBadgeClass}">${contract}</span>
            <span class="badge bg-success-subtle text-success border font-mono">${teacher.status || 'Activo'}</span>
          </div>
          <h4 class="h5 fw-bold text-dark mb-0">${fullName}</h4>
          <span class="text-secondary small">${teacher.professionalTitle} · ${teacher.academicLevel}</span>
        </div>
      </div>

      <!-- Resumen de Métricas -->
      <div class="row g-2 text-center mb-4">
        <div class="col-4">
          <div class="p-3 bg-light rounded border">
            <span class="text-muted x-small d-block text-uppercase">Cursos Asignados</span>
            <span class="h4 font-mono fw-bold text-primary mb-0">${metrics.cursosAsignados}</span>
            <span class="text-muted x-small d-block">grupos período 2026-1</span>
          </div>
        </div>
        <div class="col-4">
          <div class="p-3 bg-light rounded border">
            <span class="text-muted x-small d-block text-uppercase">Estudiantes Atendidos</span>
            <span class="h4 font-mono fw-bold text-success mb-0">${metrics.estudiantesAtendidos}</span>
            <span class="text-muted x-small d-block">cupos en aula</span>
          </div>
        </div>
        <div class="col-4">
          <div class="p-3 bg-light rounded border">
            <span class="text-muted x-small d-block text-uppercase">Tutorías Activas</span>
            <span class="h4 font-mono fw-bold text-warning-emphasis mb-0">${metrics.tutoriasActivas}</span>
            <span class="text-muted x-small d-block">en seguimiento</span>
          </div>
        </div>
      </div>

      <!-- Datos Académicos y Administrativos -->
      <div class="row g-3 small mb-4">
        <div class="col-12 col-md-6">
          <div class="p-3 bg-light rounded border h-100">
            <h6 class="fw-bold text-dark mb-2"><i class="bi bi-mortarboard text-primary me-1"></i> Adscripción Académica</h6>
            <div class="mb-1.5"><strong>Facultad:</strong> <span class="text-secondary">${teacher.faculty}</span></div>
            <div class="mb-1.5"><strong>Programa:</strong> <span class="text-secondary">${teacher.program}</span></div>
            <div class="mb-1.5"><strong>Línea / Especialidad:</strong> <span class="text-secondary">${teacher.specialization || 'Docencia e Investigación'}</span></div>
            <div><strong>Ubicación / Despacho:</strong> <span class="text-secondary">${teacher.office || 'Campus Isaías Gael'}</span></div>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="p-3 bg-light rounded border h-100">
            <h6 class="fw-bold text-dark mb-2"><i class="bi bi-card-checklist text-primary me-1"></i> Información Contractual</h6>
            <div class="mb-1.5"><strong>Documento ID:</strong> <span class="font-mono text-secondary">${teacher.documentId || 'N/A'}</span></div>
            <div class="mb-1.5"><strong>Dedicación:</strong> <span class="font-mono text-secondary">${teacher.weeklyHours || 40} horas semanales</span></div>
            <div class="mb-1.5"><strong>Correo Institucional:</strong> <span class="font-mono text-secondary">${teacher.email}</span></div>
            <div><strong>Teléfono Contacto:</strong> <span class="font-mono text-secondary">${teacher.phone || '+57 (601) 745-9000'}</span></div>
          </div>
        </div>
      </div>

      <!-- Detalle de Ofertas Asignadas -->
      <div class="mb-4">
        <h6 class="fw-bold text-dark mb-2">
          <i class="bi bi-book-half text-primary me-1"></i> Asignaturas a Cargo en Período 2026-1 (${metrics.offerings.length})
        </h6>
        ${
          metrics.offerings.length === 0
            ? '<p class="text-muted small">No tiene asignaturas registradas para este período.</p>'
            : `
            <div class="table-responsive border rounded">
              <table class="table sga-table mb-0">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Asignatura</th>
                    <th>Grupo</th>
                    <th>Horario</th>
                    <th>Aula</th>
                    <th class="text-end">Inscritos</th>
                  </tr>
                </thead>
                <tbody>
                  ${metrics.offerings
                    .map(
                      (o) => `
                    <tr>
                      <td class="font-mono fw-bold">${o.courseCode}</td>
                      <td>${o.courseName}</td>
                      <td><span class="badge bg-light text-dark border font-mono">${o.group}</span></td>
                      <td class="font-mono x-small">${o.schedule}</td>
                      <td class="x-small">${o.classroom}</td>
                      <td class="text-end font-mono fw-bold">${o.enrolledCount || 0} / ${o.capacity || 30}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
        }
      </div>

      <!-- Detalle de Tutorías Asignadas -->
      <div>
        <h6 class="fw-bold text-dark mb-2">
          <i class="bi bi-chat-dots text-primary me-1"></i> Tutorías y Asesorías Académicas (${metrics.tutorias.length})
        </h6>
        ${
          metrics.tutorias.length === 0
            ? '<p class="text-muted small mb-0">No registra tutorías asignadas en el período activo.</p>'
            : `
            <div class="list-group list-group-flush border rounded">
              ${metrics.tutorias
                .map(
                  (t) => `
                <div class="list-group-item p-2.5 small">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="text-dark">${t.studentName}</strong>
                    <span class="badge bg-warning-subtle text-warning-emphasis font-mono x-small">${t.status}</span>
                  </div>
                  <div class="text-secondary x-small mb-1">
                    <strong>Tema:</strong> ${t.topic} · <strong>Asignatura:</strong> ${t.courseCode}
                  </div>
                  <div class="text-muted font-mono x-small">
                    <i class="bi bi-calendar-event me-1"></i>Programada: ${t.dateScheduled}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
        }
      </div>
    `;

    const modal = new window.bootstrap.Modal(container.querySelector('#modalViewTeacher'));
    modal.show();
  },

  /**
   * Llena dinámicamente el selector de programas según la facultad seleccionada
   */
  populateProgramsDropdown(container, facultyName) {
    const programSelect = container.querySelector('#teacher-program');
    if (!programSelect) return;

    const faculty = ACADEMIC_FACULTIES.find((f) => f.name === facultyName) || ACADEMIC_FACULTIES[0];
    programSelect.innerHTML = faculty.programs.map((p) => `<option value="${p}">${p}</option>`).join('');
  },

  /**
   * Obtiene las iniciales de un nombre (e.g. "Dr. Roberto Guzmán" -> "RG")
   */
  getInitials(name) {
    if (!name) return 'UN';
    const clean = name.replace(/^(Dr\.|Dra\.|Ing\.|Mag\.|Esp\.|Lic\.)\s*/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  },

  /**
   * Obtiene la clase CSS para el badge de tipo de vinculación
   */
  getContractBadgeClass(contract) {
    switch (contract) {
      case 'Tiempo Completo':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'Medio Tiempo':
        return 'bg-info-subtle text-info-emphasis border border-info-subtle';
      case 'Catedrático':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'Ocasional':
        return 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle';
      case 'Coordinador Académico':
        return 'bg-purple-subtle text-purple border border-indigo-subtle';
      default:
        return 'bg-light text-dark border';
    }
  },

  /**
   * Gradiente para avatar según tipo de vinculación
   */
  getAvatarGradient(contract) {
    switch (contract) {
      case 'Tiempo Completo':
        return 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
      case 'Medio Tiempo':
        return 'linear-gradient(135deg, #0f766e, #14b8a6)';
      case 'Catedrático':
        return 'linear-gradient(135deg, #b45309, #f59e0b)';
      case 'Ocasional':
        return 'linear-gradient(135deg, #6b21a8, #a855f7)';
      case 'Coordinador Académico':
        return 'linear-gradient(135deg, #15803d, #22c55e)';
      default:
        return 'linear-gradient(135deg, #334155, #64748b)';
    }
  },
};

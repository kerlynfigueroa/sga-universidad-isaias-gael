/**
 * @file courses.js
 * Módulo de Gestión de Asignaturas - UNIVERSIDAD ISAÍAS GAEL
 * CRUD completo sin recarga de página, búsqueda sin pérdida de foco y confirmación modal de eliminación.
 */

import { Storage } from './storage.js';
import { Auth } from './auth.js';

export const CoursesModule = {
  searchTerm: '',
  semesterFilter: 'ALL',
  pendingDeleteId: null,

  render(container) {
    const canEdit = Auth.hasRole('ADMIN');

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Encabezado -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-indigo-subtle text-primary border px-2 py-1 font-mono" id="courses-count-badge">
                Cargando...
              </span>
              <span class="text-muted small">·</span>
              <span class="text-muted small">Universidad Isaías Gael</span>
            </div>
            <h2 class="h4 fw-bold text-dark mb-0">Gestión de Asignaturas</h2>
            <p class="text-muted small mb-0">
              Malla curricular oficial de la Universidad Isaías Gael, créditos académicos (SCT), horas de docencia y requisitos.
            </p>
          </div>

          ${
            canEdit
              ? `
            <button class="btn btn-sga-primary btn-sm d-flex align-items-center gap-2" id="btn-create-course">
              <i class="bi bi-journal-plus"></i>
              <span>Crear Asignatura</span>
            </button>
          `
              : ''
          }
        </div>

        <!-- Búsqueda y Filtros por Semestre (Estables) -->
        <div class="row g-2 align-items-center justify-content-between">
          <div class="col-12 col-md-5">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                id="search-courses-input"
                class="form-control border-start-0"
                placeholder="Buscar por código, materia o área..."
                value="${this.searchTerm}"
                autocomplete="off"
              />
              <button class="btn btn-outline-secondary ${this.searchTerm ? '' : 'd-none'}" id="clear-course-search" type="button">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <div class="col-12 col-md-auto">
            <div class="btn-group btn-group-sm" role="group" id="course-semester-group">
              <button type="button" class="btn btn-outline-secondary ${this.semesterFilter === 'ALL' ? 'active' : ''}" data-sem="ALL">Todos</button>
              <button type="button" class="btn btn-outline-secondary ${this.semesterFilter === '3' ? 'active' : ''}" data-sem="3">Sem. 3</button>
              <button type="button" class="btn btn-outline-secondary ${this.semesterFilter === '4' ? 'active' : ''}" data-sem="4">Sem. 4</button>
              <button type="button" class="btn btn-outline-secondary ${this.semesterFilter === '5' ? 'active' : ''}" data-sem="5">Sem. 5</button>
              <button type="button" class="btn btn-outline-secondary ${this.semesterFilter === '6' ? 'active' : ''}" data-sem="6">Sem. 6</button>
            </div>
          </div>
        </div>

        <!-- Grid dinámico de Asignaturas -->
        <div class="row g-3" id="courses-grid-container"></div>
      </div>

      <!-- Modal para Crear / Editar Asignatura -->
      <div class="modal fade" id="modalCourseForm" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-md modal-dialog-centered">
          <div class="modal-content">
            <form id="form-course">
              <div class="modal-header">
                <h5 class="modal-title h6 fw-bold" id="modalCourseTitle">Crear Asignatura</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="course-id" />
                <div class="row g-3">
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-semibold">Código *</label>
                    <input type="text" id="course-code" class="form-control form-control-sm font-mono text-uppercase" required placeholder="Ej. SIS-402" />
                  </div>
                  <div class="col-12 col-md-8">
                    <label class="form-label small fw-semibold">Nombre de la Asignatura *</label>
                    <input type="text" id="course-name" class="form-control form-control-sm" required placeholder="Ej. Inteligencia Artificial" />
                  </div>
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-semibold">Créditos SCT</label>
                    <input type="number" id="course-credits" class="form-control form-control-sm font-mono" min="1" max="12" value="4" required />
                  </div>
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-semibold">Semestre</label>
                    <input type="number" id="course-semester" class="form-control form-control-sm font-mono" min="1" max="12" value="5" required />
                  </div>
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-semibold">Pre-requisito</label>
                    <input type="text" id="course-prereq" class="form-control form-control-sm font-mono text-uppercase" placeholder="Ej. SIS-301" />
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-semibold">Departamento Responsable</label>
                    <input type="text" id="course-dept" class="form-control form-control-sm" value="Ingeniería de Software" required />
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-semibold">Descripción del Silabo</label>
                    <textarea id="course-desc" class="form-control form-control-sm" rows="3" placeholder="Objetivos y contenidos mínimos..."></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-sga-primary btn-sm">Guardar Asignatura</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmación para Eliminar Asignatura -->
      <div class="modal fade" id="modalDeleteCourse" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content">
            <div class="modal-header border-bottom-0 pb-0">
              <h5 class="modal-title h6 fw-bold text-danger">
                <i class="bi bi-exclamation-triangle-fill me-1"></i> Eliminar Asignatura
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body py-3 small">
              <p class="mb-1 text-dark">¿Confirmas la eliminación de la materia?</p>
              <strong id="delete-course-name" class="d-block text-danger font-mono small"></strong>
              <span class="text-muted x-small d-block mt-2">Esta acción actualizará la malla en LocalStorage.</span>
            </div>
            <div class="modal-footer border-top-0 pt-0">
              <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger btn-sm" id="btn-confirm-delete-course">
                Eliminar Asignatura
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderGrid(container);
    this.bindStaticEvents(container);
  },

  renderGrid(container) {
    const courses = Storage.getCourses();
    const canEdit = Auth.hasRole('ADMIN');

    const filtered = courses.filter((c) => {
      const matchSearch =
        c.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.department.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchSemester = this.semesterFilter === 'ALL' || c.semester.toString() === this.semesterFilter;
      return matchSearch && matchSemester;
    });

    const badge = container.querySelector('#courses-count-badge');
    if (badge) badge.textContent = `${filtered.length} Asignaturas`;

    const clearBtn = container.querySelector('#clear-course-search');
    if (clearBtn) {
      if (this.searchTerm) {
        clearBtn.classList.remove('d-none');
      } else {
        clearBtn.classList.add('d-none');
      }
    }

    const grid = container.querySelector('#courses-grid-container');
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5 text-muted">
          No se encontraron asignaturas para los filtros seleccionados.
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map(
        (course) => `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="sga-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start gap-2 mb-2 pb-2 border-bottom">
                <span class="font-mono fw-bold text-primary px-2 py-0.5 rounded bg-primary-subtle border border-primary-subtle small">
                  ${course.code}
                </span>
                <span class="badge bg-light text-dark border">
                  Semestre ${course.semester}
                </span>
              </div>

              <h3 class="h6 fw-bold text-dark mb-1">${course.name}</h3>
              <span class="text-muted small d-block mb-2">${course.department} · Univ. Isaías Gael</span>

              <p class="text-muted x-small mb-3 line-clamp-2">
                ${course.description}
              </p>
            </div>

            <div>
              <div class="p-2 bg-light rounded x-small space-y-1 mb-3">
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Créditos Académicos:</span>
                  <strong class="font-mono text-dark">${course.credits} SCT</strong>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Horas Semanales:</span>
                  <span class="font-mono text-muted">${course.hoursTheory}h Teoría · ${course.hoursPractice}h Práctica</span>
                </div>
              </div>

              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="x-small text-muted">Pre-requisito:</span>
                ${
                  course.prerequisites && course.prerequisites.length > 0
                    ? `<span class="badge bg-warning-subtle text-warning-emphasis font-mono x-small">${course.prerequisites.join(', ')}</span>`
                    : `<span class="badge bg-success-subtle text-success font-mono x-small">Ninguno</span>`
                }
              </div>

              ${
                canEdit
                  ? `
                <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button class="btn btn-outline-primary btn-sm btn-edit-course" data-id="${course.id}">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-sm btn-delete-course" data-id="${course.id}">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              `
                  : ''
              }
            </div>
          </div>
        </div>
      `
      )
      .join('');

    this.bindGridEvents(container);
  },

  bindStaticEvents(container) {
    const searchInput = container.querySelector('#search-courses-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.renderGrid(container);
      });
    }

    const clearBtn = container.querySelector('#clear-course-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.searchTerm = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        this.renderGrid(container);
      });
    }

    const semGroup = container.querySelector('#course-semester-group');
    if (semGroup) {
      semGroup.querySelectorAll('[data-sem]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          semGroup.querySelectorAll('[data-sem]').forEach((b) => b.classList.remove('active'));
          e.target.classList.add('active');
          this.semesterFilter = e.target.getAttribute('data-sem');
          this.renderGrid(container);
        });
      });
    }

    const btnCreate = container.querySelector('#btn-create-course');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        const form = container.querySelector('#form-course');
        form.reset();
        container.querySelector('#course-id').value = '';
        container.querySelector('#modalCourseTitle').textContent = 'Crear Nueva Asignatura · Universidad Isaías Gael';
        const modal = new window.bootstrap.Modal(container.querySelector('#modalCourseForm'));
        modal.show();
      });
    }

    const form = container.querySelector('#form-course');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = container.querySelector('#course-id').value || `crs-${Date.now()}`;
        const prereq = container.querySelector('#course-prereq').value.trim();

        const course = {
          id,
          code: container.querySelector('#course-code').value.trim().toUpperCase(),
          name: container.querySelector('#course-name').value.trim(),
          credits: parseInt(container.querySelector('#course-credits').value, 10) || 4,
          semester: parseInt(container.querySelector('#course-semester').value, 10) || 1,
          department: container.querySelector('#course-dept').value.trim(),
          faculty: 'Facultad de Ingeniería',
          prerequisites: prereq ? [prereq.toUpperCase()] : [],
          hoursTheory: 3,
          hoursPractice: 2,
          description: container.querySelector('#course-desc').value.trim() || 'Contenido curricular oficial de la Universidad Isaías Gael.',
        };

        Storage.saveCourse(course);

        const modalEl = container.querySelector('#modalCourseForm');
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        this.renderGrid(container);
      });
    }

    const btnConfirmDelete = container.querySelector('#btn-confirm-delete-course');
    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener('click', () => {
        if (this.pendingDeleteId) {
          Storage.deleteCourse(this.pendingDeleteId);
          this.pendingDeleteId = null;

          const modalEl = container.querySelector('#modalDeleteCourse');
          const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();

          this.renderGrid(container);
        }
      });
    }
  },

  bindGridEvents(container) {
    container.querySelectorAll('.btn-edit-course').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const course = Storage.getCourses().find((c) => c.id === id);
        if (!course) return;

        container.querySelector('#course-id').value = course.id;
        container.querySelector('#course-code').value = course.code;
        container.querySelector('#course-name').value = course.name;
        container.querySelector('#course-credits').value = course.credits;
        container.querySelector('#course-semester').value = course.semester;
        container.querySelector('#course-dept').value = course.department;
        container.querySelector('#course-desc').value = course.description;
        container.querySelector('#course-prereq').value = (course.prerequisites || []).join(', ');

        container.querySelector('#modalCourseTitle').textContent = `Editar Asignatura: ${course.code}`;

        const modal = new window.bootstrap.Modal(container.querySelector('#modalCourseForm'));
        modal.show();
      });
    });

    container.querySelectorAll('.btn-delete-course').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const course = Storage.getCourses().find((c) => c.id === id);
        if (!course) return;

        this.pendingDeleteId = id;
        container.querySelector('#delete-course-name').textContent = `${course.name} (${course.code})`;

        const modal = new window.bootstrap.Modal(container.querySelector('#modalDeleteCourse'));
        modal.show();
      });
    });
  },
};

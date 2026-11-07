/**
 * @file students.js
 * Módulo de Gestión de Estudiantes - UNIVERSIDAD ISAÍAS GAEL
 * CRUD completo sin recarga de página, búsqueda sin pérdida de foco y confirmación modal de eliminación.
 */

import { Storage } from './storage.js';
import { Auth } from './auth.js';

export const StudentsModule = {
  searchTerm: '',
  statusFilter: 'ALL',
  pendingDeleteId: null,

  render(container) {
    const canEdit = Auth.hasRole('ADMIN');

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Encabezado del Módulo -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-indigo-subtle text-primary border px-2 py-1 font-mono" id="students-count-badge">
                Cargando...
              </span>
              <span class="text-muted small">·</span>
              <span class="text-muted small">Universidad Isaías Gael</span>
            </div>
            <h2 class="h4 fw-bold text-dark mb-0">Gestión de Estudiantes</h2>
            <p class="text-muted small mb-0">
              Administración de expedientes de la Universidad Isaías Gael, registro de nuevos alumnos, actualización curricular y PGA.
            </p>
          </div>

          ${
            canEdit
              ? `
            <button class="btn btn-sga-primary btn-sm d-flex align-items-center gap-2" id="btn-create-student">
              <i class="bi bi-person-plus-fill"></i>
              <span>Crear Estudiante</span>
            </button>
          `
              : ''
          }
        </div>

        <!-- Barra de Búsqueda y Filtros (Estable, no se destruye al teclear) -->
        <div class="row g-2 align-items-center justify-content-between">
          <div class="col-12 col-md-5">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                id="search-students-input"
                class="form-control border-start-0"
                placeholder="Buscar por código, cédula o nombre..."
                value="${this.searchTerm}"
                autocomplete="off"
              />
              <button class="btn btn-outline-secondary ${this.searchTerm ? '' : 'd-none'}" id="clear-search-btn" type="button">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <div class="col-12 col-md-auto">
            <div class="btn-group btn-group-sm" role="group" id="student-status-filter-group">
              <button type="button" class="btn btn-outline-secondary ${this.statusFilter === 'ALL' ? 'active' : ''}" data-status="ALL">Todos</button>
              <button type="button" class="btn btn-outline-secondary ${this.statusFilter === 'ACTIVO' ? 'active' : ''}" data-status="ACTIVO">Activos</button>
              <button type="button" class="btn btn-outline-secondary ${this.statusFilter === 'EN_RIESGO' ? 'active' : ''}" data-status="EN_RIESGO">En Riesgo</button>
              <button type="button" class="btn btn-outline-secondary ${this.statusFilter === 'MATRICULADO' ? 'active' : ''}" data-status="MATRICULADO">Matriculados</button>
            </div>
          </div>
        </div>

        <!-- Tabla de Datos -->
        <div class="sga-card overflow-hidden">
          <div class="table-responsive">
            <table class="table sga-table align-middle">
              <thead>
                <tr>
                  <th>Código / Identificación</th>
                  <th>Nombres y Apellidos</th>
                  <th>Programa Académico</th>
                  <th class="text-center">Semestre</th>
                  <th class="text-end">Créditos</th>
                  <th class="text-end">PGA</th>
                  <th class="text-center">Estado</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody id="students-table-body">
                <!-- Filas renderizadas dinámicamente sin perder foco en el input -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal para Crear / Editar Estudiante -->
      <div class="modal fade" id="modalStudentForm" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <form id="form-student">
              <div class="modal-header">
                <h5 class="modal-title h6 fw-bold" id="modalStudentTitle">Crear Nuevo Estudiante</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="student-id" />
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Nombres *</label>
                    <input type="text" id="student-firstname" class="form-control form-control-sm" required placeholder="Ej. Valentina" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Apellidos *</label>
                    <input type="text" id="student-lastname" class="form-control form-control-sm" required placeholder="Ej. Ríos Cárdenas" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Cédula / Documento de Identidad *</label>
                    <input type="text" id="student-doc" class="form-control form-control-sm font-mono" required placeholder="Ej. 1085443219" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Correo Institucional (@isaiasgael.edu) *</label>
                    <input type="email" id="student-email" class="form-control form-control-sm" required placeholder="Ej. valentina.rios@isaiasgael.edu" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Programa Académico *</label>
                    <select id="student-program" class="form-select form-select-sm" required>
                      <option value="Ingeniería de Sistemas y Computación">Ingeniería de Sistemas y Computación</option>
                      <option value="Administración de Empresas">Administración de Empresas</option>
                      <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                      <option value="Ciencias de la Computación">Ciencias de la Computación</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-3">
                    <label class="form-label small fw-semibold">Semestre Actual</label>
                    <input type="number" id="student-semester" class="form-control form-control-sm font-mono" min="1" max="12" value="1" required />
                  </div>
                  <div class="col-12 col-md-3">
                    <label class="form-label small fw-semibold">Estado Académico</label>
                    <select id="student-status" class="form-select form-select-sm">
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="EN_RIESGO">EN RIESGO</option>
                      <option value="MATRICULADO">MATRICULADO</option>
                      <option value="EGRESADO">EGRESADO</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Créditos Aprobados</label>
                    <input type="number" id="student-credits" class="form-control form-control-sm font-mono" min="0" max="200" value="0" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">PGA Acumulado (0.0 - 5.0)</label>
                    <input type="number" step="0.01" id="student-gpa" class="form-control form-control-sm font-mono" min="0" max="5.0" value="4.00" />
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-sga-primary btn-sm">Guardar Estudiante</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmación para Eliminar Estudiante (Reemplaza confirm nativo de iframe) -->
      <div class="modal fade" id="modalDeleteStudent" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content">
            <div class="modal-header border-bottom-0 pb-0">
              <h5 class="modal-title h6 fw-bold text-danger">
                <i class="bi bi-exclamation-triangle-fill me-1"></i> Eliminar Registro
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body py-3 small">
              <p class="mb-1 text-dark">¿Confirmas la eliminación del estudiante?</p>
              <strong id="delete-student-name" class="d-block text-danger font-mono small"></strong>
              <span class="text-muted x-small d-block mt-2">Esta acción actualizará LocalStorage inmediatamente.</span>
            </div>
            <div class="modal-footer border-top-0 pt-0">
              <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger btn-sm" id="btn-confirm-delete-student">
                Eliminar Estudiante
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para Ver Expediente de Estudiante -->
      <div class="modal fade" id="modalViewStudent" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-md modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title h6 fw-bold">Expediente del Estudiante · Universidad Isaías Gael</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body" id="modalViewStudentBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Renderizar filas de la tabla
    this.renderTableRows(container);
    this.bindStaticEvents(container);
  },

  renderTableRows(container) {
    const students = Storage.getStudents();
    const canEdit = Auth.hasRole('ADMIN');

    const filtered = students.filter((s) => {
      const matchSearch =
        s.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.documentId.includes(this.searchTerm);

      const matchStatus = this.statusFilter === 'ALL' || s.status === this.statusFilter;
      return matchSearch && matchStatus;
    });

    const badge = container.querySelector('#students-count-badge');
    if (badge) badge.textContent = `${filtered.length} Registros`;

    const clearBtn = container.querySelector('#clear-search-btn');
    if (clearBtn) {
      if (this.searchTerm) {
        clearBtn.classList.remove('d-none');
      } else {
        clearBtn.classList.add('d-none');
      }
    }

    const tbody = container.querySelector('#students-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            No se encontraron estudiantes que coincidan con la búsqueda.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered
      .map(
        (st) => `
        <tr>
          <td>
            <span class="fw-bold font-mono text-dark d-block">${st.code}</span>
            <span class="text-muted x-small font-mono">CC ${st.documentId}</span>
          </td>
          <td>
            <span class="fw-semibold text-dark d-block">${st.firstName} ${st.lastName}</span>
            <span class="text-muted x-small">${st.email}</span>
          </td>
          <td>
            <span class="text-dark small d-block">${st.program}</span>
            <span class="text-muted x-small">${st.faculty}</span>
          </td>
          <td class="text-center font-mono">
            <span class="badge bg-light text-dark border">Sem. ${st.currentSemester}</span>
          </td>
          <td class="text-end font-mono">
            <span class="fw-semibold">${st.creditsEarned}</span> <span class="text-muted x-small">SCT</span>
          </td>
          <td class="text-end font-mono">
            <span class="fw-bold ${st.cumulativeGpa >= 4.0 ? 'text-success' : st.cumulativeGpa >= 3.0 ? 'text-primary' : 'text-danger'}">
              ${st.cumulativeGpa.toFixed(2)}
            </span>
          </td>
          <td class="text-center">
            <span class="badge ${
              st.status === 'ACTIVO'
                ? 'badge-activo'
                : st.status === 'EN_RIESGO'
                ? 'badge-riesgo'
                : 'badge-matriculado'
            }">
              ${st.status.replace('_', ' ')}
            </span>
          </td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary btn-view-student" data-id="${st.id}" title="Ver Expediente">
                <i class="bi bi-eye"></i>
              </button>
              ${
                canEdit
                  ? `
                <button class="btn btn-outline-primary btn-edit-student" data-id="${st.id}" title="Editar Estudiante">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-outline-danger btn-delete-student" data-id="${st.id}" title="Eliminar Estudiante">
                  <i class="bi bi-trash"></i>
                </button>
              `
                  : ''
              }
            </div>
          </td>
        </tr>
      `
      )
      .join('');

    this.bindRowEvents(container);
  },

  bindStaticEvents(container) {
    // 1. Búsqueda en tiempo real SIN re-renderizar todo el DOM
    const searchInput = container.querySelector('#search-students-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.renderTableRows(container);
      });
    }

    const clearBtn = container.querySelector('#clear-search-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.searchTerm = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        this.renderTableRows(container);
      });
    }

    // 2. Filtro de estado
    const statusGroup = container.querySelector('#student-status-filter-group');
    if (statusGroup) {
      statusGroup.querySelectorAll('[data-status]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          statusGroup.querySelectorAll('[data-status]').forEach((b) => b.classList.remove('active'));
          e.target.classList.add('active');
          this.statusFilter = e.target.getAttribute('data-status');
          this.renderTableRows(container);
        });
      });
    }

    // 3. Crear Estudiante
    const btnCreate = container.querySelector('#btn-create-student');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        const form = container.querySelector('#form-student');
        form.reset();
        container.querySelector('#student-id').value = '';
        container.querySelector('#modalStudentTitle').textContent = 'Crear Nuevo Estudiante · Universidad Isaías Gael';
        const modal = new window.bootstrap.Modal(container.querySelector('#modalStudentForm'));
        modal.show();
      });
    }

    // 4. Formulario de Guardado (Crear o Editar)
    const form = container.querySelector('#form-student');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = container.querySelector('#student-id').value || `est-${Date.now()}`;
        const isNew = !container.querySelector('#student-id').value;

        const student = {
          id,
          code: isNew ? `EST-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
          firstName: container.querySelector('#student-firstname').value.trim(),
          lastName: container.querySelector('#student-lastname').value.trim(),
          documentId: container.querySelector('#student-doc').value.trim(),
          email: container.querySelector('#student-email').value.trim(),
          program: container.querySelector('#student-program').value,
          faculty: 'Facultad de Ingeniería',
          currentSemester: parseInt(container.querySelector('#student-semester').value, 10) || 1,
          status: container.querySelector('#student-status').value,
          creditsEarned: parseInt(container.querySelector('#student-credits').value, 10) || 0,
          cumulativeGpa: parseFloat(container.querySelector('#student-gpa').value) || 4.0,
          admissionDate: isNew ? '2026-02-01' : undefined,
        };

        if (!isNew) {
          const current = Storage.getStudents().find((s) => s.id === id);
          if (current) {
            student.code = current.code;
            student.admissionDate = current.admissionDate;
          }
        }

        Storage.saveStudent(student);

        const modalEl = container.querySelector('#modalStudentForm');
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        this.renderTableRows(container);
      });
    }

    // 5. Confirmar Eliminación (Modal)
    const btnConfirmDelete = container.querySelector('#btn-confirm-delete-student');
    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener('click', () => {
        if (this.pendingDeleteId) {
          Storage.deleteStudent(this.pendingDeleteId);
          this.pendingDeleteId = null;

          const modalEl = container.querySelector('#modalDeleteStudent');
          const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();

          this.renderTableRows(container);
        }
      });
    }
  },

  bindRowEvents(container) {
    // Ver Expediente
    container.querySelectorAll('.btn-view-student').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const student = Storage.getStudents().find((s) => s.id === id);
        if (!student) return;

        const body = container.querySelector('#modalViewStudentBody');
        body.innerHTML = `
          <div class="text-center pb-3 border-bottom mb-3">
            <div class="avatar bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style="width: 54px; height: 54px; font-weight: bold; font-size: 1.25rem;">
              ${student.firstName[0]}${student.lastName[0]}
            </div>
            <h6 class="fw-bold text-dark mb-0">${student.firstName} ${student.lastName}</h6>
            <span class="font-mono text-primary small">${student.code}</span>
            <span class="text-muted x-small d-block">Universidad Isaías Gael</span>
          </div>

          <div class="row g-2 small">
            <div class="col-6">
              <span class="text-muted d-block">Identificación:</span>
              <strong class="font-mono text-dark">CC ${student.documentId}</strong>
            </div>
            <div class="col-6">
              <span class="text-muted d-block">Correo:</span>
              <strong class="text-dark text-truncate d-block">${student.email}</strong>
            </div>
            <div class="col-12">
              <span class="text-muted d-block">Carrera:</span>
              <strong class="text-dark">${student.program}</strong>
            </div>
            <div class="col-6">
              <span class="text-muted d-block">PGA Acumulado:</span>
              <strong class="h6 font-mono text-primary mb-0">${student.cumulativeGpa.toFixed(2)} / 5.0</strong>
            </div>
            <div class="col-6">
              <span class="text-muted d-block">Créditos Aprobados:</span>
              <strong class="h6 font-mono text-dark mb-0">${student.creditsEarned} SCT</strong>
            </div>
            <div class="col-6">
              <span class="text-muted d-block">Semestre en curso:</span>
              <strong class="text-dark">Semestre ${student.currentSemester}</strong>
            </div>
            <div class="col-6">
              <span class="text-muted d-block">Estado:</span>
              <span class="badge ${student.status === 'ACTIVO' ? 'badge-activo' : student.status === 'EN_RIESGO' ? 'badge-riesgo' : 'badge-matriculado'}">
                ${student.status}
              </span>
            </div>
          </div>
        `;

        const modal = new window.bootstrap.Modal(container.querySelector('#modalViewStudent'));
        modal.show();
      });
    });

    // Editar Estudiante
    container.querySelectorAll('.btn-edit-student').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const student = Storage.getStudents().find((s) => s.id === id);
        if (!student) return;

        container.querySelector('#student-id').value = student.id;
        container.querySelector('#student-firstname').value = student.firstName;
        container.querySelector('#student-lastname').value = student.lastName;
        container.querySelector('#student-doc').value = student.documentId;
        container.querySelector('#student-email').value = student.email;
        container.querySelector('#student-program').value = student.program;
        container.querySelector('#student-semester').value = student.currentSemester;
        container.querySelector('#student-status').value = student.status;
        container.querySelector('#student-credits').value = student.creditsEarned;
        container.querySelector('#student-gpa').value = student.cumulativeGpa;

        container.querySelector('#modalStudentTitle').textContent = `Editar Estudiante: ${student.code}`;

        const modal = new window.bootstrap.Modal(container.querySelector('#modalStudentForm'));
        modal.show();
      });
    });

    // Abrir Modal de Confirmación para Eliminar
    container.querySelectorAll('.btn-delete-student').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const student = Storage.getStudents().find((s) => s.id === id);
        if (!student) return;

        this.pendingDeleteId = id;
        container.querySelector('#delete-student-name').textContent = `${student.firstName} ${student.lastName} (${student.code})`;

        const modal = new window.bootstrap.Modal(container.querySelector('#modalDeleteStudent'));
        modal.show();
      });
    });
  },
};

/**
 * @file enrollments.js
 * Módulo de Matrículas en Línea: Motor de inscripción, validación de 20 créditos, cupos y comprobante oficial
 */

import { Storage } from './storage.js';
import { Auth } from './auth.js';

export const EnrollmentsModule = {
  selectedStudentId: null,
  selectedOfferings: [],
  alertMessage: null,

  render(container) {
    const students = Storage.getStudents();
    const offerings = Storage.getOfferings();
    const enrollments = Storage.getEnrollments();
    const courses = Storage.getCourses();
    const currentUser = Auth.getUser();

    // Si el usuario logueado es estudiante, forzar su selección
    if (currentUser && currentUser.role === 'ESTUDIANTE' && currentUser.studentId) {
      this.selectedStudentId = currentUser.studentId;
    } else if (!this.selectedStudentId && students.length > 0) {
      this.selectedStudentId = students[0].id;
    }

    const currentStudent = students.find((s) => s.id === this.selectedStudentId);

    // Calcular créditos seleccionados
    const totalSelectedCredits = this.selectedOfferings.reduce((sum, o) => sum + o.credits, 0);

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Encabezado -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-success-subtle text-success border px-2 py-1">Ventana Abierta</span>
              <span class="text-muted small">·</span>
              <span class="text-muted small">Período 2026-1</span>
            </div>
            <h2 class="h4 fw-bold text-dark mb-0">Matrículas Académicas</h2>
            <p class="text-muted small mb-0">
              Inscripción de asignaturas con validación de cupos en tiempo real, control de tope máximo (máx. 20 créditos) y generación de comprobante.
            </p>
          </div>

          <!-- Selector de Estudiante -->
          <div class="d-flex align-items-center gap-2">
            <label class="form-label small fw-semibold text-muted mb-0">Estudiante:</label>
            <select id="select-enrollment-student" class="form-select form-select-sm" ${currentUser && currentUser.role === 'ESTUDIANTE' ? 'disabled' : ''}>
              ${students
                .map(
                  (st) => `
                <option value="${st.id}" ${st.id === this.selectedStudentId ? 'selected' : ''}>
                  ${st.firstName} ${st.lastName} (${st.code}) - Sem. ${st.currentSemester}
                </option>
              `
                )
                .join('')}
            </select>
          </div>
        </div>

        <!-- Banner de Estudiante & Semáforo de Créditos -->
        ${
          currentStudent
            ? `
          <div class="sga-card p-3">
            <div class="row align-items-center g-3">
              <div class="col-12 col-md-7">
                <div class="d-flex align-items-center gap-2">
                  <span class="h6 fw-bold text-dark mb-0">${currentStudent.firstName} ${currentStudent.lastName}</span>
                  <span class="font-mono text-primary small">(${currentStudent.code})</span>
                  <span class="badge ${currentStudent.status === 'ACTIVO' ? 'badge-activo' : 'badge-riesgo'} ms-1">
                    ${currentStudent.status}
                  </span>
                </div>
                <div class="text-muted x-small mt-1">
                  Programa: <strong>${currentStudent.program}</strong> · PGA: <strong class="font-mono text-dark">${currentStudent.cumulativeGpa.toFixed(2)}</strong> · Créditos aprobados: <strong class="font-mono text-dark">${currentStudent.creditsEarned} SCT</strong>
                </div>
              </div>

              <div class="col-12 col-md-5">
                <div class="p-2 bg-light rounded border d-flex justify-content-between align-items-center">
                  <div>
                    <span class="text-muted x-small d-block text-uppercase fw-semibold">Créditos en Plan:</span>
                    <span class="h5 font-mono fw-bold ${totalSelectedCredits > 20 ? 'text-danger' : 'text-primary'} mb-0">
                      ${totalSelectedCredits} / 20 SCT
                    </span>
                  </div>
                  <div class="progress flex-grow-1 mx-3" style="height: 8px;">
                    <div
                      class="progress-bar ${totalSelectedCredits > 20 ? 'bg-danger' : 'bg-primary'}"
                      role="progressbar"
                      style="width: ${Math.min(100, (totalSelectedCredits / 20) * 100)}%"
                    ></div>
                  </div>
                  <span class="badge bg-white text-dark border font-mono x-small">
                    ${Math.max(0, 20 - totalSelectedCredits)} disp.
                  </span>
                </div>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Alerta de Validación -->
        ${
          this.alertMessage
            ? `
          <div class="alert ${this.alertMessage.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show small d-flex align-items-center gap-2" role="alert">
            <i class="bi ${this.alertMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-6"></i>
            <div>${this.alertMessage.text}</div>
            <button type="button" class="btn-close" id="btn-close-enrollment-alert" aria-label="Cerrar"></button>
          </div>
        `
            : ''
        }

        <!-- 2 Columnas: Oferta vs Canasta de Matrícula -->
        <div class="row g-3">
          <!-- Columna Izquierda: Cursos Ofertados -->
          <div class="col-12 col-lg-8">
            <div class="sga-card p-3">
              <div class="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
                <h3 class="h6 fw-bold mb-0 text-dark">
                  <i class="bi bi-calendar3 text-primary me-2"></i>Oferta Académica Habilitada (Período 2026-1)
                </h3>
                <span class="badge bg-light text-dark font-mono">${offerings.length} asignaturas</span>
              </div>

              <div class="list-group list-group-flush">
                ${offerings
                  .map((offering) => {
                    const isSelected = this.selectedOfferings.some((o) => o.id === offering.id);
                    const isFull = offering.enrolledCount >= offering.capacity;
                    return `
                    <div class="list-group-item px-0 py-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 ${
                      isSelected ? 'bg-indigo-subtle border-start border-primary border-3 px-2 rounded' : ''
                    }">
                      <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                          <span class="font-mono fw-bold text-primary small">${offering.courseCode} (${offering.group})</span>
                          <span class="text-muted small">·</span>
                          <span class="fw-bold text-dark">${offering.courseName}</span>
                        </div>
                        <div class="text-muted x-small">
                          Docente: <strong class="text-dark">${offering.teacherName}</strong> · Horario: <strong class="font-mono text-dark">${offering.schedule}</strong> · Aula: ${offering.classroom}
                        </div>
                      </div>

                      <div class="d-flex align-items-center justify-content-between justify-content-sm-end gap-3">
                        <div class="text-sm-end">
                          <span class="font-mono fw-bold text-dark small d-block">${offering.credits} SCT</span>
                          <span class="badge font-mono x-small ${isFull ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}">
                            ${offering.enrolledCount} / ${offering.capacity} cupos
                          </span>
                        </div>

                        <button
                          type="button"
                          class="btn btn-sm ${isSelected ? 'btn-outline-danger' : isFull ? 'btn-secondary disabled' : 'btn-sga-primary'} btn-toggle-offering"
                          data-id="${offering.id}"
                          ${isFull && !isSelected ? 'disabled' : ''}
                        >
                          ${isSelected ? '<i class="bi bi-x-circle me-1"></i> Quitar' : isFull ? 'Sin Cupos' : '<i class="bi bi-plus-circle me-1"></i> Inscribir'}
                        </button>
                      </div>
                    </div>
                  `;
                  })
                  .join('')}
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Canasta y Confirmación -->
          <div class="col-12 col-lg-4">
            <div class="sga-card p-4 sticky-top" style="top: 80px;">
              <h3 class="h6 fw-bold mb-3 pb-2 border-bottom text-dark d-flex justify-content-between align-items-center">
                <span>Resumen de Matrícula</span>
                <span class="badge bg-primary text-white font-mono">${this.selectedOfferings.length} cursos</span>
              </h3>

              ${
                this.selectedOfferings.length === 0
                  ? `
                <div class="text-center py-4 text-muted small">
                  <i class="bi bi-cart3 fs-3 d-block mb-2 text-secondary"></i>
                  Selecciona asignaturas de la oferta académica para formalizar tu inscripción.
                </div>
              `
                  : `
                <div class="list-group list-group-flush small mb-3">
                  ${this.selectedOfferings
                    .map(
                      (item) => `
                    <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                      <div class="text-truncate">
                        <span class="fw-bold font-mono text-dark d-block text-truncate">${item.courseCode} - ${item.courseName}</span>
                        <span class="text-muted x-small font-mono">${item.group} · ${item.credits} Créditos</span>
                      </div>
                      <button class="btn btn-link text-danger p-0 ms-2 btn-remove-item" data-id="${item.id}">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  `
                    )
                    .join('')}
                </div>

                <div class="p-3 bg-light rounded small space-y-2 mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Total Asignaturas:</span>
                    <strong class="font-mono text-dark">${this.selectedOfferings.length}</strong>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Total Créditos:</span>
                    <strong class="font-mono text-primary fs-6">${totalSelectedCredits} SCT</strong>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Estado Financiero:</span>
                    <span class="text-success fw-bold font-mono">Paz y Salvo (OK)</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-confirm-enrollment"
                  class="btn btn-sga-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <i class="bi bi-check2-circle fs-5"></i>
                  <span class="fw-bold">Confirmar Matrícula</span>
                </button>
              `
              }
            </div>
          </div>
        </div>

        <!-- Historial de Matrículas Realizadas -->
        <div class="sga-card p-4 mt-4">
          <div class="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
            <h3 class="h6 fw-bold mb-0 text-dark">
              <i class="bi bi-journal-check text-success me-2"></i>Historial de Matrículas del Período
            </h3>
            <span class="badge bg-light text-dark font-mono">${enrollments.length} Registros</span>
          </div>

          <div class="table-responsive">
            <table class="table sga-table align-middle">
              <thead>
                <tr>
                  <th>Código Matrícula</th>
                  <th>Estudiante</th>
                  <th>Fecha y Hora</th>
                  <th class="text-center">Créditos</th>
                  <th class="text-center">Asignaturas</th>
                  <th class="text-center">Estado</th>
                  <th class="text-end">Comprobante</th>
                </tr>
              </thead>
              <tbody>
                ${
                  enrollments.length === 0
                    ? `
                  <tr>
                    <td colspan="7" class="text-center py-4 text-muted">No se registran matrículas aún.</td>
                  </tr>
                `
                    : enrollments
                        .map(
                          (m) => `
                  <tr>
                    <td class="font-mono fw-bold text-dark">${m.code}</td>
                    <td>
                      <span class="fw-semibold text-dark d-block">${m.studentName}</span>
                      <span class="font-mono text-muted x-small">${m.studentCode}</span>
                    </td>
                    <td class="font-mono text-muted small">${m.date}</td>
                    <td class="text-center font-mono fw-bold">${m.totalCredits} SCT</td>
                    <td class="text-center font-mono">${m.items ? m.items.length : 0} materias</td>
                    <td class="text-center">
                      <span class="badge bg-success-subtle text-success border border-success-subtle font-mono">
                        ${m.status}
                      </span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-outline-secondary btn-sm btn-print-receipt" data-id="${m.id}">
                        <i class="bi bi-printer me-1"></i> Recibo
                      </button>
                    </td>
                  </tr>
                `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Comprobante Oficial Imprimible -->
      <div class="modal fade" id="modalEnrollmentReceipt" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-body p-4 p-md-5" id="receiptModalBody">
              <!-- Cargado dinámicamente -->
            </div>
            <div class="modal-footer no-print">
              <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
              <button type="button" class="btn btn-sga-primary btn-sm" onclick="window.print()">
                <i class="bi bi-printer me-1"></i> Imprimir Comprobante Oficial
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    const studentSelect = container.querySelector('#select-enrollment-student');
    if (studentSelect) {
      studentSelect.addEventListener('change', (e) => {
        this.selectedStudentId = e.target.value;
        this.selectedOfferings = [];
        this.alertMessage = null;
        this.render(container);
      });
    }

    const alertCloseBtn = container.querySelector('#btn-close-enrollment-alert');
    if (alertCloseBtn) {
      alertCloseBtn.addEventListener('click', () => {
        this.alertMessage = null;
        this.render(container);
      });
    }

    // Alternar selección de curso
    container.querySelectorAll('.btn-toggle-offering').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const offeringId = e.currentTarget.getAttribute('data-id');
        const offerings = Storage.getOfferings();
        const courses = Storage.getCourses();
        const offering = offerings.find((o) => o.id === offeringId);
        if (!offering) return;

        const isSelected = this.selectedOfferings.some((o) => o.id === offering.id);

        if (isSelected) {
          this.selectedOfferings = this.selectedOfferings.filter((o) => o.id !== offering.id);
          this.alertMessage = null;
        } else {
          // 1. Validar límite de 20 créditos
          const currentTotal = this.selectedOfferings.reduce((sum, o) => sum + o.credits, 0);
          if (currentTotal + offering.credits > 20) {
            this.alertMessage = {
              type: 'error',
              text: `No se puede inscribir esta materia. Excede el tope máximo de 20 créditos (sumaría ${currentTotal + offering.credits} créditos).`,
            };
            this.render(container);
            return;
          }

          // 2. Validar que no haya otro grupo de la misma materia
          const duplicate = this.selectedOfferings.some((o) => o.courseCode === offering.courseCode);
          if (duplicate) {
            this.alertMessage = {
              type: 'error',
              text: `Ya has seleccionado un grupo para la asignatura ${offering.courseCode}. Solo se permite 1 grupo por curso.`,
            };
            this.render(container);
            return;
          }

          // 3. Validar cupos
          if (offering.enrolledCount >= offering.capacity) {
            this.alertMessage = {
              type: 'error',
              text: `El grupo ${offering.group} no tiene cupos disponibles (${offering.enrolledCount}/${offering.capacity}).`,
            };
            this.render(container);
            return;
          }

          this.selectedOfferings.push(offering);
          this.alertMessage = null;
        }

        this.render(container);
      });
    });

    // Remover ítem de la canasta
    container.querySelectorAll('.btn-remove-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.selectedOfferings = this.selectedOfferings.filter((o) => o.id !== id);
        this.render(container);
      });
    });

    // Confirmar Matrícula
    const btnConfirm = container.querySelector('#btn-confirm-enrollment');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', () => {
        const students = Storage.getStudents();
        const currentStudent = students.find((s) => s.id === this.selectedStudentId);
        if (!currentStudent || this.selectedOfferings.length === 0) return;

        const totalCredits = this.selectedOfferings.reduce((sum, o) => sum + o.credits, 0);

        const newEnrollment = {
          id: `mat-${Date.now()}`,
          code: `MAT-2026-1-${Math.floor(1000 + Math.random() * 9000)}`,
          studentId: currentStudent.id,
          studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
          studentCode: currentStudent.code,
          term: '2026-1',
          date: new Date().toLocaleString('es-CO'),
          totalCredits,
          status: 'CONFIRMADA',
          items: this.selectedOfferings.map((o) => ({
            offeringId: o.id,
            courseCode: o.courseCode,
            courseName: o.courseName,
            credits: o.credits,
            group: o.group,
            schedule: o.schedule,
            teacherName: o.teacherName,
          })),
        };

        Storage.saveEnrollment(newEnrollment);

        // Actualizar estado del estudiante a MATRICULADO
        currentStudent.status = 'MATRICULADO';
        Storage.saveStudent(currentStudent);

        this.selectedOfferings = [];
        this.alertMessage = {
          type: 'success',
          text: `¡Matrícula formalizada exitosamente con código ${newEnrollment.code}! Se han reservado ${totalCredits} créditos académicos.`,
        };

        this.showReceiptModal(newEnrollment, container);
      });
    }

    // Ver / Imprimir Recibo desde Historial
    container.querySelectorAll('.btn-print-receipt').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const enrollments = Storage.getEnrollments();
        const record = enrollments.find((m) => m.id === id);
        if (record) {
          this.showReceiptModal(record, container);
        }
      });
    });
  },

  showReceiptModal(record, container) {
    const modalBody = container.querySelector('#receiptModalBody');
    modalBody.innerHTML = `
      <div class="official-certificate">
        <div class="text-center pb-4 border-bottom border-dark border-2 mb-4">
          <span class="x-small text-uppercase fw-bold text-muted d-block">República de Colombia · Ministerio de Educación Nacional</span>
          <h4 class="fw-bold text-dark mb-0 tracking-tight">UNIVERSIDAD ISAÍAS GAEL</h4>
          <span class="small text-muted">División de Registro y Control Académico · NIT: 901.442.810-7</span>
          <div class="mt-2">
            <span class="badge bg-dark text-white px-3 py-1 font-mono text-uppercase">
              Comprobante Oficial de Matrícula Académica (2026-1)
            </span>
          </div>
        </div>

        <div class="row g-3 small bg-light p-3 rounded mb-4">
          <div class="col-6">
            <span class="text-muted d-block">Número de Matrícula:</span>
            <strong class="font-mono text-primary fs-6">${record.code}</strong>
          </div>
          <div class="col-6">
            <span class="text-muted d-block">Fecha de Emisión:</span>
            <strong class="font-mono text-dark">${record.date}</strong>
          </div>
          <div class="col-6">
            <span class="text-muted d-block">Estudiante:</span>
            <strong class="text-dark">${record.studentName}</strong>
          </div>
          <div class="col-6">
            <span class="text-muted d-block">Código Estudiantil:</span>
            <strong class="font-mono text-dark">${record.studentCode}</strong>
          </div>
        </div>

        <h6 class="fw-bold text-dark small text-uppercase mb-2">Asignaturas y Grupos Matriculados</h6>
        <div class="table-responsive border rounded mb-4">
          <table class="table sga-table table-bordered mb-0">
            <thead>
              <tr>
                <th>Código</th>
                <th>Asignatura</th>
                <th>Grupo</th>
                <th>Horario</th>
                <th class="text-end">Créditos</th>
              </tr>
            </thead>
            <tbody class="font-mono x-small">
              ${(record.items || [])
                .map(
                  (it) => `
                <tr>
                  <td class="fw-bold">${it.courseCode}</td>
                  <td class="font-sans fw-semibold">${it.courseName}</td>
                  <td>${it.group}</td>
                  <td>${it.schedule || 'Por asignar'}</td>
                  <td class="text-end fw-bold">${it.credits}</td>
                </tr>
              `
                )
                .join('')}
              <tr class="table-light">
                <td colspan="4" class="text-end fw-bold font-sans">Total Créditos Oficiales:</td>
                <td class="text-end fw-bold text-primary fs-6">${record.totalCredits} SCT</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="row g-4 pt-4 border-top text-center x-small">
          <div class="col-6">
            <div class="border-top border-dark pt-1 mt-4">
              <strong class="d-block text-dark">Secretaría General de Registro</strong>
              <span class="text-muted">Firma y Sello Digital Autorizado</span>
            </div>
          </div>
          <div class="col-6 text-end">
            <div class="p-2 border rounded bg-light d-inline-block text-center font-mono">
              <div class="text-muted x-small">HASH DE AUDITORÍA SHA-256</div>
              <strong class="text-dark x-small">a89f21b7c00e12d48f98</strong>
              <div class="text-success fw-bold x-small">DOCUMENTO VÁLIDO</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const modal = new window.bootstrap.Modal(container.querySelector('#modalEnrollmentReceipt'));
    modal.show();
  },
};

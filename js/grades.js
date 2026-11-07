/**
 * @file grades.js
 * Módulo de Registro de Calificaciones Docente - UNIVERSIDAD ISAÍAS GAEL
 * Multi-corte (30-30-40), cierre de actas mediante modal (sin confirm nativo) y bloqueo de solo lectura.
 */

import { Storage } from './storage.js';
import { Auth } from './auth.js';

export const GradesModule = {
  selectedOfferingId: null,
  feedbackMessage: null,

  render(container) {
    const offerings = Storage.getOfferings();
    const allGrades = Storage.getGrades();

    if (!this.selectedOfferingId && offerings.length > 0) {
      this.selectedOfferingId = offerings[0].id;
    }

    const currentOffering = offerings.find((o) => o.id === this.selectedOfferingId);
    const courseGrades = allGrades.filter((g) => g.offeringId === this.selectedOfferingId);

    // Comprobar si el acta está cerrada formalmente
    const isActaClosed = courseGrades.length > 0 && courseGrades.every((g) => g.status === 'CERRADO_AUDITADO');

    const totalStudents = courseGrades.length;
    const approvedCount = courseGrades.filter((g) => g.approved).length;
    const failedCount = totalStudents - approvedCount;
    const avgGrade =
      totalStudents > 0
        ? (courseGrades.reduce((sum, g) => sum + g.finalGrade, 0) / totalStudents).toFixed(2)
        : '0.00';

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Encabezado -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-indigo-subtle text-primary border px-2 py-1 font-mono">
                Evaluación Período 2026-1
              </span>
              <span class="text-muted small">·</span>
              <span class="text-muted small">Universidad Isaías Gael</span>
            </div>
            <h2 class="h4 fw-bold text-dark mb-0">Registro y Cierre de Calificaciones</h2>
            <p class="text-muted small mb-0">
              Libro de notas oficial. Ponderación reglamentaria: Corte 1 (30%) + Corte 2 (30%) + Examen Final (40%). Escala 0.0 a 5.0.
            </p>
          </div>

          <!-- Selector de Asignatura / Grupo -->
          <div class="d-flex align-items-center gap-2">
            <label class="form-label small fw-semibold text-muted mb-0">Asignatura:</label>
            <select id="select-grade-offering" class="form-select form-select-sm">
              ${offerings
                .map(
                  (off) => `
                <option value="${off.id}" ${off.id === this.selectedOfferingId ? 'selected' : ''}>
                  ${off.courseCode} (${off.group}) - ${off.courseName}
                </option>
              `
                )
                .join('')}
            </select>
          </div>
        </div>

        <!-- Banner de Curso y Acciones de Cierre -->
        ${
          currentOffering
            ? `
          <div class="sga-card p-3">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <div class="d-flex align-items-center gap-2">
                  <span class="h6 fw-bold text-dark mb-0">${currentOffering.courseName}</span>
                  <span class="font-mono text-primary small">(${currentOffering.courseCode} - ${currentOffering.group})</span>
                </div>
                <div class="text-muted x-small mt-0.5">
                  Docente: <strong>${currentOffering.teacherName}</strong> · Horario: <strong class="font-mono">${currentOffering.schedule}</strong> · Campus Universidad Isaías Gael
                </div>
              </div>

              <div class="d-flex align-items-center gap-2">
                ${
                  isActaClosed
                    ? `
                  <span class="badge bg-secondary text-white px-3 py-2 font-mono d-flex align-items-center gap-1.5 shadow-xs">
                    <i class="bi bi-shield-lock-fill text-warning"></i>
                    <span>Acta Cerrada y Auditada (Solo Lectura)</span>
                  </span>
                `
                    : `
                  <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-save-draft-grades">
                    <i class="bi bi-floppy me-1"></i> Guardar Borrador
                  </button>
                  <button type="button" class="btn btn-danger btn-sm d-flex align-items-center gap-1.5" id="btn-open-close-acta-modal">
                    <i class="bi bi-lock-fill"></i>
                    <span>Cierre Definitivo de Acta</span>
                  </button>
                `
                }
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Mensaje de Feedback -->
        ${
          this.feedbackMessage
            ? `
          <div class="alert alert-success alert-dismissible fade show small d-flex align-items-center gap-2" role="alert">
            <i class="bi bi-check-circle-fill fs-6 text-success"></i>
            <div>${this.feedbackMessage}</div>
            <button type="button" class="btn-close" id="btn-close-grade-alert" aria-label="Cerrar"></button>
          </div>
        `
            : ''
        }

        <!-- Tabla de Calificaciones -->
        <div class="sga-card overflow-hidden">
          <div class="table-responsive">
            <table class="table sga-table align-middle">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Estudiante</th>
                  <th class="text-center" style="width: 110px;">Corte 1 (30%)</th>
                  <th class="text-center" style="width: 110px;">Corte 2 (30%)</th>
                  <th class="text-center" style="width: 110px;">Final (40%)</th>
                  <th class="text-end" style="width: 90px;">Definitiva</th>
                  <th class="text-center" style="width: 110px;">Resultado</th>
                  <th class="text-center" style="width: 140px;">Estado Acta</th>
                </tr>
              </thead>
              <tbody class="font-mono">
                ${
                  courseGrades.length === 0
                    ? `
                  <tr>
                    <td colspan="8" class="text-center py-4 text-muted font-sans">
                      No hay calificaciones registradas para este curso en la Universidad Isaías Gael.
                    </td>
                  </tr>
                `
                    : courseGrades
                        .map(
                          (row) => `
                  <tr data-grade-id="${row.id}">
                    <td class="fw-bold text-dark">${row.studentCode}</td>
                    <td class="font-sans fw-semibold text-dark">${row.studentName}</td>
                    <td class="text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5.0"
                        class="form-control form-control-sm text-center font-mono input-grade ${isActaClosed ? 'bg-light text-muted' : ''}"
                        data-field="grade1"
                        data-id="${row.id}"
                        value="${row.grade1}"
                        ${isActaClosed ? 'disabled readonly' : ''}
                      />
                    </td>
                    <td class="text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5.0"
                        class="form-control form-control-sm text-center font-mono input-grade ${isActaClosed ? 'bg-light text-muted' : ''}"
                        data-field="grade2"
                        data-id="${row.id}"
                        value="${row.grade2}"
                        ${isActaClosed ? 'disabled readonly' : ''}
                      />
                    </td>
                    <td class="text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5.0"
                        class="form-control form-control-sm text-center font-mono input-grade ${isActaClosed ? 'bg-light text-muted' : ''}"
                        data-field="grade3"
                        data-id="${row.id}"
                        value="${row.grade3}"
                        ${isActaClosed ? 'disabled readonly' : ''}
                      />
                    </td>
                    <td class="text-end fw-bold font-mono fs-6 ${row.finalGrade >= 3.0 ? 'text-success' : 'text-danger'}">
                      <span class="span-final-grade" data-id="${row.id}">${row.finalGrade.toFixed(1)}</span>
                    </td>
                    <td class="text-center font-sans">
                      <span class="badge ${row.approved ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} span-approved" data-id="${row.id}">
                        ${row.approved ? 'Aprobado' : 'Reprobado'}
                      </span>
                    </td>
                    <td class="text-center font-sans">
                      <span class="badge ${row.status === 'CERRADO_AUDITADO' ? 'bg-secondary text-white' : 'bg-warning-subtle text-warning-emphasis border'}">
                        ${row.status === 'CERRADO_AUDITADO' ? '<i class="bi bi-lock-fill me-1"></i> Cerrado' : 'Borrador'}
                      </span>
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

        <!-- Estadísticas del Grupo -->
        <div class="row g-3">
          <div class="col-6 col-md-3">
            <div class="p-3 bg-white border rounded text-center">
              <span class="text-muted x-small d-block text-uppercase fw-semibold">Estudiantes Evaluados</span>
              <span class="h5 font-mono fw-bold text-dark mb-0">${totalStudents}</span>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="p-3 bg-white border rounded text-center">
              <span class="text-muted x-small d-block text-uppercase fw-semibold">Aprobados (&gt;= 3.0)</span>
              <span class="h5 font-mono fw-bold text-success mb-0">
                ${approvedCount} <small class="text-muted font-sans x-small">(${totalStudents ? Math.round((approvedCount / totalStudents) * 100) : 0}%)</small>
              </span>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="p-3 bg-white border rounded text-center">
              <span class="text-muted x-small d-block text-uppercase fw-semibold">Reprobados (&lt; 3.0)</span>
              <span class="h5 font-mono fw-bold text-danger mb-0">
                ${failedCount} <small class="text-muted font-sans x-small">(${totalStudents ? Math.round((failedCount / totalStudents) * 100) : 0}%)</small>
              </span>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="p-3 bg-white border rounded text-center">
              <span class="text-muted x-small d-block text-uppercase fw-semibold">Promedio del Grupo</span>
              <span class="h5 font-mono fw-bold text-primary mb-0">${avgGrade} / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL CONFIRMACIÓN CIERRE DE ACTA (Reemplaza confirm nativo) -->
      <div class="modal fade" id="modalConfirmCloseActa" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-bottom-0 pb-0">
              <h5 class="modal-title h6 fw-bold text-danger d-flex align-items-center gap-2">
                <i class="bi bi-shield-lock-fill"></i>
                <span>Cierre Definitivo de Acta Evaluativa</span>
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body py-3 small">
              <div class="p-3 bg-light rounded border mb-3">
                <span class="text-muted x-small d-block">Asignatura y Grupo:</span>
                <strong class="text-dark d-block">${currentOffering ? currentOffering.courseName : ''} (${currentOffering ? currentOffering.courseCode : ''} - ${currentOffering ? currentOffering.group : ''})</strong>
                <span class="text-muted x-small d-block mt-1">Institución: <strong>Universidad Isaías Gael</strong></span>
                <span class="text-muted x-small d-block">Total estudiantes a consolidar: <strong>${courseGrades.length} alumnos</strong></span>
              </div>
              <p class="text-danger fw-semibold mb-1">
                <i class="bi bi-exclamation-triangle-fill me-1"></i> Advertencia Reglamentaria:
              </p>
              <p class="text-muted small mb-0">
                Al confirmar el cierre, las calificaciones quedarán selladas criptográficamente, se calculará el PGA acumulado y las notas pasarán a modo de <strong>SOLO LECTURA</strong> inmutable en cumplimiento del reglamento docente.
              </p>
            </div>
            <div class="modal-footer border-top-0 pt-0">
              <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger btn-sm" id="btn-execute-close-acta">
                <i class="bi bi-lock-fill me-1"></i> Confirmar y Cerrar Acta Definitiva
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    const offeringSelect = container.querySelector('#select-grade-offering');
    if (offeringSelect) {
      offeringSelect.addEventListener('change', (e) => {
        this.selectedOfferingId = e.target.value;
        this.feedbackMessage = null;
        this.render(container);
      });
    }

    const alertCloseBtn = container.querySelector('#btn-close-grade-alert');
    if (alertCloseBtn) {
      alertCloseBtn.addEventListener('click', () => {
        this.feedbackMessage = null;
        this.render(container);
      });
    }

    // Recálculo dinámico de notas en tiempo real
    container.querySelectorAll('.input-grade').forEach((input) => {
      input.addEventListener('input', (e) => {
        const id = e.target.getAttribute('data-id');
        const field = e.target.getAttribute('data-field');
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;
        if (val < 0) val = 0;
        if (val > 5.0) val = 5.0;

        const allGrades = Storage.getGrades();
        const item = allGrades.find((g) => g.id === id);
        if (!item || item.status === 'CERRADO_AUDITADO') return;

        item[field] = val;
        item.finalGrade = Number((item.grade1 * 0.3 + item.grade2 * 0.3 + item.grade3 * 0.4).toFixed(1));
        item.approved = item.finalGrade >= 3.0;
        item.status = 'BORRADOR';

        const finalSpan = container.querySelector(`.span-final-grade[data-id="${id}"]`);
        if (finalSpan) {
          finalSpan.textContent = item.finalGrade.toFixed(1);
          finalSpan.className = `span-final-grade ${item.finalGrade >= 3.0 ? 'text-success' : 'text-danger'}`;
        }

        const approvedSpan = container.querySelector(`.span-approved[data-id="${id}"]`);
        if (approvedSpan) {
          approvedSpan.textContent = item.approved ? 'Aprobado' : 'Reprobado';
          approvedSpan.className = `badge span-approved ${
            item.approved
              ? 'bg-success-subtle text-success border border-success-subtle'
              : 'bg-danger-subtle text-danger border border-danger-subtle'
          }`;
        }

        Storage.saveGrades(allGrades);
      });
    });

    // Guardar Borrador
    const btnDraft = container.querySelector('#btn-save-draft-grades');
    if (btnDraft) {
      btnDraft.addEventListener('click', () => {
        this.feedbackMessage = 'Borrador de calificaciones guardado exitosamente en LocalStorage.';
        this.render(container);
      });
    }

    // Abrir Modal de Cierre de Acta
    const btnOpenCloseModal = container.querySelector('#btn-open-close-acta-modal');
    if (btnOpenCloseModal) {
      btnOpenCloseModal.addEventListener('click', () => {
        const modalEl = container.querySelector('#modalConfirmCloseActa');
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
      });
    }

    // Ejecutar Cierre Definitivo de Acta
    const btnExecuteClose = container.querySelector('#btn-execute-close-acta');
    if (btnExecuteClose) {
      btnExecuteClose.addEventListener('click', () => {
        const allGrades = Storage.getGrades();
        const offerings = Storage.getOfferings();
        const off = offerings.find((o) => o.id === this.selectedOfferingId);

        allGrades.forEach((g) => {
          if (g.offeringId === this.selectedOfferingId) {
            g.status = 'CERRADO_AUDITADO';
            g.lastUpdated = new Date().toLocaleString('es-CO');
            g.updatedBy = off ? `${off.teacherName} (Universidad Isaías Gael)` : 'Docente Titular';
          }
        });

        Storage.saveGrades(allGrades);

        // Cerrar modal
        const modalEl = container.querySelector('#modalConfirmCloseActa');
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        this.feedbackMessage = '¡Acta Cerrada y Auditada con éxito! Las calificaciones han quedado selladas en modo de solo lectura.';
        this.render(container);
      });
    }
  },
};

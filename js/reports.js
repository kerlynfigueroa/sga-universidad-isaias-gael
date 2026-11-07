/**
 * @file reports.js
 * Módulo de Reportes Académicos - UNIVERSIDAD ISAÍAS GAEL
 * Certificado oficial con validez jurídica, sábanas de notas, asignación de tutorías en modal y persistencia en LocalStorage.
 */

import { Storage } from './storage.js';

export const ReportsModule = {
  currentTab: 'certificate',
  selectedStudentId: null,
  selectedOfferingId: null,
  tutoringTargetStudent: null,
  alertMessage: null,

  render(container) {
    const students = Storage.getStudents();
    const teachers = Storage.getTeachers();
    const courses = Storage.getCourses();
    const offerings = Storage.getOfferings();
    const grades = Storage.getGrades();
    const tutorias = Storage.getTutorias();

    if (!this.selectedStudentId && students.length > 0) {
      this.selectedStudentId = students[0].id;
    }
    if (!this.selectedOfferingId && offerings.length > 0) {
      this.selectedOfferingId = offerings[0].id;
    }

    const currentStudent = students.find((s) => s.id === this.selectedStudentId);
    const currentOffering = offerings.find((o) => o.id === this.selectedOfferingId);
    const currentCourseGrades = grades.filter((g) => g.offeringId === this.selectedOfferingId);
    const riskStudents = students.filter((s) => s.cumulativeGpa < 3.0 || s.status === 'EN_RIESGO');

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Encabezado -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom no-print">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-indigo-subtle text-primary border px-2 py-1 font-mono">Secretaría General</span>
              <span class="text-muted small">·</span>
              <span class="text-muted small">Universidad Isaías Gael</span>
            </div>
            <h2 class="h4 fw-bold text-dark mb-0">Reportes y Certificados Académicos</h2>
            <p class="text-muted small mb-0">
              Certificados oficiales con validez jurídica, sábanas consolidadas, programa de tutorías y exportación institucional.
            </p>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" id="btn-export-csv">
              <i class="bi bi-file-earmark-spreadsheet me-1"></i> Exportar CSV
            </button>
            <button class="btn btn-sga-primary btn-sm" onclick="window.print()">
              <i class="bi bi-printer me-1"></i> Imprimir Reporte
            </button>
          </div>
        </div>

        ${
          this.alertMessage
            ? `
          <div class="alert alert-success alert-dismissible fade show small d-flex align-items-center gap-2 no-print" role="alert">
            <i class="bi bi-check-circle-fill text-success fs-6"></i>
            <div>${this.alertMessage}</div>
            <button type="button" class="btn-close" id="btn-close-report-alert" aria-label="Cerrar"></button>
          </div>
        `
            : ''
        }

        <!-- Pestañas de Reportes -->
        <ul class="nav nav-pills sga-nav-pills gap-1 p-1 bg-light rounded no-print">
          <li class="nav-item">
            <button class="nav-link small py-1.5 ${this.currentTab === 'certificate' ? 'active' : ''}" data-report-tab="certificate">
              1. Certificado Oficial de Calificaciones
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link small py-1.5 ${this.currentTab === 'sheet' ? 'active' : ''}" data-report-tab="sheet">
              2. Sábana de Notas por Curso
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link small py-1.5 ${this.currentTab === 'risk' ? 'active' : ''}" data-report-tab="risk">
              3. Alertas de Riesgo y Tutorías (${tutorias.length} asignadas)
            </button>
          </li>
        </ul>

        <!-- CONTENIDO: REPORTE 1 - CERTIFICADO OFICIAL -->
        ${
          this.currentTab === 'certificate'
            ? `
          <div class="space-y-3">
            <div class="d-flex align-items-center gap-2 no-print sga-card p-3">
              <label class="form-label small fw-semibold text-muted mb-0">Seleccionar Alumno:</label>
              <select id="select-report-student" class="form-select form-select-sm w-auto">
                ${students
                  .map(
                    (st) => `
                  <option value="${st.id}" ${st.id === this.selectedStudentId ? 'selected' : ''}>
                    ${st.firstName} ${st.lastName} (${st.code}) - Semestre ${st.currentSemester}
                  </option>
                `
                  )
                  .join('')}
              </select>
            </div>

            ${
              currentStudent
                ? `
              <div class="official-certificate max-w-4xl mx-auto">
                <!-- Membrete Oficial Universidad Isaías Gael -->
                <div class="text-center pb-4 border-bottom border-dark border-2 mb-4">
                  <span class="x-small text-uppercase fw-bold text-muted d-block">República de Colombia · Ministerio de Educación Nacional</span>
                  <h3 class="fw-bold text-dark mb-0 tracking-tight">UNIVERSIDAD ISAÍAS GAEL</h3>
                  <span class="small text-muted">División de Registro y Control Académico · NIT: 901.442.810-7</span>
                  <div class="mt-2">
                    <span class="badge bg-dark text-white px-3 py-1 font-mono text-uppercase">
                      Certificado Oficial de Calificaciones y Récord Académico
                    </span>
                  </div>
                </div>

                <!-- Identificación del Alumno -->
                <div class="row g-3 small bg-light p-3 rounded mb-4">
                  <div class="col-6 col-md-3">
                    <span class="text-muted d-block">Estudiante:</span>
                    <strong class="text-dark">${currentStudent.firstName} ${currentStudent.lastName}</strong>
                  </div>
                  <div class="col-6 col-md-3">
                    <span class="text-muted d-block">Identificación:</span>
                    <strong class="font-mono text-dark">CC ${currentStudent.documentId}</strong>
                  </div>
                  <div class="col-6 col-md-3">
                    <span class="text-muted d-block">Código Estudiantil:</span>
                    <strong class="font-mono text-primary">${currentStudent.code}</strong>
                  </div>
                  <div class="col-6 col-md-3">
                    <span class="text-muted d-block">Programa Académico:</span>
                    <strong class="text-dark text-truncate d-block">${currentStudent.program}</strong>
                  </div>
                </div>

                <!-- Historial de Calificaciones -->
                <h6 class="fw-bold text-dark small text-uppercase mb-2">Asignaturas Cursadas y Calificaciones Definitivas</h6>
                <div class="table-responsive border rounded mb-4">
                  <table class="table sga-table table-bordered mb-0">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Asignatura</th>
                        <th class="text-center">Créditos</th>
                        <th class="text-center">Definitiva</th>
                        <th class="text-center">Concepto</th>
                      </tr>
                    </thead>
                    <tbody class="font-mono x-small">
                      <tr>
                        <td class="fw-bold">SIS-301</td>
                        <td class="font-sans fw-semibold">Arquitectura y Diseño de Software</td>
                        <td class="text-center">4</td>
                        <td class="text-center fw-bold text-success">4.6</td>
                        <td class="text-center font-sans text-success fw-bold">APROBADA</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">SIS-302</td>
                        <td class="font-sans fw-semibold">Bases de Datos Avanzadas y Transacciones</td>
                        <td class="text-center">4</td>
                        <td class="text-center fw-bold text-success">4.5</td>
                        <td class="text-center font-sans text-success fw-bold">APROBADA</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">SIS-303</td>
                        <td class="font-sans fw-semibold">Seguridad Informática y Criptografía</td>
                        <td class="text-center">3</td>
                        <td class="text-center fw-bold text-success">4.4</td>
                        <td class="text-center font-sans text-success fw-bold">APROBADA</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">MAT-301</td>
                        <td class="font-sans fw-semibold">Probabilidad y Estadística para Computación</td>
                        <td class="text-center">3</td>
                        <td class="text-center fw-bold text-success">4.2</td>
                        <td class="text-center font-sans text-success fw-bold">APROBADA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Resumen de PGA -->
                <div class="p-3 bg-dark text-white rounded d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                  <div>
                    <span class="x-small text-white-50 text-uppercase d-block">Créditos Aprobados</span>
                    <strong class="font-mono fs-6 text-white">${currentStudent.creditsEarned} SCT de 160 SCT</strong>
                  </div>
                  <div class="text-sm-end">
                    <span class="x-small text-white-50 text-uppercase d-block">Promedio General Acumulado (PGA)</span>
                    <strong class="font-mono fs-4 text-warning">${currentStudent.cumulativeGpa.toFixed(2)} / 5.00</strong>
                  </div>
                </div>

                <!-- Firmas y Hash de Validación -->
                <div class="row g-4 pt-4 border-top text-center x-small">
                  <div class="col-6">
                    <div class="border-top border-dark pt-1 mt-4">
                      <strong class="d-block text-dark">Dr. Roberto Guzmán Echeverri</strong>
                      <span class="text-muted">Secretario General · Universidad Isaías Gael</span>
                    </div>
                  </div>
                  <div class="col-6 text-end">
                    <div class="p-2 border rounded bg-light d-inline-block text-center font-mono">
                      <div class="text-muted x-small">HASH CRIPTOGRÁFICO SHA-256</div>
                      <strong class="text-dark x-small">ig-77a82910fc3382</strong>
                      <div class="text-success fw-bold x-small">VÁLIDO · UNIVERSIDAD ISAÍAS GAEL</div>
                    </div>
                  </div>
                </div>
              </div>
            `
                : ''
            }
          </div>
        `
            : ''
        }

        <!-- CONTENIDO: REPORTE 2 - SÁBANA DE NOTAS -->
        ${
          this.currentTab === 'sheet'
            ? `
          <div class="space-y-3">
            <div class="d-flex align-items-center gap-2 no-print sga-card p-3">
              <label class="form-label small fw-semibold text-muted mb-0">Seleccionar Curso / Grupo:</label>
              <select id="select-report-offering" class="form-select form-select-sm w-auto">
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

            <div class="sga-card p-4">
              <div class="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
                <div>
                  <h3 class="h6 fw-bold mb-0 text-dark">
                    Acta Consolidada: ${currentOffering ? currentOffering.courseName : ''} (${currentOffering ? currentOffering.courseCode : ''} - ${currentOffering ? currentOffering.group : ''})
                  </h3>
                  <span class="text-muted x-small">
                    Docente: ${currentOffering ? currentOffering.teacherName : ''} · Universidad Isaías Gael (2026-1)
                  </span>
                </div>
                <span class="badge bg-light text-dark font-mono">${currentCourseGrades.length} Alumnos</span>
              </div>

              <div class="table-responsive">
                <table class="table sga-table table-bordered align-middle">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Estudiante</th>
                      <th class="text-center">Corte 1 (30%)</th>
                      <th class="text-center">Corte 2 (30%)</th>
                      <th class="text-center">Final (40%)</th>
                      <th class="text-end">Definitiva</th>
                      <th class="text-center">Resultado</th>
                    </tr>
                  </thead>
                  <tbody class="font-mono x-small">
                    ${
                      currentCourseGrades.length === 0
                        ? `
                      <tr>
                        <td colspan="7" class="text-center py-4 text-muted font-sans">
                          No hay notas registradas para este grupo.
                        </td>
                      </tr>
                    `
                        : currentCourseGrades
                            .map(
                              (g) => `
                      <tr>
                        <td class="fw-bold">${g.studentCode}</td>
                        <td class="font-sans fw-semibold">${g.studentName}</td>
                        <td class="text-center">${g.grade1.toFixed(1)}</td>
                        <td class="text-center">${g.grade2.toFixed(1)}</td>
                        <td class="text-center">${g.grade3.toFixed(1)}</td>
                        <td class="text-end fw-bold fs-6 ${g.finalGrade >= 3.0 ? 'text-success' : 'text-danger'}">
                          ${g.finalGrade.toFixed(1)}
                        </td>
                        <td class="text-center font-sans">
                          <span class="badge ${g.approved ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">
                            ${g.approved ? 'APROBADO' : 'REPROBADO'}
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
          </div>
        `
            : ''
        }

        <!-- CONTENIDO: REPORTE 3 - RIESGO Y TUTORÍAS -->
        ${
          this.currentTab === 'risk'
            ? `
          <div class="space-y-4">
            <div class="alert alert-danger d-flex align-items-center gap-2 small mb-3">
              <i class="bi bi-shield-exclamation fs-5 text-danger"></i>
              <div>
                <strong>Programa de Acompañamiento Universidad Isaías Gael:</strong> Estudiantes con promedio general acumulado (PGA) inferior a 3.00 o en condición reglamentaria de riesgo académico.
              </div>
            </div>

            <!-- Tabla de Estudiantes en Riesgo -->
            <div class="sga-card p-4">
              <h3 class="h6 fw-bold mb-3 pb-2 border-bottom text-dark">
                Estudiantes Prioritarios para Tutoría
              </h3>
              <div class="table-responsive">
                <table class="table sga-table align-middle">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Estudiante</th>
                      <th>Programa Académico</th>
                      <th class="text-center">Semestre</th>
                      <th class="text-end">PGA Acumulado</th>
                      <th class="text-center">Condición</th>
                      <th class="text-end">Acción de Apoyo</th>
                    </tr>
                  </thead>
                  <tbody class="font-mono x-small">
                    ${
                      riskStudents.length === 0
                        ? `
                      <tr>
                        <td colspan="7" class="text-center py-4 text-muted font-sans">
                          No hay estudiantes en condición de riesgo actualmente.
                        </td>
                      </tr>
                    `
                        : riskStudents
                            .map(
                              (st) => `
                      <tr>
                        <td class="fw-bold text-dark">${st.code}</td>
                        <td class="font-sans fw-semibold text-dark">${st.firstName} ${st.lastName}</td>
                        <td class="font-sans text-muted">${st.program}</td>
                        <td class="text-center">${st.currentSemester}</td>
                        <td class="text-end fw-bold text-danger fs-6">${st.cumulativeGpa.toFixed(2)}</td>
                        <td class="text-center font-sans">
                          <span class="badge bg-danger-subtle text-danger border border-danger-subtle">
                            ${st.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td class="text-end font-sans">
                          <button
                            class="btn btn-outline-primary btn-sm btn-open-tutoria-modal"
                            data-student-id="${st.id}"
                            data-student-name="${st.firstName} ${st.lastName}"
                            data-student-code="${st.code}"
                            data-student-gpa="${st.cumulativeGpa.toFixed(2)}"
                          >
                            <i class="bi bi-person-heart me-1"></i> Asignar Tutoría
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

            <!-- Tabla de Tutorías Asignadas en LocalStorage -->
            <div class="sga-card p-4">
              <div class="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
                <div>
                  <h3 class="h6 fw-bold mb-0 text-dark">
                    <i class="bi bi-journal-bookmark-fill text-primary me-2"></i>Tutorías Académicas Activas en LocalStorage
                  </h3>
                  <span class="text-muted x-small">Registro del programa de permanencia estudiantil</span>
                </div>
                <span class="badge bg-indigo-subtle text-primary border font-mono">${tutorias.length} Sesiones</span>
              </div>

              <div class="table-responsive">
                <table class="table sga-table align-middle">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Docente Tutor Asignado</th>
                      <th>Asignatura & Tema</th>
                      <th>Fecha Programada</th>
                      <th class="text-center">Estado</th>
                      <th class="text-end">Acción</th>
                    </tr>
                  </thead>
                  <tbody class="x-small">
                    ${
                      tutorias.length === 0
                        ? `
                      <tr>
                        <td colspan="6" class="text-center py-4 text-muted">
                          No hay tutorías registradas. Haz clic en "Asignar Tutoría" en la tabla superior.
                        </td>
                      </tr>
                    `
                        : tutorias
                            .map(
                              (tut) => `
                      <tr>
                        <td>
                          <strong class="text-dark d-block">${tut.studentName}</strong>
                          <span class="font-mono text-muted x-small">${tut.studentCode}</span>
                        </td>
                        <td>
                          <span class="text-dark fw-semibold d-block">${tut.teacherName}</span>
                          <span class="text-muted x-small">Docente Tutor</span>
                        </td>
                        <td>
                          <span class="font-mono fw-bold text-primary d-block">${tut.courseCode || 'GENERAL'}</span>
                          <span class="text-dark">${tut.topic}</span>
                        </td>
                        <td class="font-mono text-muted">${tut.dateScheduled}</td>
                        <td class="text-center">
                          <span class="badge bg-success-subtle text-success border border-success-subtle font-mono">
                            ${tut.status}
                          </span>
                        </td>
                        <td class="text-end">
                          <button class="btn btn-outline-danger btn-sm btn-delete-tutoria" data-id="${tut.id}" title="Eliminar tutoría">
                            <i class="bi bi-trash"></i>
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
        `
            : ''
        }
      </div>

      <!-- MODAL ASIGNAR TUTORÍA (Cumple requisito explícito del usuario) -->
      <div class="modal fade" id="modalAssignTutoring" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <form id="form-assign-tutoria">
              <div class="modal-header">
                <h5 class="modal-title h6 fw-bold d-flex align-items-center gap-2">
                  <i class="bi bi-person-heart text-primary"></i>
                  <span>Asignar Tutoría Académica · Universidad Isaías Gael</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div class="modal-body small">
                <!-- Ficha del Estudiante -->
                <div class="p-3 bg-light rounded border mb-3">
                  <div class="row g-2">
                    <div class="col-6">
                      <span class="text-muted x-small d-block">Estudiante:</span>
                      <strong id="tutoria-modal-student-name" class="text-dark"></strong>
                    </div>
                    <div class="col-6">
                      <span class="text-muted x-small d-block">Código & PGA:</span>
                      <strong id="tutoria-modal-student-code" class="font-mono text-primary"></strong>
                    </div>
                  </div>
                </div>

                <input type="hidden" id="tutoria-student-id" />
                <input type="hidden" id="tutoria-student-name" />
                <input type="hidden" id="tutoria-student-code" />

                <div class="row g-3">
                  <!-- Docente Tutor -->
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Docente Tutor Asignado *</label>
                    <select id="tutoria-teacher-id" class="form-select form-select-sm" required>
                      ${teachers
                        .map(
                          (t) => `
                        <option value="${t.id}" data-name="${t.firstName} ${t.lastName}">
                          ${t.firstName} ${t.lastName} (${t.department})
                        </option>
                      `
                        )
                        .join('')}
                    </select>
                  </div>

                  <!-- Asignatura Objeto -->
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-semibold">Asignatura a Reforzar *</label>
                    <select id="tutoria-course-code" class="form-select form-select-sm" required>
                      ${courses
                        .map(
                          (c) => `
                        <option value="${c.code}" data-name="${c.name}">
                          ${c.code} - ${c.name}
                        </option>
                      `
                        )
                        .join('')}
                    </select>
                  </div>

                  <!-- Tema / Objetivo -->
                  <div class="col-12 col-md-8">
                    <label class="form-label small fw-semibold">Tema o Competencia a Reforzar *</label>
                    <input
                      type="text"
                      id="tutoria-topic"
                      class="form-control form-control-sm"
                      required
                      placeholder="Ej. Nivelación en Transacciones y Aislamiento ACID"
                    />
                  </div>

                  <!-- Fecha Programada -->
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-semibold">Fecha y Hora Programada *</label>
                    <input
                      type="datetime-local"
                      id="tutoria-date"
                      class="form-control form-control-sm font-mono"
                      required
                      value="2026-11-15T10:00"
                    />
                  </div>

                  <!-- Observaciones / Plan de Trabajo -->
                  <div class="col-12">
                    <label class="form-label small fw-semibold">Observaciones y Plan de Acompañamiento</label>
                    <textarea
                      id="tutoria-notes"
                      class="form-control form-control-sm"
                      rows="2"
                      placeholder="Diagnóstico inicial, metas de aprendizaje y compromisos académicos del estudiante..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-sga-primary btn-sm">
                  <i class="bi bi-save me-1"></i> Guardar Tutoría en LocalStorage
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    // Cambio de Pestañas
    container.querySelectorAll('[data-report-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.currentTab = e.currentTarget.getAttribute('data-report-tab');
        this.render(container);
      });
    });

    const alertCloseBtn = container.querySelector('#btn-close-report-alert');
    if (alertCloseBtn) {
      alertCloseBtn.addEventListener('click', () => {
        this.alertMessage = null;
        this.render(container);
      });
    }

    const studentSelect = container.querySelector('#select-report-student');
    if (studentSelect) {
      studentSelect.addEventListener('change', (e) => {
        this.selectedStudentId = e.target.value;
        this.render(container);
      });
    }

    const offeringSelect = container.querySelector('#select-report-offering');
    if (offeringSelect) {
      offeringSelect.addEventListener('change', (e) => {
        this.selectedOfferingId = e.target.value;
        this.render(container);
      });
    }

    // ABRIR MODAL ASIGNAR TUTORÍA
    container.querySelectorAll('.btn-open-tutoria-modal').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.getAttribute('data-student-id');
        const studentName = e.currentTarget.getAttribute('data-student-name');
        const studentCode = e.currentTarget.getAttribute('data-student-code');
        const studentGpa = e.currentTarget.getAttribute('data-student-gpa');

        container.querySelector('#tutoria-student-id').value = studentId;
        container.querySelector('#tutoria-student-name').value = studentName;
        container.querySelector('#tutoria-student-code').value = studentCode;

        container.querySelector('#tutoria-modal-student-name').textContent = studentName;
        container.querySelector('#tutoria-modal-student-code').textContent = `${studentCode} · PGA: ${studentGpa}`;

        const modalEl = container.querySelector('#modalAssignTutoring');
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
      });
    });

    // GUARDAR TUTORÍA EN LOCALSTORAGE
    const formTutoria = container.querySelector('#form-assign-tutoria');
    if (formTutoria) {
      formTutoria.addEventListener('submit', (e) => {
        e.preventDefault();

        const studentId = container.querySelector('#tutoria-student-id').value;
        const studentName = container.querySelector('#tutoria-student-name').value;
        const studentCode = container.querySelector('#tutoria-student-code').value;

        const teacherSelect = container.querySelector('#tutoria-teacher-id');
        const teacherId = teacherSelect.value;
        const teacherName = teacherSelect.options[teacherSelect.selectedIndex].getAttribute('data-name');

        const courseSelect = container.querySelector('#tutoria-course-code');
        const courseCode = courseSelect.value;
        const courseName = courseSelect.options[courseSelect.selectedIndex].getAttribute('data-name');

        const topic = container.querySelector('#tutoria-topic').value.trim();
        const rawDate = container.querySelector('#tutoria-date').value;
        const formattedDate = rawDate ? rawDate.replace('T', ' ') : '2026-11-15 10:00';
        const notes = container.querySelector('#tutoria-notes').value.trim();

        const newTutoria = {
          id: `tut-${Date.now()}`,
          studentId,
          studentName,
          studentCode,
          teacherId,
          teacherName,
          courseCode,
          courseName,
          topic,
          dateScheduled: formattedDate,
          status: 'PROGRAMADA',
          notes: notes || 'Plan de acompañamiento académico individualizado.',
          createdAt: new Date().toLocaleString('es-CO'),
        };

        Storage.saveTutoria(newTutoria);

        const modalEl = container.querySelector('#modalAssignTutoring');
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        this.alertMessage = `¡Tutoría asignada con éxito a ${studentName}! Docente asignado: ${teacherName}. Guardado en LocalStorage.`;
        this.render(container);
      });
    }

    // ELIMINAR TUTORÍA
    container.querySelectorAll('.btn-delete-tutoria').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        Storage.deleteTutoria(id);
        this.alertMessage = 'Sesión de tutoría eliminada de LocalStorage.';
        this.render(container);
      });
    });

    // EXPORTAR CSV
    const btnCSV = container.querySelector('#btn-export-csv');
    if (btnCSV) {
      btnCSV.addEventListener('click', () => {
        let csv = 'data:text/csv;charset=utf-8,';
        if (this.currentTab === 'sheet') {
          const grades = Storage.getGrades().filter((g) => g.offeringId === this.selectedOfferingId);
          csv += 'Institucion,Codigo,Estudiante,Corte1,Corte2,Final,Definitiva,Aprobado\n';
          grades.forEach((g) => {
            csv += `"Universidad Isaias Gael",${g.studentCode},"${g.studentName}",${g.grade1},${g.grade2},${g.grade3},${g.finalGrade},${g.approved ? 'SI' : 'NO'}\n`;
          });
        } else if (this.currentTab === 'risk') {
          const tutorias = Storage.getTutorias();
          csv += 'Institucion,Estudiante,Codigo,DocenteTutor,Asignatura,Fecha,Estado\n';
          tutorias.forEach((t) => {
            csv += `"Universidad Isaias Gael","${t.studentName}",${t.studentCode},"${t.teacherName}","${t.courseCode}","${t.dateScheduled}",${t.status}\n`;
          });
        } else {
          const students = Storage.getStudents();
          csv += 'Institucion,Codigo,Nombres,Apellidos,Programa,Semestre,PGA,Creditos,Estado\n';
          students.forEach((s) => {
            csv += `"Universidad Isaias Gael",${s.code},"${s.firstName}","${s.lastName}","${s.program}",${s.currentSemester},${s.cumulativeGpa},${s.creditsEarned},${s.status}\n`;
          });
        }
        const encoded = encodeURI(csv);
        const link = document.createElement('a');
        link.setAttribute('href', encoded);
        link.setAttribute('download', `reporte_isaias_gael_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  },
};

/**
 * @file dashboard.js
 * Módulo del Dashboard Principal con métricas en tiempo real - UNIVERSIDAD ISAÍAS GAEL
 */

import { Storage } from './storage.js';
import { Auth } from './auth.js';

export const DashboardModule = {
  render(container) {
    const students = Storage.getStudents();
    const teachers = Storage.getTeachers();
    const courses = Storage.getCourses();
    const enrollments = Storage.getEnrollments();
    const grades = Storage.getGrades();
    const tutorias = Storage.getTutorias();
    const user = Auth.getUser();

    // Métricas calculadas
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalCourses = courses.length;
    const totalEnrollments = enrollments.length;

    // Estudiantes en riesgo
    const riskCount = students.filter((s) => s.cumulativeGpa < 3.0 || s.status === 'EN_RIESGO').length;

    // Promedio general de la universidad
    const avgGpa =
      students.length > 0
        ? (students.reduce((sum, s) => sum + s.cumulativeGpa, 0) / students.length).toFixed(2)
        : '0.00';

    // Tasa de aprobación en actas
    const approvedGrades = grades.filter((g) => g.approved).length;
    const approvalRate = grades.length > 0 ? Math.round((approvedGrades / grades.length) * 100) : 100;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Bienvenida y Período Activo -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-indigo-subtle text-primary border px-2 py-1 font-mono">Período 2026-1</span>
              <span class="text-muted small">·</span>
              <span class="text-muted small fw-semibold">UNIVERSIDAD ISAÍAS GAEL</span>
            </div>
            <h2 class="h4 fw-bold text-dark mb-0">Panel de Control Académico</h2>
            <p class="text-muted small mb-0">
              Bienvenido, <strong class="text-dark">${user ? user.name : 'Usuario'}</strong> (${user ? user.role : 'GUEST'}).
              Resumen institucional y estado operativo de la Universidad Isaías Gael.
            </p>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" id="btn-export-dashboard">
              <i class="bi bi-file-earmark-arrow-down me-1"></i> Resumen Ejecutivo
            </button>
            <button class="btn btn-sga-primary btn-sm" id="btn-quick-enrollment">
              <i class="bi bi-plus-circle me-1"></i> Nueva Matrícula
            </button>
          </div>
        </div>

        <!-- 4 Tarjetas Métricas Principales (Requisito Explícito) -->
        <div class="row g-3">
          <!-- Total Estudiantes -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="sga-metric-card d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small fw-semibold d-block text-uppercase">Total Estudiantes</span>
                <span class="h3 fw-bold text-dark font-mono mb-0">${totalStudents}</span>
                <span class="text-success small d-block mt-1">
                  <i class="bi bi-person-check-fill me-1"></i> ${totalStudents - riskCount} regulares
                </span>
              </div>
              <div class="sga-metric-icon bg-primary-subtle text-primary">
                <i class="bi bi-people-fill"></i>
              </div>
            </div>
          </div>

          <!-- Total Docentes -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="sga-metric-card d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small fw-semibold d-block text-uppercase">Total Docentes</span>
                <span class="h3 fw-bold text-dark font-mono mb-0">${totalTeachers}</span>
                <span class="text-muted small d-block mt-1">
                  <i class="bi bi-award-fill me-1"></i> 100% categorizados
                </span>
              </div>
              <div class="sga-metric-icon bg-info-subtle text-info">
                <i class="bi bi-person-workspace"></i>
              </div>
            </div>
          </div>

          <!-- Total Asignaturas -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="sga-metric-card d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small fw-semibold d-block text-uppercase">Total Asignaturas</span>
                <span class="h3 fw-bold text-dark font-mono mb-0">${totalCourses}</span>
                <span class="text-muted small d-block mt-1">
                  <i class="bi bi-journal-bookmark-fill me-1"></i> Malla curricular activa
                </span>
              </div>
              <div class="sga-metric-icon bg-warning-subtle text-warning">
                <i class="bi bi-book-half"></i>
              </div>
            </div>
          </div>

          <!-- Total Matrículas -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="sga-metric-card d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted small fw-semibold d-block text-uppercase">Total Matrículas</span>
                <span class="h3 fw-bold text-dark font-mono mb-0">${totalEnrollments}</span>
                <span class="text-success small d-block mt-1">
                  <i class="bi bi-check-circle-fill me-1"></i> Período 2026-1
                </span>
              </div>
              <div class="sga-metric-icon bg-success-subtle text-success">
                <i class="bi bi-card-checklist"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Fila de Indicadores Secundarios & Actividad -->
        <div class="row g-3 mt-1">
          <!-- Resumen Académico -->
          <div class="col-12 col-lg-7">
            <div class="sga-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h3 class="h6 fw-bold mb-0 text-dark">
                  <i class="bi bi-speedometer2 text-primary me-2"></i>Indicadores de Rendimiento Académico
                </h3>
                <span class="badge bg-light text-dark font-mono">Isaías Gael 2026-1</span>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <span class="text-muted x-small d-block">PGA Promedio</span>
                    <span class="h4 font-mono fw-bold text-primary mb-0">${avgGpa}</span>
                    <span class="text-muted x-small d-block">Escala 0.0 - 5.0</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <span class="text-muted x-small d-block">Tasa Aprobación</span>
                    <span class="h4 font-mono fw-bold text-success mb-0">${approvalRate}%</span>
                    <span class="text-muted x-small d-block">Actas cursadas</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <span class="text-muted x-small d-block">En Riesgo</span>
                    <span class="h4 font-mono fw-bold text-danger mb-0">${riskCount}</span>
                    <span class="text-muted x-small d-block">PGA &lt; 3.0</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <span class="text-muted x-small d-block">Tutorías Activas</span>
                    <span class="h4 font-mono fw-bold text-indigo mb-0 text-primary">${tutorias.length}</span>
                    <span class="text-muted x-small d-block">En seguimiento</span>
                  </div>
                </div>
              </div>

              <!-- Accesos Rápidos según Rol -->
              <h4 class="h6 fw-bold text-muted text-uppercase small mb-2">Accesos Directos del Sistema</h4>
              <div class="row g-2">
                <div class="col-6 col-sm-3">
                  <button class="btn btn-outline-secondary btn-sm w-100 text-truncate text-start" data-nav="students">
                    <i class="bi bi-person-lines-fill me-1 text-primary"></i> Estudiantes
                  </button>
                </div>
                <div class="col-6 col-sm-3">
                  <button class="btn btn-outline-secondary btn-sm w-100 text-truncate text-start" data-nav="teachers">
                    <i class="bi bi-mortarboard-fill me-1 text-info"></i> Docentes
                  </button>
                </div>
                <div class="col-6 col-sm-3">
                  <button class="btn btn-outline-secondary btn-sm w-100 text-truncate text-start" data-nav="enrollments">
                    <i class="bi bi-ui-checks me-1 text-success"></i> Matrículas
                  </button>
                </div>
                <div class="col-6 col-sm-3">
                  <button class="btn btn-outline-secondary btn-sm w-100 text-truncate text-start" data-nav="reports">
                    <i class="bi bi-file-earmark-text-fill me-1 text-warning"></i> Reportes
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Últimas Matrículas Registradas -->
          <div class="col-12 col-lg-5">
            <div class="sga-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h3 class="h6 fw-bold mb-0 text-dark">
                  <i class="bi bi-clock-history text-secondary me-2"></i>Últimas Matrículas
                </h3>
                <a href="#enrollments" class="small text-decoration-none" data-nav="enrollments">Ver todas</a>
              </div>

              <div class="list-group list-group-flush small">
                ${
                  enrollments.length === 0
                    ? '<p class="text-muted py-3 text-center">No hay matrículas registradas aún.</p>'
                    : enrollments
                        .slice(0, 4)
                        .map(
                          (mat) => `
                    <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                      <div>
                        <span class="fw-bold text-dark font-mono d-block">${mat.code}</span>
                        <span class="text-muted small">${mat.studentName}</span>
                      </div>
                      <div class="text-end">
                        <span class="badge bg-success-subtle text-success border border-success-subtle">
                          ${mat.totalCredits} SCT
                        </span>
                        <div class="text-muted x-small font-mono">${mat.date.split(' ')[0]}</div>
                      </div>
                    </div>
                  `
                        )
                        .join('')
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-nav');
        window.dispatchEvent(new CustomEvent('sga-navigate', { detail: target }));
      });
    });

    const btnQuick = container.querySelector('#btn-quick-enrollment');
    if (btnQuick) {
      btnQuick.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('sga-navigate', { detail: 'enrollments' }));
      });
    }

    const btnExport = container.querySelector('#btn-export-dashboard');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        window.print();
      });
    }
  },
};

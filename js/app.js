/**
 * @file app.js
 * Orquestador principal de la aplicación web del Sistema de Gestión Académica (SGA)
 */

import { Storage } from './storage.js';
import { Auth } from './auth.js';
import { DashboardModule } from './dashboard.js';
import { StudentsModule } from './students.js';
import { TeachersModule } from './teachers.js';
import { CoursesModule } from './courses.js';
import { EnrollmentsModule } from './enrollments.js';
import { GradesModule } from './grades.js';
import { ReportsModule } from './reports.js';

class SGAApp {
  constructor() {
    this.currentModule = 'dashboard';
    this.init();
  }

  init() {
    // 1. Inicializar almacenamiento
    Storage.init();

    // 2. Comprobar sesión predeterminada
    Auth.ensureDefaultSession();

    // 3. Vincular eventos globales y navegación
    this.bindGlobalEvents();

    // 4. Renderizar UI inicial
    this.updateUserInterface();
    this.navigateTo(this.currentModule);
  }

  updateUserInterface() {
    const user = Auth.getUser();
    const userBadgeEl = document.getElementById('user-profile-badge');
    const userRoleEl = document.getElementById('user-role-badge');
    const userAvatarEl = document.getElementById('user-avatar');

    if (user && userBadgeEl) {
      userBadgeEl.textContent = user.name;
      if (userRoleEl) userRoleEl.textContent = user.role;
      if (userAvatarEl) userAvatarEl.textContent = user.avatar || user.name.slice(0, 2).toUpperCase();
    }

    // Ajustar visibilidad de ítems en sidebar según rol
    const role = user ? user.role : 'GUEST';
    document.querySelectorAll('[data-allowed-roles]').forEach((el) => {
      const allowed = el.getAttribute('data-allowed-roles').split(',');
      if (allowed.includes(role)) {
        el.classList.remove('d-none');
      } else {
        el.classList.add('d-none');
      }
    });
  }

  navigateTo(moduleName) {
    this.currentModule = moduleName;

    // Actualizar enlaces del sidebar
    document.querySelectorAll('.sga-sidebar .nav-link').forEach((link) => {
      if (link.getAttribute('data-module') === moduleName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const mainContainer = document.getElementById('sga-main-content');
    if (!mainContainer) return;

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Renderizar módulo solicitado
    switch (moduleName) {
      case 'dashboard':
        DashboardModule.render(mainContainer);
        break;
      case 'students':
        StudentsModule.render(mainContainer);
        break;
      case 'teachers':
        TeachersModule.render(mainContainer);
        break;
      case 'courses':
        CoursesModule.render(mainContainer);
        break;
      case 'enrollments':
        EnrollmentsModule.render(mainContainer);
        break;
      case 'grades':
        GradesModule.render(mainContainer);
        break;
      case 'reports':
        ReportsModule.render(mainContainer);
        break;
      case 'architecture':
        this.renderArchitectureDossier(mainContainer);
        break;
      default:
        DashboardModule.render(mainContainer);
    }
  }

  bindGlobalEvents() {
    // Navegación por data-module
    document.querySelectorAll('[data-module]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.currentTarget.getAttribute('data-module');
        this.navigateTo(target);

        // Si es mobile y el offcanvas está abierto, cerrarlo
        const offcanvasEl = document.getElementById('sgaSidebarOffcanvas');
        if (offcanvasEl) {
          const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
          if (bsOffcanvas) bsOffcanvas.hide();
        }
      });
    });

    // Evento personalizado de navegación
    window.addEventListener('sga-navigate', (e) => {
      this.navigateTo(e.detail);
    });

    // Modal de Login
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
      formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const res = Auth.login(email, password);

        if (res.success) {
          const modalEl = document.getElementById('modalLogin');
          const bsModal = window.bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();

          this.updateUserInterface();
          this.navigateTo('dashboard');
        } else {
          const errEl = document.getElementById('login-error-msg');
          if (errEl) {
            errEl.textContent = res.message;
            errEl.classList.remove('d-none');
          }
        }
      });
    }

    // Botones rápidos para rellenar credenciales en el modal de login
    document.querySelectorAll('[data-fill-role]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const role = e.currentTarget.getAttribute('data-fill-role');
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');

        if (role === 'ADMIN') {
          emailInput.value = 'admin@isaiasgael.edu';
          passInput.value = 'admin123';
        } else if (role === 'DOCENTE') {
          emailInput.value = 'docente@isaiasgael.edu';
          passInput.value = 'docente123';
        } else if (role === 'ESTUDIANTE') {
          emailInput.value = 'estudiante@isaiasgael.edu';
          passInput.value = 'estudiante123';
        }
      });
    });

    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        Auth.logout();
        const modalEl = new window.bootstrap.Modal(document.getElementById('modalLogin'));
        modalEl.show();
        this.updateUserInterface();
      });
    }

    // Reiniciar base de datos a estado inicial (sin confirmación nativa de iframe)
    const btnResetDb = document.getElementById('btn-reset-db');
    if (btnResetDb) {
      btnResetDb.addEventListener('click', () => {
        Storage.resetDatabase();
        this.navigateTo(this.currentModule);
      });
    }
  }

  renderArchitectureDossier(container) {
    container.innerHTML = `
      <div class="sga-card p-4 p-md-5">
        <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-4">
          <div>
            <span class="badge bg-primary-subtle text-primary border px-2 py-1 font-mono">IEEE 1471 / ISO/IEC 42010</span>
            <h2 class="h4 fw-bold text-dark mt-2 mb-0">Dossier de Arquitectura de Software · UNIVERSIDAD ISAÍAS GAEL</h2>
            <p class="text-muted small mb-0">Especificación arquitectónica formal para la Universidad Isaías Gael.</p>
          </div>
          <button class="btn btn-outline-secondary btn-sm" onclick="window.print()">
            <i class="bi bi-printer me-1"></i> Imprimir Dossier
          </button>
        </div>

        <div class="row g-4 small text-dark leading-relaxed">
          <div class="col-12 col-md-6">
            <div class="p-3 bg-light rounded border h-100">
              <h3 class="h6 fw-bold text-primary mb-2">1. Identificación de Actores</h3>
              <p class="text-muted x-small">
                <strong>Estudiante:</strong> Inscribe asignaturas, consulta notas y solicita certificados.<br>
                <strong>Docente:</strong> Administra listas de aula, digita notas por cortes y cierra actas.<br>
                <strong>Director de Programa:</strong> Planifica la oferta semestral y supervisa deserción.<br>
                <strong>Registrador:</strong> Parametriza calendarios, emite actas y reportes ministeriales.
              </p>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="p-3 bg-light rounded border h-100">
              <h3 class="h6 fw-bold text-primary mb-2">2. Requerimientos Funcionales</h3>
              <p class="text-muted x-small">
                · Gestión de Estudiantes (CRUD + PGA).<br>
                · Gestión de Docentes (Escalafón y carga horaria).<br>
                · Gestión de Asignaturas (Créditos SCT y pre-requisitos).<br>
                · Matrícula concurrente con tope de 20 créditos.<br>
                · Registro de calificaciones multi-corte (30%-30%-40%).<br>
                · Reportes oficiales y sábanas de notas.
              </p>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="p-3 bg-light rounded border h-100">
              <h3 class="h6 fw-bold text-primary mb-2">3. Requerimientos No Funcionales (ISO 25010)</h3>
              <p class="text-muted x-small">
                · <strong>Rendimiento:</strong> p95 &lt; 800ms bajo 5.000 transacciones/minuto.<br>
                · <strong>Seguridad:</strong> TLS 1.3, AES-256 en reposo y control RBAC estricto.<br>
                · <strong>Disponibilidad:</strong> SLA 99.9% y RTO &lt; 1 hora.<br>
                · <strong>Consistencia:</strong> Transacciones ACID para prevención de sobrecupos.
              </p>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="p-3 bg-light rounded border h-100">
              <h3 class="h6 fw-bold text-primary mb-2">4. Restricciones del Sistema</h3>
              <p class="text-muted x-small">
                · Escala de calificaciones 0.0 a 5.0 con nota mínima aprobatoria en 3.0.<br>
                · Límite semestral estricto de 20 créditos académicos por estudiante.<br>
                · Ventanas temporales rígidas de calendario institucional para cierre de actas.<br>
                · Despliegue en contenedores OCI compatibles con Docker y Kubernetes.
              </p>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="p-3 bg-light rounded border h-100">
              <h3 class="h6 fw-bold text-primary mb-2">6 & 7. Arquitectura Recomendada y Justificación</h3>
              <p class="text-muted x-small">
                <strong>Arquitectura Limpia / Hexagonal Modular:</strong> Desacoplamiento total entre las reglas académicas de dominio y los adaptadores de infraestructura.<br>
                <strong>Persistencia:</strong> PostgreSQL 16 con nivel de aislamiento Repeatable Read y Redis Cluster como semáforo de alta velocidad para cupos durante picos de matrícula.
              </p>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="p-3 bg-light rounded border h-100">
              <h3 class="h6 fw-bold text-primary mb-2">10. Riesgos Arquitectónicos & Mitigación</h3>
              <p class="text-muted x-small">
                · <strong>Condición de carrera en matrícula:</strong> SELECT FOR UPDATE pesimista + Redis atomic counter.<br>
                · <strong>Adulteración de notas:</strong> Tabla de auditoría Append-Only con hash SHA-256 inmutable.<br>
                · <strong>Sobrecarga por reportes:</strong> Separación CQRS con réplicas de lectura.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.sgaApp = new SGAApp();
});

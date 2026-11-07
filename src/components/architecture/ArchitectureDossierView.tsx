import React, { useState } from 'react';
import {
  ARCHITECTURE_METADATA,
  SYSTEM_ACTORS,
  FUNCTIONAL_REQUIREMENTS,
  NON_FUNCTIONAL_REQUIREMENTS,
  SYSTEM_CONSTRAINTS,
  PRIMARY_USE_CASES,
  RECOMMENDED_ARCHITECTURE,
  ARCHITECTURE_JUSTIFICATION,
  SYSTEM_COMPONENTS,
  DATABASE_ENTITIES,
  ARCHITECTURAL_RISKS,
  QUALITY_ATTRIBUTES,
} from '../../data/architectureDossier';
import {
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  Copy,
  Check,
  ChevronRight,
  Download,
  Building,
  KeyRound,
  Zap,
} from 'lucide-react';

export const ArchitectureDossierView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [selectedEntity, setSelectedEntity] = useState<string>('Estudiante');
  const [copiedDDL, setCopiedDDL] = useState<boolean>(false);
  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);

  const sections = [
    { id: 1, title: '1. Identificación de Actores', count: SYSTEM_ACTORS.length },
    { id: 2, title: '2. Requerimientos Funcionales', count: FUNCTIONAL_REQUIREMENTS.length },
    { id: 3, title: '3. Requerimientos No Funcionales', count: NON_FUNCTIONAL_REQUIREMENTS.length },
    { id: 4, title: '4. Restricciones del Sistema', count: SYSTEM_CONSTRAINTS.length },
    { id: 5, title: '5. Casos de Uso Principales', count: PRIMARY_USE_CASES.length },
    { id: 6, title: '6. Arquitectura Recomendada', subtitle: 'Limpia / C4 Model' },
    { id: 7, title: '7. Justificación de Arquitectura', count: ARCHITECTURE_JUSTIFICATION.length },
    { id: 8, title: '8. Componentes del Sistema', count: SYSTEM_COMPONENTS.length },
    { id: 9, title: '9. Entidades y Esquema BD', count: DATABASE_ENTITIES.length },
    { id: 10, title: '10. Riesgos Arquitectónicos', count: ARCHITECTURAL_RISKS.length },
    { id: 11, title: '11. Atributos de Calidad', count: QUALITY_ATTRIBUTES.length },
  ];

  const postgresDDLScript = `-- ==========================================================
-- SISTEMA DE GESTIÓN ACADÉMICA (SGA) - ESQUEMA DDL POSTGRESQL 16
-- Cumplimiento de integridad referencial, índices y ACID
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA ESTUDIANTES
CREATE TABLE IF NOT EXISTS estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) NOT NULL UNIQUE,
    documento_identidad VARCHAR(30) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_institucional VARCHAR(120) NOT NULL UNIQUE,
    telefono VARCHAR(25),
    programa_id UUID NOT NULL,
    semestre_actual INT NOT NULL CHECK (semestre_actual BETWEEN 1 AND 12),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'EN_RIESGO', 'MATRICULADO', 'EGRESADO', 'RETIRADO')),
    creditos_aprobados INT NOT NULL DEFAULT 0,
    pga_acumulado NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (pga_acumulado BETWEEN 0.00 AND 5.00),
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DOCENTES
CREATE TABLE IF NOT EXISTS docentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) NOT NULL UNIQUE,
    documento_identidad VARCHAR(30) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_institucional VARCHAR(120) NOT NULL UNIQUE,
    departamento VARCHAR(100) NOT NULL,
    categoria VARCHAR(30) NOT NULL CHECK (categoria IN ('TITULAR', 'ASOCIADO', 'ASISTENTE', 'CATEDRA')),
    horas_semanales INT NOT NULL CHECK (horas_semanales BETWEEN 1 AND 40),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA ASIGNATURAS
CREATE TABLE IF NOT EXISTS asignaturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    creditos INT NOT NULL CHECK (creditos BETWEEN 1 AND 12),
    semestre_sugerido INT NOT NULL,
    horas_teoricas INT NOT NULL DEFAULT 3,
    horas_practicas INT NOT NULL DEFAULT 2,
    departamento VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA PRE-REQUISITOS (GRAFO DIRIGIDO ACÍCLICO)
CREATE TABLE IF NOT EXISTS requisitos_asignatura (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asignatura_id UUID NOT NULL REFERENCES asignaturas(id) ON DELETE CASCADE,
    prerrequisito_id UUID NOT NULL REFERENCES asignaturas(id) ON DELETE RESTRICT,
    tipo VARCHAR(20) NOT NULL DEFAULT 'OBLIGATORIO' CHECK (tipo IN ('OBLIGATORIO', 'CORREQUISITO')),
    UNIQUE(asignatura_id, prerrequisito_id)
);

-- 5. TABLA CURSOS OFERTADOS (GRUPOS Y CUPOS)
CREATE TABLE IF NOT EXISTS cursos_ofertados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asignatura_id UUID NOT NULL REFERENCES asignaturas(id),
    periodo_academico VARCHAR(10) NOT NULL,
    grupo VARCHAR(10) NOT NULL,
    docente_id UUID NOT NULL REFERENCES docentes(id),
    horario VARCHAR(100) NOT NULL,
    aula VARCHAR(50) NOT NULL,
    cupo_maximo INT NOT NULL CHECK (cupo_maximo > 0),
    cupos_ocupados INT NOT NULL DEFAULT 0 CHECK (cupos_ocupados <= cupo_maximo),
    UNIQUE(asignatura_id, periodo_academico, grupo)
);

-- 6. TABLA MATRICULAS (TRANSACCIÓN CENTRAL)
CREATE TABLE IF NOT EXISTS matriculas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_matricula VARCHAR(30) NOT NULL UNIQUE,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id),
    periodo_academico VARCHAR(10) NOT NULL,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_creditos INT NOT NULL CHECK (total_creditos <= 20),
    estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA' CHECK (estado IN ('CONFIRMADA', 'PENDIENTE', 'CANCELADA')),
    UNIQUE(estudiante_id, periodo_academico)
);

-- 7. TABLA DETALLE DE MATRÍCULA
CREATE TABLE IF NOT EXISTS detalle_matricula (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    curso_ofertado_id UUID NOT NULL REFERENCES cursos_ofertados(id),
    UNIQUE(matricula_id, curso_ofertado_id)
);

-- 8. TABLA CALIFICACIONES
CREATE TABLE IF NOT EXISTS calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_ofertado_id UUID NOT NULL REFERENCES cursos_ofertados(id),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id),
    nota_corte1 NUMERIC(3,1) CHECK (nota_corte1 BETWEEN 0.0 AND 5.0),
    nota_corte2 NUMERIC(3,1) CHECK (nota_corte2 BETWEEN 0.0 AND 5.0),
    nota_examen_final NUMERIC(3,1) CHECK (nota_examen_final BETWEEN 0.0 AND 5.0),
    nota_definitiva NUMERIC(3,1) CHECK (nota_definitiva BETWEEN 0.0 AND 5.0),
    aprobado BOOLEAN,
    estado VARCHAR(25) NOT NULL DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'ENVIADO', 'CERRADO_AUDITADO')),
    ultima_modificacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modificado_por VARCHAR(100) NOT NULL,
    UNIQUE(curso_ofertado_id, estudiante_id)
);

-- 9. ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX idx_estudiantes_codigo ON estudiantes(codigo);
CREATE INDEX idx_estudiantes_pga ON estudiantes(pga_acumulado);
CREATE INDEX idx_cursos_periodo ON cursos_ofertados(periodo_academico);
CREATE INDEX idx_matriculas_estudiante_periodo ON matriculas(estudiante_id, periodo_academico);
CREATE INDEX idx_calificaciones_curso ON calificaciones(curso_ofertado_id);
`;

  const copyToClipboard = (text: string, type: 'ddl' | 'doc') => {
    navigator.clipboard.writeText(text);
    if (type === 'ddl') {
      setCopiedDDL(true);
      setTimeout(() => setCopiedDDL(false), 2000);
    } else {
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2000);
    }
  };

  const getFullMarkdownDoc = () => {
    return `# DOSSIER DE ARQUITECTURA DE SOFTWARE
## Sistema de Gestión Académica Universitario (SGA-U)
**Versión:** ${ARCHITECTURE_METADATA.version}
**Estado:** ${ARCHITECTURE_METADATA.status}
**Autor:** ${ARCHITECTURE_METADATA.author}

---

### 1. IDENTIFICACIÓN DE ACTORES
${SYSTEM_ACTORS.map(
  (a) => `#### ${a.name} (${a.role})
- **Categoría:** ${a.category}
- **Descripción:** ${a.description}
- **Responsabilidades:**
${a.responsibilities.map((r) => `  * ${r}`).join('\n')}
- **Canales de acceso:** ${a.accessChannels.join(', ')}
`
).join('\n')}

---

### 2. REQUERIMIENTOS FUNCIONALES
${FUNCTIONAL_REQUIREMENTS.map(
  (rf) => `* **[${rf.id}] ${rf.title}** (Prioridad: ${rf.priority})
  * ${rf.description}
  * *Justificación de negocio:* ${rf.rationale}`
).join('\n\n')}

---

### 3. REQUERIMIENTOS NO FUNCIONALES (ISO/IEC 25010)
${NON_FUNCTIONAL_REQUIREMENTS.map(
  (rnf) => `* **[${rnf.id}] ${rnf.title}** (Estándar: ${rnf.isoStandard})
  * ${rnf.description}
  * *Impacto arquitectónico:* ${rnf.rationale}`
).join('\n\n')}

---

### 4. RESTRICCIONES DEL SISTEMA
${SYSTEM_CONSTRAINTS.map(
  (c) => `* **[${c.id}] ${c.name}:** ${c.detail} (${c.category})`
).join('\n')}

---

### 5. CASOS DE USO PRINCIPALES
${PRIMARY_USE_CASES.map(
  (cu) => `#### ${cu.id}: ${cu.title}
- **Actor:** ${cu.actor}
- **Precondiciones:** ${cu.preconditions.join('; ')}
- **Flujo Principal:**
${cu.mainFlow.map((s) => `  ${s}`).join('\n')}
- **Postcondiciones:** ${cu.postconditions.join('; ')}
- **Flujo Alternativo:** ${cu.alternativeFlow}
- **Reglas de Negocio:** ${cu.businessRules.join(', ')}
`
).join('\n')}

---

### 6. ARQUITECTURA RECOMENDADA
- **Estilo:** ${RECOMMENDED_ARCHITECTURE.style}
- **Paradigma:** ${RECOMMENDED_ARCHITECTURE.paradigm}
- **Frontend:** ${RECOMMENDED_ARCHITECTURE.frontend.framework} - ${RECOMMENDED_ARCHITECTURE.frontend.pattern}
- **Backend:** ${RECOMMENDED_ARCHITECTURE.backend.runtime} con capas:
${RECOMMENDED_ARCHITECTURE.backend.layers.map((l) => `  * ${l}`).join('\n')}
- **Base de Datos:** ${RECOMMENDED_ARCHITECTURE.database.engine} - ${RECOMMENDED_ARCHITECTURE.database.justification}
- **Caché y Concurrencia:** ${RECOMMENDED_ARCHITECTURE.database.cache}
- **Despliegue e Infraestructura:** ${RECOMMENDED_ARCHITECTURE.deployment.orchestration}

---

### 7. JUSTIFICACIÓN DE LA ARQUITECTURA
${ARCHITECTURE_JUSTIFICATION.map((j) => `#### ${j.aspect}\n${j.argument}`).join('\n\n')}

---

### 8. COMPONENTES DEL SISTEMA
${SYSTEM_COMPONENTS.map(
  (c) => `* **${c.name}** [${c.layer}]
  * Tecnologías: ${c.technologies}
  * Función: ${c.description}`
).join('\n\n')}

---

### 9. ENTIDADES DE BASE DE DATOS
${DATABASE_ENTITIES.map(
  (e) => `#### Tabla: ${e.table} (${e.name})
- **PK:** ${e.primaryKey}
- **Descripción:** ${e.description}
- **Relaciones:** ${e.relationships.join(', ')}
`
).join('\n')}

---

### 10. RIESGOS ARQUITECTÓNICOS
${ARCHITECTURAL_RISKS.map(
  (r) => `* **[${r.id}] ${r.title}** (Impacto: ${r.impact} | Probabilidad: ${r.probability})
  * *Descripción:* ${r.description}
  * *Mitigación:* ${r.mitigationStrategy}
  * *Contingencia:* ${r.contingencyPlan}`
).join('\n\n')}

---

### 11. ATRIBUTOS DE CALIDAD (ESCENARIOS ISO/IEC 25010)
${QUALITY_ATTRIBUTES.map(
  (q) => `#### ${q.attribute}
- **Escenario:** ${q.scenario}
- **Métrica:** ${q.metric}
- **Táctica Arquitectónica:** ${q.tactic}
`
).join('\n')}
`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Dossier Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 mb-8 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="font-semibold text-indigo-400">IEEE 1471 / ISO/IEC 42010</span>
              <span aria-hidden="true">·</span>
              <span>Documento Técnico Oficial</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">Estado: {ARCHITECTURE_METADATA.status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Dossier de Arquitectura de Software: Sistema de Gestión Académica (SGA)
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Diseño arquitectónico formal previo al desarrollo de código para una universidad de educación superior.
              Cubre los 11 aspectos de ingeniería de software requeridos: actores, requerimientos, restricciones, casos de uso,
              patrón arquitectónico hexagonal, DDL relacional, matriz de riesgos de concurrencia y atributos ISO 25010.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => copyToClipboard(getFullMarkdownDoc(), 'doc')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
            >
              {copiedDoc ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedDoc ? 'Dossier Copiado' : 'Copiar Dossier Markdown'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([getFullMarkdownDoc()], { type: 'text/markdown;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Dossier_Arquitectura_SGA_Universitario.md';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .MD</span>
            </button>
          </div>
        </div>

        {/* Architectural Metadata Strip */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Escala Objetivo</span>
            <span className="font-semibold text-slate-100">{ARCHITECTURE_METADATA.targetScale}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Estándares Aplicados</span>
            <span className="font-semibold text-slate-100">ISO/IEC 25010, C4 Model, ACID</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Estilo Arquitectónico</span>
            <span className="font-semibold text-slate-100">Limpia / Hexagonal Modular</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Motor de Persistencia</span>
            <span className="font-semibold text-slate-100">PostgreSQL 16 + Redis Cluster</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Architectural Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (3 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 sticky top-24 shadow-sm">
          <div className="pb-3 border-b border-slate-200 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Índice del Dossier Arquitectónico
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">11 secciones requeridas por el estándar</p>
          </div>

          <div className="space-y-1">
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-all ${
                  activeSection === sec.id
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      activeSection === sec.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sec.id}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </div>
                {sec.count !== undefined && (
                  <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
                    {sec.count} ítems
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-900 block">Alcance del Sistema</span>
              <p className="text-slate-500 leading-snug">
                Estudiantes, docentes, asignaturas, matrículas, calificaciones y reportes institucionales.
              </p>
            </div>
          </div>
        </div>

        {/* Content Viewport (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm">
          {/* SECTION 1: ACTORES */}
          {activeSection === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600">Sección 01</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">1. Identificación de Actores del Sistema</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Mapeo exhaustivo de actores primarios, secundarios y sistemas satélite que interactúan con el SGA.
                </p>
              </div>

              <div className="space-y-4">
                {SYSTEM_ACTORS.map((actor) => (
                  <div
                    key={actor.id}
                    className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">{actor.id}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <h3 className="text-base font-bold text-slate-900">{actor.name}</h3>
                        </div>
                        <span className="text-xs text-indigo-700 font-medium">{actor.role}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 self-start sm:self-auto">
                        Categoría: {actor.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">{actor.description}</p>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200/80">
                      <div>
                        <span className="font-semibold text-slate-800 block mb-1">Responsabilidades Clave:</span>
                        <ul className="space-y-1 text-slate-600 list-disc list-inside">
                          {actor.responsibilities.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block mb-1">Canales de Acceso:</span>
                        <div className="space-y-1 text-slate-600">
                          {actor.accessChannels.map((c, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: REQUERIMIENTOS FUNCIONALES */}
          {activeSection === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600">Sección 02</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">2. Requerimientos Funcionales (RF)</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Especificación de capacidades operativas del sistema según estándar IEEE 830.
                </p>
              </div>

              <div className="space-y-4">
                {FUNCTIONAL_REQUIREMENTS.map((rf) => (
                  <div key={rf.id} className="p-5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {rf.id}
                          </span>
                          <span className="text-xs text-slate-500">{rf.category}</span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">{rf.title}</h3>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded font-semibold shrink-0 ${
                          rf.priority === 'CRITICA'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        Prioridad {rf.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">{rf.description}</p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 shrink-0">Justificación Técnica:</span>
                      <span>{rf.rationale}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: REQUERIMIENTOS NO FUNCIONALES */}
          {activeSection === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600">Sección 03</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">3. Requerimientos No Funcionales (RNF)</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Estructurados bajo el marco de calidad de software ISO/IEC 25010 (SQuaRE).
                </p>
              </div>

              <div className="space-y-4">
                {NON_FUNCTIONAL_REQUIREMENTS.map((rnf) => (
                  <div key={rnf.id} className="p-5 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {rnf.id}
                          </span>
                          <span className="text-xs text-indigo-700 font-medium">{rnf.isoStandard}</span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 mt-1">{rnf.title}</h3>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                        {rnf.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-3 leading-relaxed">{rnf.description}</p>
                    <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Razón de Diseño: </span>
                      {rnf.rationale}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: RESTRICCIONES */}
          {activeSection === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600">Sección 04</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">4. Restricciones del Sistema</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Límites regulatorios, legales, institucionales y tecnológicos no negociables.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {SYSTEM_CONSTRAINTS.map((c) => (
                  <div key={c.id} className="p-5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-600">{c.id}</span>
                        <span aria-hidden="true">·</span>
                        <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {c.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-3 leading-relaxed">{c.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: CASOS DE USO */}
          {activeSection === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600">Sección 05</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">5. Casos de Uso Principales</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Especificación de los flujos críticos de negocio y transaccionalidad académica.
                </p>
              </div>

              <div className="space-y-6">
                {PRIMARY_USE_CASES.map((cu) => (
                  <div key={cu.id} className="p-5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-xs font-mono font-bold text-indigo-600">{cu.id}</span>
                        <h3 className="text-base font-bold text-slate-900">{cu.title}</h3>
                      </div>
                      <span className="text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded font-medium">
                        Actor: {cu.actor}
                      </span>
                    </div>

                    <div className="mt-4 space-y-4 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 block mb-1">Precondiciones:</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {cu.preconditions.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-semibold text-slate-800 block mb-1">Flujo Principal de Pasos:</span>
                        <ol className="space-y-1 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {cu.mainFlow.map((step, i) => (
                            <li key={i} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div>
                          <span className="font-semibold text-slate-800 block mb-1">Postcondiciones:</span>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                            {cu.postconditions.map((post, i) => (
                              <li key={i}>{post}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block mb-1">Reglas de Negocio:</span>
                          <div className="space-y-1 text-slate-600">
                            {cu.businessRules.map((rule, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{rule}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50/70 rounded border border-amber-200 text-slate-700">
                        <span className="font-semibold text-amber-900 block mb-0.5">Flujo Alternativo / Excepciones:</span>
                        <p>{cu.alternativeFlow}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: ARQUITECTURA RECOMENDADA & C4 */}
          {activeSection === 6 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600">Sección 06</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">6. Arquitectura Recomendada (C4 Model)</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Arquitectura Limpia / Hexagonal Modular con API-First y separación en capas concéntricas.
                </p>
              </div>

              {/* Architecture Paradigm Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                    <Layers className="w-4 h-4" />
                    <span>Estilo Arquitectónico</span>
                  </div>
                  <p className="text-xs text-slate-700">{RECOMMENDED_ARCHITECTURE.style}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                    <Database className="w-4 h-4" />
                    <span>Paradigma de Dominio</span>
                  </div>
                  <p className="text-xs text-slate-700">{RECOMMENDED_ARCHITECTURE.paradigm}</p>
                </div>
              </div>

              {/* Visual Interactive Diagram: C4 Containers / Clean Architecture */}
              <div className="border border-slate-300 rounded-xl p-5 bg-slate-900 text-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Diagrama de Contenedores y Flujo Transaccional
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">C4 Level 2 Container View</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Layer 1: Clients */}
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="font-semibold text-indigo-300 block mb-1">
                      1. Capa de Presentación (Single Page Application - React 19)
                    </span>
                    <p className="text-slate-300">
                      Portal Estudiante, Portal Docente, Consola de Registrador y Dashboard de Decanatura.
                      Comunicación vía HTTPS / TLS 1.3 con API Gateway mediante JWT y Headers Bearer.
                    </p>
                  </div>

                  {/* Flow Arrow */}
                  <div className="text-center text-indigo-400 font-mono text-xs">↓ REST API / GraphQL ↓</div>

                  {/* Layer 2: API Gateway */}
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="font-semibold text-emerald-300 block mb-1">
                      2. API Gateway & Seguridad (Reverse Proxy / Rate Limiter)
                    </span>
                    <p className="text-slate-300">
                      Enrutamiento, validación de tokens OIDC, limitador de tasa (100 req/s por IP), WAF y Circuit Breaker.
                    </p>
                  </div>

                  {/* Flow Arrow */}
                  <div className="text-center text-emerald-400 font-mono text-xs">↓ Invocación de Casos de Uso ↓</div>

                  {/* Layer 3: Modular Monolith Clean Core */}
                  <div className="p-4 bg-indigo-950/60 rounded-lg border border-indigo-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-200">
                        3. Núcleo de Aplicación y Dominio (Hexagonal Clean Architecture)
                      </span>
                      <span className="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded">
                        Lógica Pura sin dependencias
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                        <span className="text-indigo-400 font-bold block">Dominio Puro</span>
                        <span className="text-slate-400">Entidades Estudiante, Asignatura, Matrícula, Calificación</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                        <span className="text-indigo-400 font-bold block">Casos de Uso</span>
                        <span className="text-slate-400">InscribirMateria(), CerrarActa(), CalcularPGA()</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                        <span className="text-indigo-400 font-bold block">Motor de Reglas</span>
                        <span className="text-slate-400">Grafo DAG de pre-requisitos, validación de 20 créditos</span>
                      </div>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="text-center text-slate-500 font-mono text-xs">↓ Puertos y Adaptadores de Salida ↓</div>

                  {/* Layer 4: Persistence */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <span className="font-semibold text-sky-300 block mb-1">
                        4. Base de Datos Relacional (PostgreSQL 16)
                      </span>
                      <p className="text-slate-300">
                        Almacén transaccional ACID, replicación primaria-secundaria, particionamiento de auditoría y bloqueos pesimistas.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <span className="font-semibold text-amber-300 block mb-1">
                        5. Memoria Caché y Cupos (Redis Cluster 7)
                      </span>
                      <p className="text-slate-300">
                        Semáforo atómico de cupos en tiempo real, sesiones activas y caché de oferta académica de alta lectura.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: JUSTIFICACIÓN DE ARQUITECTURA */}
          {activeSection === 7 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600">Sección 07</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">7. Justificación de la Arquitectura (ADRs)</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Registros de Decisiones Arquitectónicas (Architectural Decision Records) y compensaciones (Trade-offs).
                </p>
              </div>

              <div className="space-y-4">
                {ARCHITECTURE_JUSTIFICATION.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="text-xs font-mono font-bold text-indigo-700">ADR-0{idx + 1}</span>
                      <span aria-hidden="true">·</span>
                      <h3 className="text-sm font-bold text-slate-900">{item.aspect}</h3>
                    </div>
                    <p className="text-xs text-slate-700 mt-3 leading-relaxed">{item.argument}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8: COMPONENTES DEL SISTEMA */}
          {activeSection === 8 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600">Sección 08</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">8. Componentes del Sistema</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Desglose modular con alta cohesión y bajo acoplamiento.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SYSTEM_COMPONENTS.map((comp) => (
                  <div key={comp.id} className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-indigo-600">{comp.id}</span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {comp.layer}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{comp.name}</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{comp.description}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                      Tecnologías: {comp.technologies}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 9: ENTIDADES DE BASE DE DATOS & DDL */}
          {activeSection === 9 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-indigo-600">Sección 09</span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">9. Entidades de Base de Datos y Modelo Relacional</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Diccionario de datos completo y script DDL oficial de PostgreSQL 16.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(postgresDDLScript, 'ddl')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors shrink-0"
                >
                  {copiedDDL ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDDL ? 'DDL Copiado' : 'Copiar DDL SQL'}</span>
                </button>
              </div>

              {/* Entity Selector Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                {DATABASE_ENTITIES.map((ent) => (
                  <button
                    key={ent.name}
                    type="button"
                    onClick={() => setSelectedEntity(ent.name)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                      selectedEntity === ent.name
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {ent.name}
                  </button>
                ))}
              </div>

              {/* Entity Detail View */}
              {(() => {
                const ent = DATABASE_ENTITIES.find((e) => e.name === selectedEntity) || DATABASE_ENTITIES[0];
                return (
                  <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{ent.name}</h3>
                          <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            Tabla: {ent.table}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{ent.description}</p>
                      </div>
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold">PK:</span> <code className="font-mono text-indigo-700">{ent.primaryKey}</code>
                      </div>
                    </div>

                    {/* Attributes Table */}
                    <div>
                      <span className="text-xs font-bold text-slate-800 block mb-2">Columnas y Restricciones</span>
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                            <tr>
                              <th className="py-2 px-3">Columna</th>
                              <th className="py-2 px-3">Tipo</th>
                              <th className="py-2 px-3">Nulo</th>
                              <th className="py-2 px-3">Restricción / Check</th>
                              <th className="py-2 px-3">Descripción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                            {ent.attributes.map((attr, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/70">
                                <td className="py-2 px-3 font-bold text-slate-900">{attr.name}</td>
                                <td className="py-2 px-3 text-indigo-700">{attr.type}</td>
                                <td className="py-2 px-3 text-slate-500">{attr.nullable ? 'NULL' : 'NOT NULL'}</td>
                                <td className="py-2 px-3 text-amber-700 truncate max-w-[200px]">
                                  {attr.constraint || '-'}
                                </td>
                                <td className="py-2 px-3 font-sans text-slate-600">{attr.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-xs font-semibold text-slate-700">Relaciones de Integridad Referencial:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {ent.relationships.map((rel, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 font-mono"
                          >
                            {rel}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* PostgreSQL DDL Code Box */}
              <div className="border border-slate-800 rounded-lg bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-72">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 text-slate-400">
                  <span>schema.sql (PostgreSQL 16 DDL Extract)</span>
                  <span className="text-[10px] text-emerald-400">Sintaxis Validada</span>
                </div>
                <pre className="text-[11px] leading-relaxed text-slate-300">{postgresDDLScript}</pre>
              </div>
            </div>
          )}

          {/* SECTION 10: RIESGOS ARQUITECTÓNICOS */}
          {activeSection === 10 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600">Sección 10</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">10. Riesgos Arquitectónicos y Mitigaciones</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Matriz de riesgos de concurrencia, integridad, seguridad y planes de contingencia (ISO 31000).
                </p>
              </div>

              <div className="space-y-4">
                {ARCHITECTURAL_RISKS.map((rsk) => (
                  <div key={rsk.id} className="p-5 rounded-lg border border-slate-200 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {rsk.id}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{rsk.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-600">
                          Impacto: <strong className="text-rose-700">{rsk.impact}</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-600">
                          Probabilidad: <strong className="text-amber-700">{rsk.probability}</strong>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 mt-3 leading-relaxed">{rsk.description}</p>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100">
                      <div className="p-3 bg-emerald-50/60 rounded border border-emerald-200">
                        <span className="font-semibold text-emerald-900 block mb-1">
                          Estrategia de Mitigación Arquitectónica:
                        </span>
                        <p className="text-slate-700">{rsk.mitigationStrategy}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                        <span className="font-semibold text-slate-900 block mb-1">Plan de Contingencia:</span>
                        <p className="text-slate-700">{rsk.contingencyPlan}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 11: ATRIBUTOS DE CALIDAD */}
          {activeSection === 11 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600">Sección 11</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">11. Atributos de Calidad (ISO/IEC 25010)</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Escenarios concretos de calidad, métricas de aceptación y tácticas arquitectónicas.
                </p>
              </div>

              <div className="space-y-4">
                {QUALITY_ATTRIBUTES.map((qa, idx) => (
                  <div key={idx} className="p-5 rounded-lg border border-slate-200 bg-white">
                    <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                      {qa.attribute}
                    </h3>
                    <div className="mt-3 space-y-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 block mb-0.5">Escenario Operativo:</span>
                        <p className="text-slate-700 leading-relaxed">{qa.scenario}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-slate-900 block">Métrica Medible:</span>
                          <span className="font-mono text-indigo-700">{qa.metric}</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block mb-0.5">Táctica Arquitectónica Aplicada:</span>
                        <p className="text-slate-600">{qa.tactic}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

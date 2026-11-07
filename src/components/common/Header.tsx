import React from 'react';
import { ShieldCheck, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  systemMode: 'architecture' | 'app';
  onToggleMode: (mode: 'architecture' | 'app') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  systemMode,
  onToggleMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              SGA
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Sistema de Gestión Académica
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                Universidad Isaías Gael · Arquitectura & Plataforma
              </span>
            </div>
          </div>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => {
                onToggleMode('architecture');
                onSelectTab('overview');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                systemMode === 'architecture'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Dossier de Arquitectura
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleMode('architecture');
                onSelectTab('c4-diagrams');
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-slate-600"
            >
              Diagramas C4 & MER
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleMode('architecture');
                onSelectTab('risks-quality');
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-slate-600"
            >
              Riesgos & Calidad
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleMode('app');
                onSelectTab('students');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                systemMode === 'app'
                  ? 'border-indigo-600 text-indigo-700 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Módulos Operativos SGA
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {systemMode === 'architecture' ? (
              <button
                type="button"
                onClick={() => onToggleMode('app')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Abrir SGA Operativo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleMode('architecture')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ver Dossier Arquitecto</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

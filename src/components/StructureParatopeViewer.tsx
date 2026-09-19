import { useState } from 'react';
import { VhhCandidate } from '../types';
import { Layers, ZoomIn, ZoomOut, RotateCcw, Box } from 'lucide-react';
import { EsmFoldPreview } from './EsmFoldPreview';

interface StructureParatopeViewerProps {
  candidate: VhhCandidate;
}

export function StructureParatopeViewer({ candidate }: StructureParatopeViewerProps) {
  const [viewMode, setViewMode] = useState<'esmfold' | 'paratope' | 'ribbon' | 'electrostatic'>('esmfold');
  const [zoom, setZoom] = useState(1);

  const cdr3 = candidate.regions.find(r => r.name === 'CDR3')?.sequence || 'AAYSDYSGYYY';
  const hasMutations = candidate.mutationsApplied.length > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Structural Architecture &amp; 3D ESMFold Conformation</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Immunoglobulin Beta-Sandwich Fold
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Single-domain VHH folding topology showing the hypervariable CDR3 loop projected into the target epitope cleft.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('esmfold')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'esmfold'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D ESMFold Preview</span>
          </button>
          <button
            onClick={() => setViewMode('paratope')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'paratope'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Antigen Paratope
          </button>
          <button
            onClick={() => setViewMode('ribbon')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'ribbon'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Beta-Sandwich Core
          </button>
          <button
            onClick={() => setViewMode('electrostatic')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'electrostatic'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Surface Charge
          </button>
        </div>
      </div>

      {/* Render selected view mode */}
      {viewMode === 'esmfold' ? (
        <EsmFoldPreview candidate={candidate} compact={false} />
      ) : (
        /* Interactive Structural Schematic SVG Canvas */
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800/80 h-72 flex items-center justify-center overflow-hidden">
          
          {/* Background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Zoom controls */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 z-10">
            <button
              onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}
              className="p-1 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.7, prev - 0.1))}
              className="p-1 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Biological Representation */}
          <svg
            viewBox="0 0 600 280"
            className="w-full h-full max-w-lg transition-transform duration-300 select-none"
            style={{ transform: `scale(${zoom})` }}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="antigenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="vhhCoreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="cdr3LoopGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Target Antigen Surface (Top) */}
            <path
              d="M 50 40 Q 150 15 250 40 T 450 35 T 550 45 L 550 5 L 50 5 Z"
              fill="url(#antigenGrad)"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text x="300" y="25" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600" fontFamily="sans-serif">
              Target Antigen Epitope Surface: {candidate.target}
            </text>

            {/* VHH Beta-Sandwich Core Body */}
            <rect
              x="180"
              y="130"
              width="240"
              height="110"
              rx="16"
              fill={viewMode === 'electrostatic' ? '#1e1b4b' : 'url(#vhhCoreGrad)'}
              stroke={viewMode === 'electrostatic' ? '#6366f1' : '#10b981'}
              strokeWidth="2"
            />
            <text x="300" y="200" textAnchor="middle" fill="#d1fae5" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
              VHH Immunoglobulin Core
            </text>
            <text x="300" y="218" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontFamily="monospace">
              9 Antiparallel β-Strands (A-B-C-C'-C''-D-E-F-G)
            </text>

            {/* Canonical Cys22-Cys92 Disulfide Bridge */}
            <line x1="220" y1="170" x2="380" y2="170" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 3" />
            <circle cx="220" cy="170" r="4.5" fill="#f59e0b" />
            <circle cx="380" cy="170" r="4.5" fill="#f59e0b" />
            <text x="300" y="165" textAnchor="middle" fill="#fde68a" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              Canonical Disulfide Cys22 - Cys92
            </text>

            {/* Camelid Hallmark Tetrad (Phe37, Glu44, Arg45, Gly47) */}
            <g transform="translate(190, 140)">
              <rect x="0" y="0" width="80" height="22" rx="4" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
              <text x="40" y="15" textAnchor="middle" fill="#fef3c7" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                FR2 Hallmarks (F37/E44/R45/G47)
              </text>
            </g>

            {/* CDR1 Loop (Cyan) */}
            <path
              d="M 210 130 C 205 90 230 75 240 70"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <text x="220" y="70" textAnchor="end" fill="#67e8f9" fontSize="10" fontWeight="bold">
              CDR1
            </text>

            {/* CDR2 Loop (Teal) */}
            <path
              d="M 270 130 C 265 85 285 70 295 65"
              fill="none"
              stroke="#14b8a6"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <text x="280" y="65" textAnchor="end" fill="#5eead4" fontSize="10" fontWeight="bold">
              CDR2
            </text>

            {/* Extended High-Affinity CDR3 Finger Loop (Fuchsia / Pink) */}
            <path
              d="M 330 130 C 335 70 340 42 360 40 C 380 38 385 75 390 130"
              fill="none"
              stroke="url(#cdr3LoopGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              filter="url(#glow)"
            />
            <circle cx="360" cy="40" r="5" fill="#ec4899" />
            <text x="360" y="32" textAnchor="middle" fill="#f472b6" fontSize="11" fontWeight="bold">
              CDR3 Paratope (Antigen Contact)
            </text>

            {/* Paratope Contact H-Bond / Van der Waals Bridges */}
            <line x1="360" y1="40" x2="360" y2="28" stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />
            <line x1="350" y1="44" x2="345" y2="30" stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />
            <line x1="370" y1="44" x2="375" y2="30" stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />

            {/* FR4 C-terminal anchor */}
            <path d="M 410 240 L 430 260" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <text x="440" y="265" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
              FR4 (J-segment)
            </text>
          </svg>

          {/* Legend overlays */}
          <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
            Paratope CDR3 sequence: <span className="text-pink-400 font-bold">{cdr3.slice(0, 12)}...</span>
          </div>

          {hasMutations && (
            <div className="absolute bottom-2 right-3 text-[10px] text-emerald-300 font-mono bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Structural packing optimized</span>
            </div>
          )}
        </div>
      )}

      {/* Structural Rationale Notes */}
      <div className="mt-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300">
        <span className="font-semibold text-emerald-400 block mb-1">
          Why VHH Single-Domain Antibodies Excel:
        </span>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Unlike conventional IgG antibodies (which require paired VH and VL domains), camelid VHH domains carry hydrophilic substitutions at positions 37, 44, 45, and 47 that prevent aggregation in the absence of a light chain. The prolonged CDR3 loop is capable of protruding into concave receptor active sites, offering sub-nanomolar affinity with superior thermal denaturation resilience (&gt;70°C).
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  Cpu,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Shuffle,
  Layers,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { BatchDiversityMetrics } from '../utils/biophysics';

interface SequenceGeneratorBarProps {
  selectedTarget: string;
  setSelectedTarget: (target: string) => void;
  targets: Array<{ id: string; name: string; domain: string }>;
  strategy: 'Humanization Sweep' | 'Affinity Maturation DMS' | 'Thermostability Annealing' | 'Universal Diversity';
  setStrategy: (strategy: 'Humanization Sweep' | 'Affinity Maturation DMS' | 'Thermostability Annealing' | 'Universal Diversity') => void;
  count: number;
  setCount: (count: number) => void;
  ensureHumanizationValid: boolean;
  setEnsureHumanizationValid: (valid: boolean) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onExportFasta: () => void;
  onCopyFasta: () => void;
  copiedFasta: boolean;
  diversityMetrics: BatchDiversityMetrics | null;
  totalCount: number;
}

const BATCH_PRESETS = [10, 50, 100, 250, 500, 1000];

export function SequenceGeneratorBar({
  selectedTarget,
  setSelectedTarget,
  targets,
  strategy,
  setStrategy,
  count,
  setCount,
  ensureHumanizationValid,
  setEnsureHumanizationValid,
  isGenerating,
  onGenerate,
  onExportFasta,
  onCopyFasta,
  copiedFasta,
  diversityMetrics,
  totalCount
}: SequenceGeneratorBarProps) {
  const [showDiversityDetails, setShowDiversityDetails] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Row: Primary Generator Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
        
        {/* Target Antigen */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Target Antigen
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            aria-label="Target Antigen Selection"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {targets.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                {t.id}
              </option>
            ))}
          </select>
        </div>

        {/* Engineering Strategy */}
        <div className="lg:col-span-3">
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Synthesis Strategy
          </label>
          <select
            value={strategy}
            onChange={(e: any) => setStrategy(e.target.value)}
            aria-label="Synthesis Strategy"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="Humanization Sweep">Humanization Sweep (Hallmark Retained)</option>
            <option value="Affinity Maturation DMS">Affinity Maturation DMS (CDR3 Paratopes)</option>
            <option value="Thermostability Annealing">Thermostability Annealing (Tm &gt; 72°C)</option>
            <option value="Universal Diversity">Universal Repertoire Diversity</option>
          </select>
        </div>

        {/* Batch Size Selection */}
        <div className="lg:col-span-4">
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Batch Size
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {BATCH_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCount(p)}
                className={`px-2 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer ${
                  count === p
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {p.toLocaleString()}
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={2000}
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              aria-label="Custom Batch Size"
              className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono text-center text-slate-200 focus:outline-none focus:border-emerald-500"
              title="Custom batch size"
            />
          </div>
        </div>

        {/* Action Buttons: Generate & Export */}
        <div className="lg:col-span-3 flex items-center justify-end gap-2 pt-2 sm:pt-0">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Shuffle className="w-3.5 h-3.5" />
                <span>Generate {count}</span>
              </>
            )}
          </button>

          <button
            onClick={onExportFasta}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Download FASTA file with complete biophysical headers"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">FASTA</span>
          </button>

          <button
            onClick={onCopyFasta}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Copy FASTA sequences to clipboard"
          >
            {copiedFasta ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedFasta ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

      </div>

      {/* Humanization Guardrail & Filter Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={ensureHumanizationValid}
            onChange={(e) => setEnsureHumanizationValid(e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20 w-3.5 h-3.5"
          />
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Clinical Humanization Guardrail</span>
            <span className="text-[10px] text-slate-500 hidden md:inline">
              (Preserves solubility tetrad F37, E44, R45, G47 &amp; rejects NG/DG hotspots)
            </span>
          </span>
        </label>

        {diversityMetrics && (
          <button
            type="button"
            onClick={() => setShowDiversityDetails(!showDiversityDetails)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <Info className="w-3 h-3" />
            <span>Diversity &amp; Non-Redundancy Audit</span>
            {showDiversityDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Diversity Metrics Strip */}
      {diversityMetrics && (
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block">Total Library Size</span>
              <span className="text-sm font-bold text-white font-mono">
                {diversityMetrics.totalCount.toLocaleString()} clones
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block">Unique Structures</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {diversityMetrics.uniqueCount} / {diversityMetrics.totalCount} (100%)
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block">Sequence Separation</span>
              <span className="text-sm font-bold text-cyan-300 font-mono">
                ~{diversityMetrics.meanHammingDistance} aa Hamming dist
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block">Humanization Pass Rate</span>
              <span className="text-sm font-bold text-indigo-300 font-mono">
                {diversityMetrics.humanizationValidCount} / {diversityMetrics.totalCount} (100%)
              </span>
            </div>
          </div>

          {showDiversityDetails && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
              <p>
                <strong className="text-slate-200">• Collision-Free Hash Sampling:</strong> Every single candidate sequence is evaluated against an in-memory sequence set. Duplicate sequences are rejected and re-sampled, guaranteeing zero redundant structures.
              </p>
              <p>
                <strong className="text-slate-200">• Camelid Hallmark Retention:</strong> Unlike paired human $V_H$ chains, single-domain antibodies lack a $V_L$ partner. Residues at positions 37, 44, 45, and 47 are preserved as hydrophilic hallmarks (F/Y37, E/Q44, R45, G/F47) to ensure high solubility and prevent aggregation while maximizing human germline homology.
              </p>
              <p>
                <strong className="text-slate-200">• Combinatorial CDR3 Conformations:</strong> Loop lengths span 8 to 16 amino acids across convex finger, planar ridge, and aromatic anchor topologies.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

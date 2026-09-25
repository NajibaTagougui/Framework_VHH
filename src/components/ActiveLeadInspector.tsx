import { useState } from 'react';
import { VhhCandidate } from '../types';
import { EsmFoldPreview } from './EsmFoldPreview';
import {
  Layers,
  Dna,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  Flame,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { exportToFasta } from '../utils/biophysics';

interface ActiveLeadInspectorProps {
  candidate: VhhCandidate;
  onAutoStabilize: () => void;
  isOptimizing: boolean;
  onOpenAiDrawer: () => void;
}

export function ActiveLeadInspector({
  candidate,
  onAutoStabilize,
  isOptimizing,
  onOpenAiDrawer
}: ActiveLeadInspectorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySequence = () => {
    navigator.clipboard.writeText(candidate.sequence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFasta = () => {
    exportToFasta([candidate], `${candidate.id}.fasta`);
  };

  const cdr3 = candidate.regions.find(r => r.name === 'CDR3')?.sequence || '';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              {candidate.id}
            </span>
            <h2 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
              {candidate.name}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Target: <strong className="text-slate-200">{candidate.target}</strong> • Length: {candidate.sequence.length} aa • Origin: {candidate.libraryOrigin}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopySequence}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Copy full amino acid sequence"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadFasta}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Download FASTA file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>FASTA</span>
          </button>

          <button
            type="button"
            onClick={onAutoStabilize}
            disabled={isOptimizing}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium px-2.5 py-1 rounded-md text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
            title="Apply in silico core stabilization & liability remediation"
          >
            <Zap className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizing...' : 'Auto-Stabilize'}</span>
          </button>
        </div>
      </div>

      {/* 3D ESMFold Viewer */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>3D ESMFold Structure Prediction</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            ESMFold v1 Backbone
          </span>
        </div>
        <div className="rounded-lg overflow-hidden border border-slate-800">
          <EsmFoldPreview candidate={candidate} compact={true} />
        </div>
      </div>

      {/* Biophysical Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Affinity (Kd)</span>
          <span className="text-xs font-bold text-cyan-300">
            {candidate.metrics.predictedKdNm.toFixed(2)} nM
          </span>
        </div>

        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Melting Temp (Tm)</span>
          <span className="text-xs font-bold text-amber-300">
            {candidate.metrics.meltingTempTm.toFixed(1)} °C
          </span>
        </div>

        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Humanization</span>
          <span className="text-xs font-bold text-emerald-400">
            {candidate.metrics.humanizationScore.toFixed(1)}%
          </span>
        </div>

        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Periplasmic Yield</span>
          <span className="text-xs font-bold text-indigo-300">
            {candidate.metrics.expressionYieldMgL} mg/L
          </span>
        </div>
      </div>

      {/* IMGT Sequence Region Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
            <Dna className="w-3.5 h-3.5 text-cyan-400" />
            <span>IMGT Regions &amp; Paratope Partition</span>
          </span>
          <span className="text-[10px] text-slate-400">
            CDR3: <strong className="text-emerald-400 font-mono">{cdr3}</strong> ({cdr3.length} aa)
          </span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          {candidate.regions.map((region) => {
            const isCdr = region.name.startsWith('CDR');
            const isFr2 = region.name === 'FR2';

            return (
              <div
                key={region.name}
                className="flex items-start gap-2 bg-slate-950/70 p-1.5 rounded border border-slate-800/80"
              >
                <div className="w-14 shrink-0 flex items-center gap-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      region.name === 'CDR3'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isCdr
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {region.name}
                  </span>
                </div>

                <div className="flex-1 break-all text-slate-300 tracking-wider">
                  {region.sequence}
                </div>

                {isFr2 && (
                  <span className="text-[9px] text-emerald-400 font-sans font-medium px-1 bg-emerald-950/60 rounded shrink-0" title="Camelid hallmark solubility residues F37, E44, R45, G47">
                    Hallmarks Intact
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Liabilities notification if any */}
      {candidate.liabilities.length > 0 ? (
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5 flex items-start gap-2 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block">
              {candidate.liabilities.length} Chemical Liability Site(s) Detected
            </span>
            <span className="text-[11px] text-amber-300/80 block">
              {candidate.liabilities.map(l => `${l.type} at ${l.position} (${l.motif})`).join(', ')}. Use &ldquo;Auto-Stabilize&rdquo; to cure.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-2 flex items-center gap-2 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Zero chemical liabilities detected. Clinical developability score is optimal.</span>
        </div>
      )}
    </div>
  );
}

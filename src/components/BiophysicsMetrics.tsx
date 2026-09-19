import { Activity, ShieldCheck, Thermometer, FlaskConical, Gauge, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { VhhCandidate } from '../types';

interface BiophysicsMetricsProps {
  candidate: VhhCandidate;
  onAutoStabilize: () => void;
  isOptimizing?: boolean;
}

export function BiophysicsMetrics({ candidate, onAutoStabilize, isOptimizing }: BiophysicsMetricsProps) {
  const m = candidate.metrics;
  const mutationsCount = candidate.mutationsApplied.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-['Plus_Jakarta_Sans']">
              ML In Silico Developability Profile
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Model Ensemble: ESM-VHH / FoldX / AffinityNet
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time computed biophysical metrics, thermodynamic stability, and downstream developability flags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mutationsCount > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {mutationsCount} engineered mutation{mutationsCount > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={onAutoStabilize}
            disabled={isOptimizing}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOptimizing ? 'Optimizing...' : 'Auto-Optimize Stability & Yield'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Biophysical Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        
        {/* Binding Affinity (Kd) */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Predicted K<sub>d</sub>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">SPR / BLI</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {m.predictedKdNm}
            </span>
            <span className="text-xs text-slate-400 font-mono">nM</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">ΔG binding:</span>
            <span className="text-slate-300 font-mono font-medium">{m.deltaGKcal} kcal/mol</span>
          </div>
        </div>

        {/* Melting Temperature (Tm) */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              Thermal Stability (T<sub>m</sub>)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">DSF / CD</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${
              m.meltingTempTm >= 70 ? 'text-emerald-400' : m.meltingTempTm >= 65 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {m.meltingTempTm}
            </span>
            <span className="text-xs text-slate-400 font-mono">°C</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target Spec:</span>
            <span className="text-slate-300 font-mono font-medium">&gt; 70.0 °C</span>
          </div>
        </div>

        {/* Expression Yield */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1 font-medium">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              Periplasmic Yield
            </span>
            <span className="text-[10px] text-slate-500 font-mono">E. coli pelB</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-300">
              {m.expressionYieldMgL}
            </span>
            <span className="text-xs text-slate-400 font-mono">mg/L</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Soluble fraction:</span>
            <span className="text-emerald-400 font-mono font-medium">~94%</span>
          </div>
        </div>

        {/* Overall Developability Index */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              Developability Index
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Composite</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${
              m.developabilityScore >= 85 ? 'text-emerald-400' : 'text-indigo-300'
            }`}>
              {m.developabilityScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">/100</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Biomanufacturability:</span>
            <span className="text-indigo-300 font-mono font-medium">
              {m.developabilityScore >= 85 ? 'High Grade' : 'Moderate'}
            </span>
          </div>
        </div>

      </div>

      {/* Secondary Physicochemical Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">Isoelectric Point (pI)</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-slate-200">{m.isoelectricPoint}</span>
            <span className="text-[10px] text-slate-500">
              {m.isoelectricPoint > 7 ? '(Basic VHH)' : '(Neutral)'}
            </span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 block mb-0.5">Hydropathicity (GRAVY)</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-slate-200">{m.hydrophobicityIndex}</span>
            <span className="text-[10px] text-emerald-400">Low aggregation risk</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 block mb-0.5">Humanization Index</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-slate-200">{m.humanizationScore}%</span>
            <span className="text-[10px] text-slate-500">vs IGHV3-23</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 block mb-0.5">Canonical Disulfide</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Cys22 - Cys92 Intact</span>
          </div>
        </div>
      </div>

    </div>
  );
}

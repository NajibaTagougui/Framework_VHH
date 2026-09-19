import { VhhCandidate } from '../types';
import { ShieldAlert, ShieldCheck, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';

interface LiabilitiesPanelProps {
  candidate: VhhCandidate;
  onFixLiability: (pos1Based: number, newAA: string, rationale: string) => void;
}

export function LiabilitiesPanel({ candidate, onFixLiability }: LiabilitiesPanelProps) {
  const liabilities = candidate.liabilities;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              {liabilities.length > 0 ? (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <span>Developability &amp; Bioprocess Liabilities</span>
            </h2>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
              liabilities.length === 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {liabilities.length === 0 ? '0 Liabilities Found (Clean)' : `${liabilities.length} Flagged Motifs`}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated screening for chemical degradation hotspots, deamidation, aspartate isomerization, and aberrant PTMs.
          </p>
        </div>
      </div>

      {liabilities.length === 0 ? (
        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-emerald-300">Clean Biomanufacturing Profile</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            No high-risk chemical liabilities detected. Repertoire clone exhibits stable formulation potential with minimal aggregation or degradation propensity.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {liabilities.map((l, index) => {
            const pos = l.position;
            const currentAA = candidate.sequence[pos - 1];
            let fixAA = 'Q';
            let rationale = `Engineering ${currentAA}${pos}Q to eliminate ${l.type} motif (${l.motif})`;

            if (l.type === 'Deamidation') {
              fixAA = 'Q';
              rationale = `Asn to Gln substitution at pos ${pos} eliminates labile deamidation motif (${l.motif})`;
            } else if (l.type === 'Isomerization') {
              fixAA = 'E';
              rationale = `Asp to Glu substitution at pos ${pos} prevents succinimide isomerization ring closure`;
            } else if (l.type === 'Glycosylation') {
              fixAA = 'Q';
              rationale = `Asn to Gln mutation at pos ${pos} disables unwanted N-glycosylation sequon`;
            } else if (l.type === 'Unpaired Cys') {
              fixAA = 'S';
              rationale = `Cys to Ser mutation at pos ${pos} removes unpaired thiol to prevent mispaired disulfide multimers`;
            }

            return (
              <div
                key={index}
                className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-200">
                        {l.type} Risk: <span className="font-mono text-amber-300">{l.motif}</span> at Position {l.position}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                        l.severity === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {l.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {l.recommendation}
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => onFixLiability(pos, fixAA, rationale)}
                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Auto-Fix ({currentAA}{pos}{fixAA})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

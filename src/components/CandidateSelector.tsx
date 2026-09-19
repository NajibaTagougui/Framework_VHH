import { useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { VhhCandidate } from '../types';
import { exportToFasta } from '../utils/biophysics';
import { Filter, Search, Plus, Sparkles, Check, ArrowRight, ShieldCheck, Flame, Layers, Download, Cpu } from 'lucide-react';

interface CandidateSelectorProps {
  candidates: VhhCandidate[];
  selectedCandidateId: string;
  onSelectCandidate: (candidate: VhhCandidate) => void;
  onImportSequence: (seq: string, name: string, target: string) => void;
  currentTarget: string;
  onOpenBatchGenerator?: () => void;
}

export function CandidateSelector({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onImportSequence,
  currentTarget,
  onOpenBatchGenerator
}: CandidateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roundFilter, setRoundFilter] = useState<number | 'all'>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSeq, setImportSeq] = useState('');
  const [importName, setImportName] = useState('');

  // Filter candidates
  const filtered = candidates.filter(c => {
    if (currentTarget && c.target !== currentTarget) return false;
    if (roundFilter !== 'all' && c.panningRound !== roundFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.libraryOrigin.toLowerCase().includes(q) ||
        c.sequence.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Scatter plot data for Pareto analysis
  const scatterData = filtered.map(c => ({
    id: c.id,
    name: c.name,
    kd: c.metrics.predictedKdNm,
    tm: c.metrics.meltingTempTm,
    expression: c.metrics.expressionYieldMgL,
    developability: c.metrics.developabilityScore,
    isSelected: c.id === selectedCandidateId,
    candidateObj: c
  }));

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importSeq.trim()) return;
    onImportSequence(importSeq.trim(), importName || 'Custom-Clone-01', currentTarget);
    setImportSeq('');
    setImportName('');
    setShowImportModal(false);
  };

  return (
    <div className="space-y-5">
      
      {/* Search & Filter Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by clone ID, camelid species, or motif..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Panning:
            </span>
            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Rounds</option>
              <option value="1">Round 1 (Initial Repertoire)</option>
              <option value="2">Round 2 (Enriched)</option>
              <option value="3">Round 3 (High Purity/Affinity)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBatchGenerator && (
            <button
              onClick={onOpenBatchGenerator}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Batch generate new VHH variant candidates"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Batch Generate Variants</span>
            </button>
          )}

          <button
            onClick={() => {
              const filename = `NanoVHH_${currentTarget || 'Library'}_${filtered.length}_Candidates.fasta`;
              exportToFasta(filtered, filename);
            }}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download all filtered candidates in multi-FASTA format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ({filtered.length}) FASTA</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import FASTA</span>
          </button>
        </div>
      </div>

      {/* Multi-Objective Pareto Analysis Plot (Affinity vs Stability) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Multi-Objective Pareto Analysis (Affinity vs. Thermal Stability)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any bubble to inspect candidate clone. Top-left quadrant represents ideal drug-like candidates (Lowest K<sub>d</sub> + Highest T<sub>m</sub>).
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            Bubble size = Expression Yield (mg/L)
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 30, bottom: 15, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                type="number"
                dataKey="kd"
                name="Kd"
                unit=" nM"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto']}
                label={{ value: 'Dissociation Constant Kd (nM) — Lower is Tighter', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="tm"
                name="Tm"
                unit=" °C"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                domain={[60, 85]}
                label={{ value: 'Melting Temp Tm (°C)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
              />
              <ZAxis
                type="number"
                dataKey="expression"
                range={[80, 400]}
                name="Expression Yield"
                unit=" mg/L"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val: any, name: any) => {
                  if (name === 'Kd') return [`${val} nM`, 'Predicted Kd'];
                  if (name === 'Tm') return [`${val} °C`, 'Melting Temp'];
                  if (name === 'Expression Yield') return [`${val} mg/L`, 'Periplasmic Yield'];
                  return [val, String(name || '')];
                }}
              />
              <Scatter
                name="VHH Clones"
                data={scatterData}
                onClick={(e: any) => {
                  if (e && e.candidateObj) {
                    onSelectCandidate(e.candidateObj);
                  }
                }}
                className="cursor-pointer"
              >
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.id}-${index}`}
                    fill={entry.isSelected ? '#10b981' : '#6366f1'}
                    stroke={entry.isSelected ? '#ffffff' : '#818cf8'}
                    strokeWidth={entry.isSelected ? 3 : 1.5}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Candidate Clones Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, idx) => {
          const isSelected = c.id === selectedCandidateId;
          const cdr3 = c.regions.find(r => r.name === 'CDR3')?.sequence || '';

          return (
            <div
              key={`${c.id}-${idx}`}
              onClick={() => onSelectCandidate(c)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-slate-900/90 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                      {c.name}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                        Active Lead
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {c.libraryOrigin} • Round {c.panningRound}
                  </span>
                </div>

                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  c.metrics.developabilityScore >= 85
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  Score: {c.metrics.developabilityScore}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">K<sub>d</sub> Affinity</span>
                  <span className="font-mono font-bold text-cyan-300">{c.metrics.predictedKdNm} nM</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Stability T<sub>m</sub></span>
                  <span className="font-mono font-bold text-rose-300">{c.metrics.meltingTempTm}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Expression</span>
                  <span className="font-mono font-bold text-emerald-300">{c.metrics.expressionYieldMgL} mg/L</span>
                </div>
              </div>

              {/* CDR3 Sequence Snippet */}
              <div className="text-[11px] font-mono text-slate-400 truncate mb-3">
                <span className="text-slate-500 mr-1">CDR3:</span>
                <span className="text-pink-300 font-semibold">{cdr3}</span>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-500">
                  NGS Reads: {c.ngsReadCount.toLocaleString()}
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Load Studio</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Import VHH Sequence / Repertoire Clone
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter an amino acid sequence (single-letter code) from panning NGS or synthetic library.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Clone Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Llama-Imm-R3-Clone42"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Amino Acid Sequence
                </label>
                <textarea
                  rows={4}
                  placeholder="EVQLVESGGGLVQPGGSLRLSCAASGFTF..."
                  value={importSeq}
                  onChange={(e) => setImportSeq(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 uppercase"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                >
                  Ingest &amp; Calculate Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

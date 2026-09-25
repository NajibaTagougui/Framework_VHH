import { useState, useMemo } from 'react';
import { VhhCandidate } from '../types';
import { Search, Copy, Check, Download, Flame, ShieldCheck, Sparkles, Filter, Grid } from 'lucide-react';
import { generateFastaText, exportToFasta } from '../utils/biophysics';

interface SequenceTableProps {
  candidates: VhhCandidate[];
  selectedCandidateId: string;
  onSelectCandidate: (candidate: VhhCandidate) => void;
  selectedTarget: string;
  onOpenHeatmap?: () => void;
}

export function SequenceTable({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  selectedTarget,
  onOpenHeatmap
}: SequenceTableProps) {
  const [search, setSearch] = useState('');
  const [displayLimit, setDisplayLimit] = useState<number>(50);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter candidates based on target and search
  const filtered = useMemo(() => {
    let list = candidates;
    if (selectedTarget) {
      list = list.filter(c => c.target === selectedTarget);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c => 
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.sequence.toLowerCase().includes(q) ||
        (c.regions.find(r => r.name === 'CDR3')?.sequence.toLowerCase().includes(q))
      );
    }
    return list;
  }, [candidates, selectedTarget, search]);

  const displayedCandidates = useMemo(() => {
    if (displayLimit === -1) return filtered;
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  const handleCopySeq = (e: React.MouseEvent, c: VhhCandidate) => {
    e.stopPropagation();
    navigator.clipboard.writeText(c.sequence);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportSingleFasta = (e: React.MouseEvent, c: VhhCandidate) => {
    e.stopPropagation();
    exportToFasta([c], `${c.id}.fasta`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5 flex flex-col h-full">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <span>Generated Sequence Library</span>
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {filtered.length.toLocaleString()} {filtered.length === 1 ? 'clone' : 'clones'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHeatmap && (
            <button
              onClick={onOpenHeatmap}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
              title="Open Sequence Identity Heatmap"
            >
              <Grid className="w-3.5 h-3.5 text-cyan-400" />
              <span>Identity Heatmap</span>
            </button>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search motif, CDR3, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
            />
          </div>

          {/* View Limit */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className="hidden sm:inline">Show:</span>
            <select
              value={displayLimit}
              onChange={(e) => setDisplayLimit(parseInt(e.target.value))}
              aria-label="Display Limit"
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-mono"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={-1}>All ({filtered.length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[580px] rounded-lg border border-slate-800/80">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="p-2.5 w-10 text-center">#</th>
              <th className="p-2.5">Clone ID / Name</th>
              <th className="p-2.5">Sequence (IMGT Trace)</th>
              <th className="p-2.5 text-right">Kd (nM)</th>
              <th className="p-2.5 text-right">Tm (°C)</th>
              <th className="p-2.5 text-right">Hum %</th>
              <th className="p-2.5 text-right">Yield</th>
              <th className="p-2.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {displayedCandidates.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                  No sequences found matching query. Click &ldquo;Generate Sequences&rdquo; above to synthesize a library.
                </td>
              </tr>
            ) : (
              displayedCandidates.map((c, idx) => {
                const isSelected = c.id === selectedCandidateId;
                const cdr3 = c.regions.find(r => r.name === 'CDR3')?.sequence || '';

                return (
                  <tr
                    key={`${c.id}-${idx}`}
                    onClick={() => onSelectCandidate(c)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/40 text-white font-medium border-l-2 border-l-emerald-400'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="p-2.5 text-center text-slate-500 font-sans text-xs">
                      {idx + 1}
                    </td>

                    <td className="p-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {c.id}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded font-sans">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block truncate max-w-[140px]">
                        {c.name}
                      </span>
                    </td>

                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 truncate max-w-[180px] sm:max-w-[260px] tracking-tight">
                          {c.sequence.slice(0, 18)}...<span className="text-emerald-300 font-bold">{cdr3}</span>...{c.sequence.slice(-11)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopySeq(e, c)}
                          className="text-slate-400 hover:text-white transition-colors p-1"
                          title="Copy amino acid sequence"
                        >
                          {copiedId === c.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="p-2.5 text-right text-cyan-300 font-medium">
                      {c.metrics.predictedKdNm.toFixed(2)}
                    </td>

                    <td className="p-2.5 text-right text-amber-300 font-medium">
                      {c.metrics.meltingTempTm.toFixed(1)}
                    </td>

                    <td className="p-2.5 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        c.metrics.humanizationScore >= 85
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-yellow-400 bg-yellow-500/10'
                      }`}>
                        {c.metrics.humanizationScore.toFixed(1)}%
                      </span>
                    </td>

                    <td className="p-2.5 text-right text-slate-300">
                      {c.metrics.expressionYieldMgL}
                    </td>

                    <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleExportSingleFasta(e, c)}
                        className="text-slate-400 hover:text-emerald-300 transition-colors p-1"
                        title="Download FASTA for this clone"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>
          Showing {displayedCandidates.length} of {filtered.length} matching sequences
        </span>
        <span className="font-mono text-[10px]">
          Click any row to inspect 3D ESMFold structure and IMGT paratope
        </span>
      </div>
    </div>
  );
}

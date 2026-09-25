import { useState, useMemo } from 'react';
import { VhhCandidate } from '../types';
import {
  compareActiveWithCandidate,
  alignSequencesNeedlemanWunsch,
  PairwiseComparisonResult
} from '../utils/biophysics';
import {
  Grid,
  Layers,
  ArrowUpDown,
  Filter,
  Check,
  Search,
  Download,
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Sliders,
  Maximize2,
  Minimize2,
  Table,
  Eye,
  Dna
} from 'lucide-react';

interface SequenceIdentityHeatmapProps {
  activeCandidate: VhhCandidate;
  candidates: VhhCandidate[];
  onSelectCandidate: (candidateId: string) => void;
  compact?: boolean;
}

type SortField = 'overall' | 'cdr3' | 'framework' | 'kd' | 'tm' | 'hamming';
type ViewMode = 'active-vs-batch' | 'pairwise-matrix';

export function SequenceIdentityHeatmap({
  activeCandidate,
  candidates,
  onSelectCandidate,
  compact = false
}: SequenceIdentityHeatmapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('active-vs-batch');
  const [sortField, setSortField] = useState<SortField>('overall');
  const [sortAscending, setSortAscending] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minIdentityThreshold, setMinIdentityThreshold] = useState<number>(0);
  const [selectedComparedId, setSelectedComparedId] = useState<string | null>(null);
  const [matrixSize, setMatrixSize] = useState<number>(12); // For N x N matrix view
  const [hoveredCell, setHoveredCell] = useState<{
    idA: string;
    idB: string;
    nameA: string;
    nameB: string;
    identity: number;
    cdr3Identity: number;
  } | null>(null);

  // Compute comparisons of active candidate vs all candidates in the batch
  const comparisons: PairwiseComparisonResult[] = useMemo(() => {
    if (!activeCandidate || candidates.length === 0) return [];
    return candidates.map(other => compareActiveWithCandidate(activeCandidate, other));
  }, [activeCandidate, candidates]);

  // Filtered & sorted comparisons
  const filteredComparisons = useMemo(() => {
    let list = [...comparisons];

    // Filter out candidates with overall identity below threshold
    if (minIdentityThreshold > 0) {
      list = list.filter(c => c.overallIdentity >= minIdentityThreshold);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.candidateBId.toLowerCase().includes(q) ||
        c.candidateBName.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      switch (sortField) {
        case 'overall':
          valA = a.overallIdentity;
          valB = b.overallIdentity;
          break;
        case 'cdr3':
          valA = a.cdr3Identity;
          valB = b.cdr3Identity;
          break;
        case 'framework':
          valA = a.frameworkIdentity;
          valB = b.frameworkIdentity;
          break;
        case 'kd':
          valA = a.deltaKd;
          valB = b.deltaKd;
          break;
        case 'tm':
          valA = a.deltaTm;
          valB = b.deltaTm;
          break;
        case 'hamming':
          valA = a.hammingDistance;
          valB = b.hammingDistance;
          break;
      }
      return sortAscending ? valA - valB : valB - valA;
    });

    return list;
  }, [comparisons, minIdentityThreshold, searchQuery, sortField, sortAscending]);

  // Currently inspected comparison for detailed residue alignment
  const inspectedComparison = useMemo(() => {
    if (!selectedComparedId) {
      // Default to the first different candidate if available
      const nonSelf = filteredComparisons.find(c => c.candidateBId !== activeCandidate.id);
      return nonSelf || filteredComparisons[0] || null;
    }
    return filteredComparisons.find(c => c.candidateBId === selectedComparedId) || null;
  }, [filteredComparisons, selectedComparedId, activeCandidate.id]);

  // Subset for NxN matrix mode
  const matrixCandidates = useMemo(() => {
    // Ensure activeCandidate is included in the matrix
    const list = [activeCandidate, ...candidates.filter(c => c.id !== activeCandidate.id)];
    return list.slice(0, matrixSize);
  }, [candidates, activeCandidate, matrixSize]);

  // NxN symmetric identity lookup map
  const matrixData = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < matrixCandidates.length; i++) {
      for (let j = 0; j < matrixCandidates.length; j++) {
        const c1 = matrixCandidates[i];
        const c2 = matrixCandidates[j];
        const key = `${c1.id}::${c2.id}`;
        if (i === j) {
          map.set(key, 100);
        } else {
          const res = alignSequencesNeedlemanWunsch(c1.sequence, c2.sequence);
          map.set(key, res.identityPct);
        }
      }
    }
    return map;
  }, [matrixCandidates]);

  // Helper color gradient function based on identity %
  const getIdentityColor = (pct: number) => {
    if (pct >= 99.9) return 'bg-emerald-500 text-slate-950 font-bold';
    if (pct >= 95) return 'bg-emerald-600/90 text-white';
    if (pct >= 90) return 'bg-teal-600/80 text-white';
    if (pct >= 85) return 'bg-cyan-600/70 text-white';
    if (pct >= 80) return 'bg-sky-600/60 text-slate-100';
    if (pct >= 75) return 'bg-amber-600/50 text-amber-200';
    if (pct >= 70) return 'bg-amber-700/40 text-amber-300';
    return 'bg-slate-800/80 text-slate-400';
  };

  const getIdentityBadge = (pct: number) => {
    if (pct >= 99.9) return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
    if (pct >= 90) return 'text-teal-300 bg-teal-950/60 border-teal-500/30';
    if (pct >= 80) return 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30';
    if (pct >= 70) return 'text-amber-300 bg-amber-950/60 border-amber-500/30';
    return 'text-slate-400 bg-slate-900 border-slate-700';
  };

  // Export identity matrix as CSV
  const handleExportCsv = () => {
    const headers = ['Candidate_ID', 'Candidate_Name', 'Overall_Identity_Pct', 'CDR1_Identity_Pct', 'CDR2_Identity_Pct', 'CDR3_Identity_Pct', 'Framework_Identity_Pct', 'Hamming_Distance', 'Delta_Kd_nM', 'Delta_Tm_C', 'Hallmark_Match'];
    const rows = filteredComparisons.map(c => [
      c.candidateBId,
      `"${c.candidateBName}"`,
      c.overallIdentity,
      c.cdr1Identity,
      c.cdr2Identity,
      c.cdr3Identity,
      c.frameworkIdentity,
      c.hammingDistance,
      c.deltaKd,
      c.deltaTm,
      c.hallmarkMatch ? 'YES' : 'NO'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sequence_Identity_Heatmap_${activeCandidate.id}_vs_Batch.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col space-y-4 p-4 sm:p-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <span>Sequence Identity Heatmap</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ref: {activeCandidate.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pairwise homology matrix comparing <strong className="text-slate-200">{activeCandidate.name}</strong> across {candidates.length} batch candidates.
              </p>
            </div>
          </div>
        </div>

        {/* View mode toggle & Export button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('active-vs-batch')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                viewMode === 'active-vs-batch'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Active Lead vs All Batch Candidates list matrix"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Lead vs Batch Grid</span>
            </button>
            <button
              onClick={() => setViewMode('pairwise-matrix')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                viewMode === 'pairwise-matrix'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="NxN Symmetric Heatmap Matrix"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>N×N Matrix</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Download Identity Heatmap as CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
        {/* Search filter */}
        <div className="lg:col-span-4 relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search candidate clone ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Sort selector */}
        <div className="lg:col-span-4 flex items-center gap-2">
          <label className="text-[11px] text-slate-400 shrink-0 font-medium">Sort By:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="overall">Overall Sequence Identity (%)</option>
            <option value="cdr3">CDR3 Paratope Identity (%)</option>
            <option value="framework">Framework Homology (%)</option>
            <option value="hamming">Hamming Distance (aa)</option>
            <option value="kd">Binding Affinity (Kd)</option>
            <option value="tm">Thermal Stability (Tm)</option>
          </select>
          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={sortAscending ? 'Ascending Order' : 'Descending Order'}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Minimum Identity Threshold Slider */}
        <div className="lg:col-span-4 flex items-center gap-2.5">
          <label className="text-[11px] text-slate-400 shrink-0 font-medium">
            Min Identity: <strong className="text-white font-mono">{minIdentityThreshold}%</strong>
          </label>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minIdentityThreshold}
            onChange={(e) => setMinIdentityThreshold(Number(e.target.value))}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Color Scale Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span>Identity Scale:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700 inline-block" />
            <span>&lt;75%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-amber-600/60 inline-block" />
            <span>75-80%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-sky-600/70 inline-block" />
            <span>80-85%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-cyan-600/80 inline-block" />
            <span>85-90%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-teal-600 inline-block" />
            <span>90-95%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span>95-100%</span>
          </span>
        </span>
        <span className="text-slate-500 text-[10px]">
          Showing {filteredComparisons.length} of {candidates.length} clones
        </span>
      </div>

      {/* MAIN VIEW MODE A: Active vs Batch Comparison Grid */}
      {viewMode === 'active-vs-batch' && (
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/80 scrollbar-thin scrollbar-thumb-slate-700">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 bg-slate-950 px-3 py-2 text-[11px] font-semibold text-slate-400 font-mono sticky top-0 z-10 border-b border-slate-800">
              <div className="col-span-3">Candidate Clone</div>
              <div className="col-span-2 text-center">Overall Identity</div>
              <div className="col-span-2 text-center">CDR3 Paratope</div>
              <div className="col-span-2 text-center">Framework (FR)</div>
              <div className="col-span-1 text-center">Hallmark</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filteredComparisons.map((item) => {
              const isSelf = item.candidateBId === activeCandidate.id;
              const isInspected = inspectedComparison?.candidateBId === item.candidateBId;

              return (
                <div
                  key={item.candidateBId}
                  onClick={() => setSelectedComparedId(item.candidateBId)}
                  className={`grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-xs transition-colors cursor-pointer ${
                    isSelf
                      ? 'bg-emerald-950/20 border-l-2 border-emerald-500'
                      : isInspected
                      ? 'bg-cyan-950/30 border-l-2 border-cyan-400'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Candidate Name & ID */}
                  <div className="col-span-3 flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-white truncate">
                        {item.candidateBId}
                      </span>
                      {isSelf && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active Lead
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">
                      {item.candidateBName}
                    </span>
                  </div>

                  {/* Overall Identity Heatmap Cell */}
                  <div className="col-span-2 flex justify-center">
                    <div
                      className={`w-20 text-center font-mono py-1 rounded text-xs font-semibold ${getIdentityColor(
                        item.overallIdentity
                      )}`}
                    >
                      {item.overallIdentity}%
                    </div>
                  </div>

                  {/* CDR3 Identity Cell */}
                  <div className="col-span-2 flex justify-center">
                    <div
                      className={`w-20 text-center font-mono py-1 rounded text-xs font-semibold ${getIdentityColor(
                        item.cdr3Identity
                      )}`}
                    >
                      {item.cdr3Identity}%
                    </div>
                  </div>

                  {/* Framework Homology Cell */}
                  <div className="col-span-2 flex justify-center">
                    <div
                      className={`w-20 text-center font-mono py-1 rounded text-xs font-semibold ${getIdentityColor(
                        item.frameworkIdentity
                      )}`}
                    >
                      {item.frameworkIdentity}%
                    </div>
                  </div>

                  {/* Hallmark Tetrad Status */}
                  <div className="col-span-1 flex justify-center">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        item.hallmarkMatch
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                      title={
                        item.hallmarkMatch
                          ? '100% Hallmark tetrad match at positions 37, 44, 45, 47'
                          : `${item.hallmarkIdentity}% Hallmark tetrad match`
                      }
                    >
                      {item.hallmarkIdentity}%
                    </span>
                  </div>

                  {/* Quick Action Button */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    {!isSelf ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCandidate(item.candidateBId);
                        }}
                        className="px-2 py-1 text-[10px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                        title="Set this clone as the Active Lead"
                      >
                        Set Active
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 ${isInspected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN VIEW MODE B: NxN Pairwise Symmetric Matrix Heatmap */}
      {viewMode === 'pairwise-matrix' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Symmetric Pairwise Sequence Identity Matrix (Top {matrixCandidates.length} Clones)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">Matrix Dimension:</span>
              {[8, 12, 16, 20].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setMatrixSize(sz)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                    matrixSize === sz
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {sz}×{sz}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950 p-2">
            <table className="border-collapse select-none">
              <thead>
                <tr>
                  <th className="p-1 text-[9px] font-mono text-slate-500 text-left min-w-[75px]">
                    Clones
                  </th>
                  {matrixCandidates.map((c) => (
                    <th
                      key={c.id}
                      className={`p-1 text-[9px] font-mono text-center min-w-[34px] max-w-[36px] truncate ${
                        c.id === activeCandidate.id ? 'text-emerald-400 font-bold' : 'text-slate-400'
                      }`}
                      title={c.name}
                    >
                      {c.id.replace(/^VHH-/, '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixCandidates.map((rowCand) => {
                  const isRowActive = rowCand.id === activeCandidate.id;

                  return (
                    <tr key={rowCand.id} className={isRowActive ? 'bg-emerald-950/20' : ''}>
                      <td
                        className={`p-1 text-[10px] font-mono whitespace-nowrap ${
                          isRowActive ? 'text-emerald-400 font-bold' : 'text-slate-300'
                        }`}
                        title={rowCand.name}
                      >
                        {rowCand.id.replace(/^VHH-/, '')}
                      </td>
                      {matrixCandidates.map((colCand) => {
                        const isColActive = colCand.id === activeCandidate.id;
                        const key = `${rowCand.id}::${colCand.id}`;
                        const identity = matrixData.get(key) || 0;

                        return (
                          <td
                            key={colCand.id}
                            onMouseEnter={() => {
                              setHoveredCell({
                                idA: rowCand.id,
                                idB: colCand.id,
                                nameA: rowCand.name,
                                nameB: colCand.name,
                                identity,
                                cdr3Identity: identity
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => {
                              setSelectedComparedId(colCand.id);
                            }}
                            className={`p-0.5 text-center cursor-pointer transition-transform hover:scale-110 ${
                              isRowActive && isColActive ? 'ring-2 ring-emerald-400 rounded-sm z-10' : ''
                            }`}
                          >
                            <div
                              className={`w-7 h-7 flex items-center justify-center text-[9px] font-mono rounded-sm transition-opacity hover:opacity-90 ${getIdentityColor(
                                identity
                              )}`}
                              title={`${rowCand.id} vs ${colCand.id}: ${identity}% Identity`}
                            >
                              {Math.round(identity)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Hovered Cell Tooltip Summary */}
          {hoveredCell && (
            <div className="bg-slate-950/90 border border-cyan-500/30 rounded-lg p-2 text-xs flex items-center justify-between gap-2 font-mono animate-in fade-in">
              <span className="text-slate-300">
                <strong className="text-cyan-400">{hoveredCell.idA}</strong> vs{' '}
                <strong className="text-emerald-400">{hoveredCell.idB}</strong>
              </span>
              <span className="text-white font-bold">
                Identity: {hoveredCell.identity}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* SELECTED CANDIDATE RESIDUE-LEVEL PAIRWISE ALIGNMENT INSPECTOR */}
      {inspectedComparison && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <span>Pairwise Alignment Inspector:</span>
                <span className="text-cyan-300">{activeCandidate.id}</span>
                <span className="text-slate-500">vs</span>
                <span className="text-emerald-400">{inspectedComparison.candidateBId}</span>
              </h4>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                Identity: {inspectedComparison.overallIdentity}%
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                CDR3: {inspectedComparison.cdr3Identity}%
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                ΔKd: {inspectedComparison.deltaKd > 0 ? `+${inspectedComparison.deltaKd}` : inspectedComparison.deltaKd} nM
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                ΔTm: {inspectedComparison.deltaTm > 0 ? `+${inspectedComparison.deltaTm}` : inspectedComparison.deltaTm} °C
              </span>
            </div>
          </div>

          {/* Alignment Visual Track */}
          <div className="overflow-x-auto bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] font-mono leading-relaxed space-y-1 select-all">
            {/* Sequence A (Active Lead) */}
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-24 shrink-0 text-[10px] text-cyan-400 font-bold">
                {activeCandidate.id}:
              </span>
              <div className="flex tracking-widest break-all">
                {inspectedComparison.alignedSeqA.split('').map((char, i) => {
                  const match = char === inspectedComparison.alignedSeqB[i];
                  return (
                    <span
                      key={i}
                      className={`${
                        match ? 'text-slate-300' : 'text-cyan-400 font-bold bg-cyan-950/50 px-0.5 rounded'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Match Indicators */}
            <div className="flex items-center gap-2 text-slate-500">
              <span className="w-24 shrink-0 text-[10px] text-slate-500">Homology:</span>
              <div className="flex tracking-widest break-all font-bold">
                {inspectedComparison.alignedSeqA.split('').map((charA, i) => {
                  const charB = inspectedComparison.alignedSeqB[i];
                  if (charA === charB) return <span key={i} className="text-emerald-500">|</span>;
                  if (charA === '-' || charB === '-') return <span key={i} className="text-red-500">-</span>;
                  return <span key={i} className="text-amber-400">:</span>;
                })}
              </div>
            </div>

            {/* Sequence B (Compared Candidate) */}
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-24 shrink-0 text-[10px] text-emerald-400 font-bold">
                {inspectedComparison.candidateBId}:
              </span>
              <div className="flex tracking-widest break-all">
                {inspectedComparison.alignedSeqB.split('').map((char, i) => {
                  const match = char === inspectedComparison.alignedSeqA[i];
                  return (
                    <span
                      key={i}
                      className={`${
                        match ? 'text-slate-300' : 'text-amber-300 font-bold bg-amber-950/50 px-0.5 rounded'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Specific Variant Substitutions List */}
          {inspectedComparison.differences.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  Detected <strong className="text-white">{inspectedComparison.differences.length}</strong> residue substitutions across regions:
                </span>
                <span className="text-[10px] text-slate-500">
                  Hamming Distance: {inspectedComparison.hammingDistance} aa
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {inspectedComparison.differences.map((diff, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                      diff.region === 'CDR3'
                        ? 'bg-pink-950/50 text-pink-300 border-pink-500/30'
                        : diff.isConservative
                        ? 'bg-sky-950/50 text-sky-300 border-sky-500/30'
                        : 'bg-amber-950/50 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    <span className="font-bold text-slate-400">{diff.resA}</span>
                    <span className="text-white">{diff.pos}</span>
                    <span className="font-bold text-emerald-400">{diff.resB}</span>
                    <span className="text-[9px] text-slate-500">({diff.region})</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Sequences are 100% identical across all 115-130 amino acids.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

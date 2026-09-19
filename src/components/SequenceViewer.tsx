import { useState } from 'react';
import { VhhCandidate } from '../types';
import { Copy, Check, Sparkles, RefreshCw } from 'lucide-react';

interface SequenceViewerProps {
  candidate: VhhCandidate;
  onApplyMutation: (pos1Based: number, newAA: string, rationale: string) => void;
  onResetCandidate: () => void;
}

const AMINO_ACIDS = [
  { code: 'A', name: 'Ala (Alanine)', type: 'Nonpolar / Small' },
  { code: 'R', name: 'Arg (Arginine)', type: 'Positive / Basic' },
  { code: 'N', name: 'Asn (Asparagine)', type: 'Polar' },
  { code: 'D', name: 'Asp (Aspartate)', type: 'Negative / Acidic' },
  { code: 'C', name: 'Cys (Cysteine)', type: 'Disulfide Forming' },
  { code: 'Q', name: 'Gln (Glutamine)', type: 'Polar' },
  { code: 'E', name: 'Glu (Glutamate)', type: 'Negative / Acidic' },
  { code: 'G', name: 'Gly (Glycine)', type: 'Flexible / Small' },
  { code: 'H', name: 'His (Histidine)', type: 'Aromatic / Weak Base' },
  { code: 'I', name: 'Ile (Isoleucine)', type: 'Hydrophobic' },
  { code: 'L', name: 'Leu (Leucine)', type: 'Hydrophobic / Core' },
  { code: 'K', name: 'Lys (Lysine)', type: 'Positive / Basic' },
  { code: 'M', name: 'Met (Methionine)', type: 'Hydrophobic' },
  { code: 'F', name: 'Phe (Phenylalanine)', type: 'Aromatic' },
  { code: 'P', name: 'Pro (Proline)', type: 'Rigid Turn Stabilizer' },
  { code: 'S', name: 'Ser (Serine)', type: 'Polar' },
  { code: 'T', name: 'Thr (Threonine)', type: 'Polar' },
  { code: 'W', name: 'Trp (Tryptophan)', type: 'Aromatic Paratope' },
  { code: 'Y', name: 'Tyr (Tyrosine)', type: 'Aromatic Paratope' },
  { code: 'V', name: 'Val (Valine)', type: 'Hydrophobic' },
];

export function SequenceViewer({ candidate, onApplyMutation, onResetCandidate }: SequenceViewerProps) {
  const [selectedPos, setSelectedPos] = useState<number | null>(108); // default to position 108 (common FR4 Q108L engineering site)
  const [selectedNewAA, setSelectedNewAA] = useState<string>('L');
  const [customRationale, setCustomRationale] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const seq = candidate.sequence;
  const regions = candidate.regions;

  const currentResidue = selectedPos !== null && selectedPos <= seq.length ? seq[selectedPos - 1] : '';
  const currentRegion = regions.find(r => selectedPos !== null && selectedPos >= r.start && selectedPos <= r.end);

  const handleCopyFasta = () => {
    const fasta = `>${candidate.name} | Target: ${candidate.target} | Origin: ${candidate.libraryOrigin} | Kd: ${candidate.metrics.predictedKdNm}nM | Tm: ${candidate.metrics.meltingTempTm}C\n${seq}`;
    navigator.clipboard.writeText(fasta);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!selectedPos || !selectedNewAA) return;
    const rationale = customRationale || `Point mutation ${currentResidue}${selectedPos}${selectedNewAA} in ${currentRegion?.name || 'framework'}`;
    onApplyMutation(selectedPos, selectedNewAA, rationale);
  };

  // Helper to color-code regions
  const getRegionStyle = (pos: number) => {
    const r = regions.find(reg => pos >= reg.start && pos <= reg.end);
    if (!r) return 'text-slate-300 hover:bg-slate-700/50';

    if (r.name === 'CDR1') return 'text-cyan-300 font-semibold bg-cyan-950/40 hover:bg-cyan-900/60 border-b-2 border-cyan-400';
    if (r.name === 'CDR2') return 'text-teal-300 font-semibold bg-teal-950/40 hover:bg-teal-900/60 border-b-2 border-teal-400';
    if (r.name === 'CDR3') return 'text-fuchsia-300 font-bold bg-fuchsia-950/40 hover:bg-fuchsia-900/60 border-b-2 border-fuchsia-400';
    
    // Check camelid hallmark residues in FR2 (37, 44, 45, 47)
    if ([37, 44, 45, 47].includes(pos)) {
      return 'text-amber-300 font-bold bg-amber-950/50 hover:bg-amber-900/60 border-b-2 border-amber-400';
    }

    // Check canonical cysteines (22, 92)
    if (pos === 22 || pos === 92) {
      return 'text-emerald-300 font-bold bg-emerald-950/50 hover:bg-emerald-900/60 border-b-2 border-emerald-400';
    }

    return 'text-slate-300 hover:bg-slate-700/50';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <span>IMGT/Kabat Sequence Architecture &amp; Paratope Map</span>
            <span className="text-[11px] font-mono text-slate-400 lowercase font-normal">
              ({seq.length} amino acids)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any amino acid to inspect biophysical properties, or apply targeted in-silico point mutations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {candidate.mutationsApplied.length > 0 && (
            <button
              onClick={onResetCandidate}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset all mutations to original repertoire sequence"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset WT</span>
            </button>
          )}

          <button
            onClick={handleCopyFasta}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied FASTA' : 'Copy FASTA'}</span>
          </button>
        </div>
      </div>

      {/* Region Legend */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] mb-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
        <span className="text-slate-400 font-medium">Domains:</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          Framework (FR1, FR3, FR4)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-medium">
          CDR1 (Antigen Loop 1)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-medium">
          ★ FR2 Camelid Hallmarks (37, 44, 45, 47)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/40 font-medium">
          CDR2 (Antigen Loop 2)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-800/40 font-bold">
          CDR3 (High-Affinity Paratope)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
          Cys22-Cys92 Disulfide
        </span>
      </div>

      {/* Interactive Sequence Ribbon */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/90 overflow-x-auto shadow-inner mb-4">
        <div className="flex flex-wrap gap-1 font-mono text-sm leading-relaxed select-none">
          {seq.split('').map((char, index) => {
            const pos = index + 1;
            const isSelected = selectedPos === pos;
            const isMutated = candidate.mutationsApplied.some(m => m.position === pos);

            return (
              <div
                key={pos}
                onClick={() => setSelectedPos(pos)}
                className={`relative group cursor-pointer w-7 h-9 flex flex-col items-center justify-center rounded transition-all ${
                  isSelected
                    ? 'ring-2 ring-emerald-400 bg-emerald-500/20 scale-110 z-10'
                    : getRegionStyle(pos)
                }`}
                title={`Pos ${pos}: ${char} (${regions.find(r => pos >= r.start && pos <= r.end)?.name})`}
              >
                <span className="text-[9px] text-slate-500 font-mono leading-none mb-0.5">
                  {pos % 10 === 0 ? pos : ''}
                </span>
                <span className={`text-sm ${isMutated ? 'underline decoration-emerald-400 font-extrabold text-emerald-300' : ''}`}>
                  {char}
                </span>

                {/* Mutation dot indicator */}
                {isMutated && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Residue In Silico Mutagenesis Panel */}
      {selectedPos !== null && currentRegion && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mt-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 font-mono">Pos {selectedPos}</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{currentResidue}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">
                    Residue {currentResidue}{selectedPos} in {currentRegion.name}
                  </span>
                  {selectedPos === 108 && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Recommended: Q108L (+2.2°C Tm)
                    </span>
                  )}
                  {selectedPos === 40 && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Recommended: A40P (+1.8°C Tm)
                    </span>
                  )}
                  {[37, 44, 45, 47].includes(selectedPos) && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                      Camelid Hallmark Tetrad
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentRegion.description}
                </p>
              </div>
            </div>

            {/* Substitution controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Mutate to:</span>
              <select
                value={selectedNewAA}
                onChange={(e) => setSelectedNewAA(e.target.value)}
                className="bg-slate-900 text-emerald-400 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold focus:outline-none focus:border-emerald-500"
              >
                {AMINO_ACIDS.map((aa) => (
                  <option key={aa.code} value={aa.code} className="bg-slate-900 text-white font-mono">
                    {aa.code} - {aa.name} ({aa.type})
                  </option>
                ))}
              </select>

              <button
                onClick={handleApply}
                disabled={selectedNewAA === currentResidue}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate {currentResidue}{selectedPos}{selectedNewAA}</span>
              </button>
            </div>
          </div>

          {/* Quick Rationale Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 text-[11px]">Engineering presets:</span>
            <button
              onClick={() => {
                setSelectedPos(108);
                setSelectedNewAA('L');
                setCustomRationale('Q108L stabilizes FR4 C-terminal beta-strand packing against FR1, raising Tm by +2.2°C without losing affinity.');
              }}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded transition-colors"
            >
              Q108L (FR4 Core Pack)
            </button>
            <button
              onClick={() => {
                setSelectedPos(40);
                setSelectedNewAA('P');
                setCustomRationale('A40P stabilizes the turn between FR2 and CDR2, reducing conformational entropy in folding.');
              }}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded transition-colors"
            >
              A40P (Turn Rigidity)
            </button>
            <button
              onClick={() => {
                setSelectedPos(1);
                setSelectedNewAA('D');
                setCustomRationale('E1D eliminates N-terminal pyroglutamate formation for clean biomanufacturing.');
              }}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded transition-colors"
            >
              E1D (Anti-PyroGlu)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

import { useState } from 'react';
import { VhhCandidate } from '../types';
import { generateExpressionConstruct } from '../utils/biophysics';
import { X, Copy, Check, Download, Dna, FlaskConical } from 'lucide-react';

interface ExpressionConstructModalProps {
  candidate: VhhCandidate;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpressionConstructModal({ candidate, isOpen, onClose }: ExpressionConstructModalProps) {
  const [tag, setTag] = useState<'His6' | 'FLAG' | 'Myc'>('His6');
  const [copiedDna, setCopiedDna] = useState(false);
  const [copiedProtein, setCopiedProtein] = useState(false);

  if (!isOpen) return null;

  const construct = generateExpressionConstruct(candidate, tag);

  const handleCopyDna = () => {
    navigator.clipboard.writeText(construct.dnaSequence);
    setCopiedDna(true);
    setTimeout(() => setCopiedDna(false), 2000);
  };

  const handleCopyProtein = () => {
    navigator.clipboard.writeText(construct.proteinConstruct);
    setCopiedProtein(true);
    setTimeout(() => setCopiedProtein(false), 2000);
  };

  const handleDownloadGenBank = () => {
    const fastaContent = `>${candidate.name}_${tag}_pET22b_Construct | Length: ${construct.bpLength}bp | MW: ${construct.molecularWeightKDa}kDa\n${construct.dnaSequence}\n\n>${candidate.name}_Protein\n${construct.proteinConstruct}`;
    const blob = new Blob([fastaContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${candidate.name.replace(/\s+/g, '_')}_pET22b_construct.fasta`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Biomanufacturing cDNA &amp; Expression Construct
              </h3>
              <p className="text-xs text-slate-400">
                Codon-optimized cassette with pelB periplasmic secretion signal for {candidate.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vector Specification Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 mb-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Plasmid Backbone</span>
            <span className="text-slate-200 font-semibold">pET-22b(+)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Host System</span>
            <span className="text-emerald-400 font-semibold">E. coli BL21(DE3)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Secretion Leader</span>
            <span className="text-cyan-400 font-semibold">pelB signal</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Calculated MW</span>
            <span className="text-indigo-300 font-semibold">{construct.molecularWeightKDa} kDa</span>
          </div>
        </div>

        {/* Tag Selection */}
        <div className="flex items-center gap-3 mb-4 text-xs">
          <span className="text-slate-400 font-medium">Affinity Purification Tag:</span>
          <div className="flex items-center gap-2">
            {(['His6', 'FLAG', 'Myc'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`px-3 py-1 rounded-md transition-colors font-mono ${
                  tag === t
                    ? 'bg-emerald-600 text-white font-semibold shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t} Tag
              </button>
            ))}
          </div>
        </div>

        {/* Translation Schematic */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-slate-300">Translated Polypeptide Construct</span>
            <button
              onClick={handleCopyProtein}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              {copiedProtein ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedProtein ? 'Copied' : 'Copy Amino Acids'}</span>
            </button>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] break-all leading-relaxed text-slate-300 select-all">
            <span className="text-cyan-400 font-bold" title="pelB signal peptide">
              MKYLLPTAAAGLLLLAAQPAMA-
            </span>
            <span className="text-emerald-300 font-bold" title="Engineered VHH Core">
              {candidate.sequence}
            </span>
            <span className="text-slate-400">-GA-</span>
            <span className="text-pink-400 font-bold" title="Purification Tag">
              {tag === 'His6' ? 'HHHHHH' : tag === 'FLAG' ? 'DYKDDDDK' : 'EQKLISEEDL'}
            </span>
          </div>
        </div>

        {/* Codon Optimized cDNA */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-slate-300">
              Codon-Optimized cDNA Sequence ({construct.bpLength} bp)
            </span>
            <button
              onClick={handleCopyDna}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              {copiedDna ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedDna ? 'Copied' : 'Copy DNA'}</span>
            </button>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] break-all leading-relaxed text-slate-400 select-all max-h-36 overflow-y-auto">
            {construct.dnaSequence}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg border border-slate-700"
          >
            Close
          </button>
          <button
            onClick={handleDownloadGenBank}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download FASTA / Gene Dossier</span>
          </button>
        </div>

      </div>
    </div>
  );
}

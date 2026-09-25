import { Dna, Sparkles, Download } from 'lucide-react';

interface NavbarProps {
  selectedTarget: string;
  setSelectedTarget: (target: string) => void;
  targets: Array<{ id: string; name: string; domain: string }>;
  onExportAllFasta: () => void;
  onOpenAiDrawer: () => void;
  totalSequencesCount: number;
}

export function Navbar({
  selectedTarget,
  setSelectedTarget,
  targets,
  onExportAllFasta,
  onOpenAiDrawer,
  totalSequencesCount
}: NavbarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Dna className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  NanoVHH Studio
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
                  Sequence Generator
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Single-domain antibody library synthesis, humanization &amp; FASTA export
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Target Antigen Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400 font-medium hidden sm:inline">Target:</span>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                aria-label="Target Antigen"
                className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer pr-1 text-xs"
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.id}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Biophysics Drawer */}
            <button
              onClick={onOpenAiDrawer}
              className="bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/25 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Biophysical AI Rationale"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">AI Analysis</span>
            </button>

            {/* Quick Export FASTA */}
            <button
              onClick={onExportAllFasta}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Download all generated sequences as FASTA"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export FASTA ({totalSequencesCount})</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

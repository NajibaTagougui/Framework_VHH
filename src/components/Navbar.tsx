import { Cpu, Dna, Cloud, Sparkles, Download, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'designer' | 'library' | 'batch-cloud';
  setActiveTab: (tab: 'designer' | 'library' | 'batch-cloud') => void;
  selectedTarget: string;
  setSelectedTarget: (target: string) => void;
  targets: Array<{ id: string; name: string; domain: string }>;
  onOpenBatchModal: () => void;
  onOpenConstructModal: () => void;
  onOpenAiDrawer: () => void;
  onOpenBatchGeneratorModal?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  selectedTarget,
  setSelectedTarget,
  targets,
  onOpenBatchModal,
  onOpenConstructModal,
  onOpenAiDrawer,
  onOpenBatchGeneratorModal
}: NavbarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Dna className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  NanoVHH Studio
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
                  Cloud Bio-ML
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Synthetic Antibody Discovery &amp; In Silico Developability
              </p>
            </div>
          </div>

          {/* Target Antigen Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">Target:</span>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.id} - {t.domain}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('designer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'designer'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Lead Engineering</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Immunized Library</span>
            </button>
            <button
              onClick={() => setActiveTab('batch-cloud')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'batch-cloud'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloud Workers</span>
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {onOpenBatchGeneratorModal && (
              <button
                onClick={onOpenBatchGeneratorModal}
                className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Batch Generate VHH Variants &amp; Save FASTA"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Batch &amp; FASTA</span>
              </button>
            )}

            <button
              onClick={onOpenAiDrawer}
              className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Biophysical AI Rationale"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">AI Analysis</span>
            </button>

            <button
              onClick={onOpenConstructModal}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Expression Construct cDNA &amp; Plasmid"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Construct</span>
            </button>

            <button
              onClick={onOpenBatchModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Run Batch Scan</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

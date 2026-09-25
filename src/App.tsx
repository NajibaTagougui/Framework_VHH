import { useState, useEffect, useMemo } from 'react';
import { INITIAL_TARGETS, INITIAL_CANDIDATES } from './data/mockLibraries';
import { VhhCandidate } from './types';
import {
  applyInSilicoMutation,
  batchGenerateVhhVariants,
  calculateBatchDiversityMetrics,
  exportToFasta,
  generateFastaText,
  BatchDiversityMetrics
} from './utils/biophysics';

import { Navbar } from './components/Navbar';
import { SequenceGeneratorBar } from './components/SequenceGeneratorBar';
import { SequenceTable } from './components/SequenceTable';
import { ActiveLeadInspector } from './components/ActiveLeadInspector';
import { AiAnalysisDrawer } from './components/AiAnalysisDrawer';
import { SequenceIdentityHeatmap } from './components/SequenceIdentityHeatmap';
import { Table, Grid } from 'lucide-react';

export default function App() {
  const [candidates, setCandidates] = useState<VhhCandidate[]>(INITIAL_CANDIDATES);
  const [selectedTarget, setSelectedTarget] = useState<string>('EGFR');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('VHH-EGFR-7B4');
  const [mainViewTab, setMainViewTab] = useState<'library' | 'heatmap'>('library');
  
  // Sequence Generation Controls
  const [strategy, setStrategy] = useState<'Humanization Sweep' | 'Affinity Maturation DMS' | 'Thermostability Annealing' | 'Universal Diversity'>('Humanization Sweep');
  const [batchCount, setBatchCount] = useState<number>(1000);
  const [ensureHumanizationValid, setEnsureHumanizationValid] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedFasta, setCopiedFasta] = useState<boolean>(false);
  
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Structural Diversity and Quality Audit
  const [diversityMetrics, setDiversityMetrics] = useState<BatchDiversityMetrics | null>(() => {
    return calculateBatchDiversityMetrics(INITIAL_CANDIDATES);
  });

  // Keep selected candidate valid when candidates change
  useEffect(() => {
    const exists = candidates.some(c => c.id === selectedCandidateId);
    if (!exists && candidates.length > 0) {
      const matchForTarget = candidates.find(c => c.target === selectedTarget);
      setSelectedCandidateId(matchForTarget ? matchForTarget.id : candidates[0].id);
    }
  }, [candidates, selectedTarget, selectedCandidateId]);

  // When target changes, sync active candidate
  useEffect(() => {
    const candidateForTarget = candidates.find(c => c.target === selectedTarget);
    if (candidateForTarget && candidateForTarget.id !== selectedCandidateId) {
      setSelectedCandidateId(candidateForTarget.id);
    }
  }, [selectedTarget]);

  const activeCandidate = useMemo(() => {
    return candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  }, [candidates, selectedCandidateId]);

  // Handle Sequence Generation
  const handleGenerateSequences = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Find template parent for current target
      const parentTemplate = candidates.find(c => c.target === selectedTarget) || INITIAL_CANDIDATES[0];
      
      const newVariants = batchGenerateVhhVariants({
        baseCandidate: parentTemplate,
        target: selectedTarget,
        strategy,
        count: batchCount,
        ensureHumanizationValid
      });

      const metrics = calculateBatchDiversityMetrics(newVariants);
      setDiversityMetrics(metrics);
      setCandidates(newVariants);
      if (newVariants.length > 0) {
        setSelectedCandidateId(newVariants[0].id);
      }
      setIsGenerating(false);
    }, 450);
  };

  // Export all candidates to FASTA
  const handleExportAllFasta = () => {
    exportToFasta(candidates, `NanoVHH_${selectedTarget}_${strategy.replace(/\s+/g, '_')}_Library.fasta`);
  };

  // Copy all candidates as FASTA to clipboard
  const handleCopyFasta = () => {
    const text = generateFastaText(candidates);
    navigator.clipboard.writeText(text);
    setCopiedFasta(true);
    setTimeout(() => setCopiedFasta(false), 2000);
  };

  // Automated stabilization of the active candidate
  const handleAutoStabilize = () => {
    if (!activeCandidate) return;
    setIsOptimizing(true);
    setTimeout(() => {
      let current = activeCandidate;

      // 1. Q108L core hydrophobic packing
      if (current.sequence.length >= 108 && current.sequence[107] === 'Q') {
        const res = applyInSilicoMutation(current, 108, 'L', 'Engineered Q108L for core beta-strand hydrophobic stabilization');
        current = res.updatedCandidate;
      }

      // 2. A40P turn entropy reduction
      if (current.sequence.length >= 40 && current.sequence[39] !== 'P') {
        const res = applyInSilicoMutation(current, 40, 'P', 'Engineered A40P to rigidify the beta-turn and increase thermal melting threshold');
        current = res.updatedCandidate;
      }

      // 3. Fix chemical liabilities (e.g. Asn deamidation)
      if (current.liabilities.length > 0) {
        for (const liability of current.liabilities) {
          if (liability.type === 'Deamidation') {
            const res = applyInSilicoMutation(current, liability.position, 'Q', `Replaced labile Asn with Gln at pos ${liability.position}`);
            current = res.updatedCandidate;
            break;
          }
        }
      }

      current.status = 'Lead Candidate';
      current.notes = 'Automated multi-objective optimization applied: enhanced thermal packing, reduced conformational entropy, and cured chemical liabilities.';

      setCandidates(prev => prev.map(c => c.id === activeCandidate.id ? current : c));
      setIsOptimizing(false);
    }, 500);
  };

  // Apply single in-silico mutation (e.g. from AI drawer)
  const handleApplyMutation = (pos1Based: number, newAA: string, rationale: string) => {
    if (!activeCandidate) return;
    const { updatedCandidate } = applyInSilicoMutation(activeCandidate, pos1Based, newAA, rationale);
    setCandidates(prev => prev.map(c => c.id === activeCandidate.id ? updatedCandidate : c));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* Minimalist Top Navbar */}
      <Navbar
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
        targets={INITIAL_TARGETS}
        onExportAllFasta={handleExportAllFasta}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        totalSequencesCount={candidates.length}
      />

      {/* Main Minimalist Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Section 1: Minimalist Sequence Generation & Diversity Control Console */}
        <SequenceGeneratorBar
          selectedTarget={selectedTarget}
          setSelectedTarget={setSelectedTarget}
          targets={INITIAL_TARGETS}
          strategy={strategy}
          setStrategy={setStrategy}
          count={batchCount}
          setCount={setBatchCount}
          ensureHumanizationValid={ensureHumanizationValid}
          setEnsureHumanizationValid={setEnsureHumanizationValid}
          isGenerating={isGenerating}
          onGenerate={handleGenerateSequences}
          onExportFasta={handleExportAllFasta}
          onCopyFasta={handleCopyFasta}
          copiedFasta={copiedFasta}
          diversityMetrics={diversityMetrics}
          totalCount={candidates.length}
        />

        {/* Section 2: Two-Column Workspace (Sequences Table / Heatmap + Active Lead 3D Inspector) */}
        <div className="space-y-3">
          {/* Workspace View Mode Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setMainViewTab('library')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  mainViewTab === 'library'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Candidate Library</span>
              </button>
              <button
                onClick={() => setMainViewTab('heatmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  mainViewTab === 'heatmap'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Sequence Identity Heatmap</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Grid
                </span>
              </button>
            </div>

            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
              <span>Active Lead:</span>
              <strong className="text-emerald-400 font-mono">{activeCandidate?.id}</strong>
              <span className="text-slate-600">•</span>
              <span>Target:</span>
              <strong className="text-cyan-300 font-mono">{selectedTarget}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left / Main Column: Generated Sequences Table OR Sequence Identity Heatmap */}
            <div className="lg:col-span-7 h-full">
              {mainViewTab === 'library' ? (
                <SequenceTable
                  candidates={candidates}
                  selectedCandidateId={selectedCandidateId}
                  onSelectCandidate={(c) => setSelectedCandidateId(c.id)}
                  selectedTarget={selectedTarget}
                  onOpenHeatmap={() => setMainViewTab('heatmap')}
                />
              ) : (
                <SequenceIdentityHeatmap
                  activeCandidate={activeCandidate}
                  candidates={candidates.filter(c => c.target === selectedTarget)}
                  onSelectCandidate={(id) => setSelectedCandidateId(id)}
                />
              )}
            </div>

            {/* Right Column: Active Lead Inspector & 3D ESMFold Preview */}
            <div className="lg:col-span-5 sticky top-20">
              {activeCandidate && (
                <ActiveLeadInspector
                  candidate={activeCandidate}
                  onAutoStabilize={handleAutoStabilize}
                  isOptimizing={isOptimizing}
                  onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
                />
              )}
            </div>
          </div>
        </div>

      </main>

      {/* AI Biophysics Rationale Drawer */}
      <AiAnalysisDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        candidate={activeCandidate}
        onApplySuggestedMutation={handleApplyMutation}
      />

      {/* Minimalist Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>NanoVHH Studio • VHH Sequence Generator</span>
          <span className="font-mono text-[11px]">IMGT/Kabat Nomenclature • ESMFold 3D Ribbon • FASTA Format</span>
        </div>
      </footer>
    </div>
  );
}

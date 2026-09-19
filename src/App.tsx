import { useState, useEffect } from 'react';
import {
  INITIAL_TARGETS,
  INITIAL_CANDIDATES,
  INITIAL_BATCH_JOBS,
  parseRegions,
  detectLiabilities
} from './data/mockLibraries';
import { VhhCandidate, CloudBatchJob } from './types';
import { applyInSilicoMutation, calculateIsoelectricPoint, calculateGRAVY, calculateHumanizationScore } from './utils/biophysics';

import { Navbar } from './components/Navbar';
import { BiophysicsMetrics } from './components/BiophysicsMetrics';
import { SequenceViewer } from './components/SequenceViewer';
import { MeltingAndKineticsCharts } from './components/MeltingAndKineticsCharts';
import { LiabilitiesPanel } from './components/LiabilitiesPanel';
import { StructureParatopeViewer } from './components/StructureParatopeViewer';
import { CandidateSelector } from './components/CandidateSelector';
import { BatchJobsView } from './components/BatchJobsView';
import { ExpressionConstructModal } from './components/ExpressionConstructModal';
import { CloudPipelineModal } from './components/CloudPipelineModal';
import { AiAnalysisDrawer } from './components/AiAnalysisDrawer';
import { HumanizationInspector } from './components/HumanizationInspector';
import { BatchGenerationModal } from './components/BatchGenerationModal';

export default function App() {
  const [candidates, setCandidates] = useState<VhhCandidate[]>(INITIAL_CANDIDATES);
  const [selectedTarget, setSelectedTarget] = useState<string>('EGFR');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('VHH-EGFR-7B4');
  const [activeTab, setActiveTab] = useState<'designer' | 'library' | 'batch-cloud'>('designer');
  
  const [batchJobs, setBatchJobs] = useState<CloudBatchJob[]>(INITIAL_BATCH_JOBS);
  const [isConstructModalOpen, setIsConstructModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isBatchGeneratorModalOpen, setIsBatchGeneratorModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Sync selected candidate when target changes if needed
  useEffect(() => {
    const candidateForTarget = candidates.find(c => c.target === selectedTarget);
    if (candidateForTarget && candidateForTarget.id !== selectedCandidateId) {
      setSelectedCandidateId(candidateForTarget.id);
    }
  }, [selectedTarget]);

  // Real-time background simulation of active cloud jobs
  useEffect(() => {
    const timer = setInterval(() => {
      setBatchJobs(prev => prev.map(job => {
        if (job.status === 'Running') {
          const nextProg = Math.min(100, job.progress + 6);
          const isDone = nextProg >= 100;
          return {
            ...job,
            progress: nextProg,
            variantsScreened: job.variantsScreened + 75,
            topCandidatesFound: job.topCandidatesFound + (isDone ? 2 : 0),
            status: isDone ? 'Completed' : 'Running',
            durationSec: job.durationSec + 3
          };
        }
        return job;
      }));
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  // Apply single in-silico mutation
  const handleApplyMutation = (pos1Based: number, newAA: string, rationale: string) => {
    const { updatedCandidate } = applyInSilicoMutation(activeCandidate, pos1Based, newAA, rationale);
    setCandidates(prev => prev.map(c => c.id === activeCandidate.id ? updatedCandidate : c));
  };

  // Reset candidate back to wildtype
  const handleResetCandidate = () => {
    const wt = INITIAL_CANDIDATES.find(c => c.id.split('-opt')[0] === activeCandidate.id.split('-opt')[0]);
    if (wt) {
      setCandidates(prev => prev.map(c => c.id === activeCandidate.id ? { ...wt } : c));
    }
  };

  // Multi-step automated stabilization and liability remediation
  const handleAutoStabilize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      let current = activeCandidate;

      // 1. Q108L optimization in FR4
      if (current.sequence.length >= 108 && current.sequence[107] === 'Q') {
        const res = applyInSilicoMutation(current, 108, 'L', 'Engineered Q108L for core hydrophobic beta-strand stabilization');
        current = res.updatedCandidate;
      }

      // 2. A40P turn entropy reduction
      if (current.sequence.length >= 40 && current.sequence[39] !== 'P') {
        const res = applyInSilicoMutation(current, 40, 'P', 'Engineered A40P to rigidify the beta-turn and increase thermal melting threshold');
        current = res.updatedCandidate;
      }

      // 3. Fix liabilities (e.g. Asn in deamidation motif)
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
    }, 600);
  };

  // Trigger new batch engineering job
  const handleTriggerNewJob = (jobType: CloudBatchJob['type'], target: string) => {
    const newJob: CloudBatchJob = {
      id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${target} ${jobType}`,
      target,
      type: jobType,
      status: 'Running',
      progress: 5,
      variantsScreened: 180,
      topCandidatesFound: 2,
      cloudNode: 'us-central1-vertex-tpu-pool',
      startedAt: 'Just now',
      durationSec: 5
    };
    setBatchJobs([newJob, ...batchJobs]);
    setActiveTab('batch-cloud');
  };

  // Import custom repertoire clone
  const handleImportSequence = (seq: string, name: string, target: string) => {
    const clean = seq.replace(/\s+/g, '').toUpperCase();
    const regions = parseRegions(clean);
    const liabilities = detectLiabilities(clean);
    const pi = calculateIsoelectricPoint(clean);
    const gravy = calculateGRAVY(clean);
    const hum = calculateHumanizationScore(clean);

    const newCandidate: VhhCandidate = {
      id: `VHH-CUSTOM-${Date.now().toString(36)}`,
      name,
      target,
      targetDescription: `Custom repertoire clone for ${target}`,
      libraryOrigin: 'Synthetic CDR3-Shuffled',
      panningRound: 2,
      enrichmentRatio: 22.4,
      ngsReadCount: 75000,
      sequence: clean,
      regions,
      metrics: {
        predictedKdNm: 3.2,
        deltaGKcal: -11.6,
        meltingTempTm: 68.0,
        expressionYieldMgL: 105,
        isoelectricPoint: pi,
        hydrophobicityIndex: gravy,
        humanizationScore: hum,
        developabilityScore: 84
      },
      liabilities,
      mutationsApplied: [],
      status: 'Wildtype'
    };

    setCandidates([newCandidate, ...candidates]);
    setSelectedCandidateId(newCandidate.id);
    setActiveTab('designer');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] antialiased">
      
      {/* Top Application Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
        targets={INITIAL_TARGETS}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenConstructModal={() => setIsConstructModalOpen(true)}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onOpenBatchGeneratorModal={() => setIsBatchGeneratorModalOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Tab 1: Lead Engineering & In Silico Developability Studio */}
        {activeTab === 'designer' && (
          <div className="space-y-6">
            
            {/* Active Candidate Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {activeCandidate.id}
                  </span>
                  <h1 className="text-base sm:text-lg font-bold text-white">
                    {activeCandidate.name}
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                    {activeCandidate.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Target: <strong className="text-slate-200">{activeCandidate.target}</strong> ({activeCandidate.targetDescription}) • Origin: {activeCandidate.libraryOrigin} • Panning Round {activeCandidate.panningRound}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('library')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Browse Other Clones
                </button>
                <button
                  onClick={() => setIsBatchGeneratorModalOpen(true)}
                  className="text-xs bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Batch &amp; FASTA
                </button>
                <button
                  onClick={() => setIsConstructModalOpen(true)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Export cDNA &amp; Plasmid
                </button>
              </div>
            </div>

            {/* Biophysical Metrics Overview */}
            <BiophysicsMetrics
              candidate={activeCandidate}
              onAutoStabilize={handleAutoStabilize}
              isOptimizing={isOptimizing}
            />

            {/* Sequence Viewer & Point Mutagenesis */}
            <SequenceViewer
              candidate={activeCandidate}
              onApplyMutation={handleApplyMutation}
              onResetCandidate={handleResetCandidate}
            />

            {/* Humanization & Developability Clinical Inspector */}
            <HumanizationInspector
              candidate={activeCandidate}
              onAddCandidates={(newOnes) => {
                setCandidates(prev => [...newOnes, ...prev]);
              }}
              onSelectCandidate={(c) => {
                setSelectedCandidateId(c.id);
              }}
            />

            {/* Grid: Charts & Structure with ESMFold 3D Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MeltingAndKineticsCharts candidate={activeCandidate} />
              <StructureParatopeViewer candidate={activeCandidate} />
            </div>

            {/* Liabilities & Chemical Degradation Scanner */}
            <LiabilitiesPanel
              candidate={activeCandidate}
              onFixLiability={handleApplyMutation}
            />

          </div>
        )}

        {/* Tab 2: Immunized Library & Repertoire Explorer */}
        {activeTab === 'library' && (
          <CandidateSelector
            candidates={candidates}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={(c) => {
              setSelectedCandidateId(c.id);
              setActiveTab('designer');
            }}
            onImportSequence={handleImportSequence}
            currentTarget={selectedTarget}
            onOpenBatchGenerator={() => setIsBatchGeneratorModalOpen(true)}
          />
        )}

        {/* Tab 3: Cloud Workers & Batch Automated Pipeline */}
        {activeTab === 'batch-cloud' && (
          <BatchJobsView
            jobs={batchJobs}
            onTriggerNewJob={handleTriggerNewJob}
            selectedTarget={selectedTarget}
            onSelectLeadCandidate={(id) => {
              setSelectedCandidateId(id);
              setActiveTab('designer');
            }}
            onOpenBatchGenerator={() => setIsBatchGeneratorModalOpen(true)}
            allCandidates={candidates}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>NanoVHH Studio • Scalable Cloud Automated Protein Engineering Platform</span>
          <span className="font-mono text-[11px]">IMGT/Kabat Numbering • FoldX Stability Engine • ESM Embeddings</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ExpressionConstructModal
        candidate={activeCandidate}
        isOpen={isConstructModalOpen}
        onClose={() => setIsConstructModalOpen(false)}
      />

      <BatchGenerationModal
        isOpen={isBatchGeneratorModalOpen}
        onClose={() => setIsBatchGeneratorModalOpen(false)}
        currentTarget={selectedTarget}
        availableTargets={INITIAL_TARGETS}
        onAddCandidates={(newOnes) => {
          setCandidates(prev => {
            const seen = new Set<string>();
            const combined: VhhCandidate[] = [];
            for (const item of [...newOnes, ...prev]) {
              if (!seen.has(item.id)) {
                seen.add(item.id);
                combined.push(item);
              }
            }
            return combined;
          });
          if (newOnes.length > 0) {
            setSelectedCandidateId(newOnes[0].id);
            setActiveTab('designer');
          }
        }}
      />

      <CloudPipelineModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onLaunchJob={(job) => {
          const newJob: CloudBatchJob = {
            ...job,
            id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
            startedAt: 'Just now'
          };
          setBatchJobs([newJob, ...batchJobs]);
          setActiveTab('batch-cloud');
        }}
        selectedTarget={selectedTarget}
      />

      <AiAnalysisDrawer
        candidate={activeCandidate}
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onApplySuggestedMutation={(pos, newAA, rationale) => {
          handleApplyMutation(pos, newAA, rationale);
          setIsAiDrawerOpen(false);
        }}
      />

    </div>
  );
}

import { useState } from 'react';
import { CloudBatchJob, VhhCandidate } from '../types';
import { Cloud, Play, CheckCircle2, Clock, Cpu, Server, Activity, ArrowRight, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { exportToFasta, batchGenerateVhhVariants } from '../utils/biophysics';

interface BatchJobsViewProps {
  jobs: CloudBatchJob[];
  onTriggerNewJob: (jobType: CloudBatchJob['type'], target: string) => void;
  selectedTarget: string;
  onSelectLeadCandidate?: (candidateId: string) => void;
  onOpenBatchGenerator?: () => void;
  allCandidates?: VhhCandidate[];
}

export function BatchJobsView({
  jobs,
  onTriggerNewJob,
  selectedTarget,
  onSelectLeadCandidate,
  onOpenBatchGenerator,
  allCandidates = []
}: BatchJobsViewProps) {
  const [selectedJobType, setSelectedJobType] = useState<CloudBatchJob['type']>('Deep Mutational Scanning');
  const [activeJobFilter, setActiveJobFilter] = useState<'all' | 'Running' | 'Completed'>('all');

  const handleExportJobFasta = (job: CloudBatchJob) => {
    // Generate or filter candidates for this job
    const matching = allCandidates.filter(c => c.target === job.target);
    const variantsToExport = matching.length > 0
      ? matching.slice(0, job.topCandidatesFound || 5)
      : batchGenerateVhhVariants({
          target: job.target,
          strategy: job.type.includes('Human') ? 'Humanization Sweep' : 'Affinity Maturation DMS',
          count: job.topCandidatesFound || 5,
          ensureHumanizationValid: true
        });

    exportToFasta(variantsToExport, `NanoVHH_${job.id}_${job.target}_TopHits.fasta`);
  };

  const filteredJobs = jobs.filter(j => {
    if (activeJobFilter !== 'all' && j.status !== activeJobFilter) return false;
    return true;
  });

  const totalVariants = jobs.reduce((sum, j) => sum + j.variantsScreened, 0);
  const totalLeads = jobs.reduce((sum, j) => sum + j.topCandidatesFound, 0);

  return (
    <div className="space-y-6">
      
      {/* Cloud Cluster Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Server className="w-4 h-4 text-emerald-400" />
              Cloud Worker Fleet
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">32</span>
            <span className="text-xs text-slate-400">Node Cluster</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            GCP Cloud Run / Vertex TPU v4
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-4 h-4 text-cyan-400" />
              In Silico Throughput
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">1,420 var/s</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {totalVariants.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">variants</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Total screened mutational states
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Pareto-Top Leads
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">Kd &lt; 5nM</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-indigo-300">{totalLeads}</span>
            <span className="text-xs text-slate-400 font-mono">clones</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Exceeding stability &amp; expression specs
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-white block">Automated Campaign Runner</span>
            <span className="text-[11px] text-slate-400">In silico batch library synthesis</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            {onOpenBatchGenerator && (
              <button
                onClick={onOpenBatchGenerator}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Batch Generate &amp; Save FASTA</span>
              </button>
            )}
            <button
              onClick={() => onTriggerNewJob(selectedJobType, selectedTarget)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Batch Simulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Runner Setup Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2 font-['Plus_Jakarta_Sans']">
          Configure High-Throughput Engineering Job
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Deploy scalable compute jobs to evaluate multi-point combinatorial variants across stability, affinity, and developability landscapes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              type: 'Deep Mutational Scanning' as const,
              title: 'Deep Mutational Scan',
              desc: 'Single-point saturation mutagenesis across CDR1, CDR2, and CDR3 (19 substitutions per position)'
            },
            {
              type: 'Humanization Sweep' as const,
              title: 'Humanization Sweep',
              desc: 'Framework substitution towards human IGHV3-23*04 while preserving camelid hallmark tetrad'
            },
            {
              type: 'Stability Annealing' as const,
              title: 'Stability Annealing',
              desc: 'Hydrophobic core repacking and beta-turn rigidification to push Tm above 75°C'
            },
            {
              type: 'Affinity Maturation' as const,
              title: 'Affinity Maturation',
              desc: 'Antigen contact surface optimization to shift Kd from single-digit nM into sub-nanomolar'
            }
          ].map((item) => (
            <div
              key={item.type}
              onClick={() => setSelectedJobType(item.type)}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                selectedJobType === item.type
                  ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40 text-white'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-slate-200">{item.title}</span>
                {selectedJobType === item.type && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Job Queue & Progress List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span>Distributed Batch Execution Jobs</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live asynchronous status of protein scoring worker jobs running on containerized microservices.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveJobFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeJobFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({jobs.length})
            </button>
            <button
              onClick={() => setActiveJobFilter('Running')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeJobFilter === 'Running' ? 'bg-slate-800 text-cyan-400 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Running
            </button>
            <button
              onClick={() => setActiveJobFilter('Completed')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeJobFilter === 'Completed' ? 'bg-slate-800 text-emerald-400 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    job.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {job.status === 'Completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Activity className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{job.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {job.id}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Target: {job.target} • {job.cloudNode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Variants Evaluated</span>
                    <span className="text-slate-200 font-semibold">{job.variantsScreened.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Lead Hits Found</span>
                    <span className="text-emerald-400 font-semibold">{job.topCandidatesFound} clones</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Duration</span>
                    <span className="text-slate-400">{job.durationSec}s</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    job.status === 'Completed' ? 'bg-emerald-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${job.progress}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Status: <strong className={job.status === 'Completed' ? 'text-emerald-400' : 'text-cyan-400'}>{job.status}</strong> ({job.progress}%)</span>
                  <span>Initiated: {job.startedAt}</span>
                </div>

                {job.status === 'Completed' && (
                  <button
                    onClick={() => handleExportJobFasta(job)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono text-[10px] transition-colors cursor-pointer"
                    title="Export all validated lead candidates from this batch job as a multi-FASTA file"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>Export {job.topCandidatesFound} Hits (.fasta)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

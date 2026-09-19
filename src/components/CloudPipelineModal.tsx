import { useState } from 'react';
import { Cloud, Cpu, Play, X, Sliders, ShieldCheck } from 'lucide-react';
import { CloudBatchJob } from '../types';

interface CloudPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchJob: (job: Omit<CloudBatchJob, 'id' | 'startedAt'>) => void;
  selectedTarget: string;
}

export function CloudPipelineModal({
  isOpen,
  onClose,
  onLaunchJob,
  selectedTarget
}: CloudPipelineModalProps) {
  const [jobName, setJobName] = useState(`Batch-Optimization-${selectedTarget}`);
  const [jobType, setJobType] = useState<CloudBatchJob['type']>('Deep Mutational Scanning');
  const [workerCount, setWorkerCount] = useState<number>(32);
  const [targetKdThreshold, setTargetKdThreshold] = useState<number>(5.0);
  const [minTmThreshold, setMinTmThreshold] = useState<number>(72.0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunchJob({
      name: jobName,
      target: selectedTarget,
      type: jobType,
      status: 'Running',
      progress: 12,
      variantsScreened: 350,
      topCandidatesFound: 4,
      cloudNode: `gcp-cluster-node-pool-${workerCount}x`,
      durationSec: 15
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Launch Cloud-Based Batch Engineering
              </h3>
              <p className="text-xs text-slate-400">
                Automated multi-variant exploration for target: {selectedTarget}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">
              Campaign Identifier
            </label>
            <input
              type="text"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">
              Engineering Pipeline Algorithm
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Deep Mutational Scanning">Deep Mutational Scanning (Single-site Saturation)</option>
              <option value="Humanization Sweep">Humanization Sweep (Framework Homology Optimization)</option>
              <option value="Stability Annealing">Stability Annealing (Thermodynamic Melting Enhancement)</option>
              <option value="Affinity Maturation">Affinity Maturation (CDR3 Contact Energy Minimization)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium">Distributed Cloud Workers</label>
              <span className="font-mono text-emerald-400">{workerCount} TPU/GPU Nodes</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              step="8"
              value={workerCount}
              onChange={(e) => setWorkerCount(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div>
              <label className="text-slate-400 block text-[11px] mb-1">Target Max Kd</label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  step="0.5"
                  value={targetKdThreshold}
                  onChange={(e) => setTargetKdThreshold(Number(e.target.value))}
                  className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                />
                <span className="text-slate-400 text-xs">nM</span>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block text-[11px] mb-1">Target Min Tm</label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  step="0.5"
                  value={minTmThreshold}
                  onChange={(e) => setMinTmThreshold(Number(e.target.value))}
                  className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                />
                <span className="text-slate-400 text-xs">°C</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Deploy Pipeline</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

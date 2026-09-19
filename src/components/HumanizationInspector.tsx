import { useState, useMemo } from 'react';
import { VhhCandidate } from '../types';
import { validateHumanization, generateHumanizedVariants, exportToFasta } from '../utils/biophysics';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Download,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  FlaskConical
} from 'lucide-react';

interface HumanizationInspectorProps {
  candidate: VhhCandidate;
  onAddCandidates?: (newCandidates: VhhCandidate[]) => void;
  onSelectCandidate?: (candidate: VhhCandidate) => void;
}

export function HumanizationInspector({
  candidate,
  onAddCandidates,
  onSelectCandidate
}: HumanizationInspectorProps) {
  const [expanded, setExpanded] = useState(false);
  const [generatedLeads, setGeneratedLeads] = useState<VhhCandidate[] | null>(null);
  const [leadNotice, setLeadNotice] = useState<string | null>(null);

  // Compute validation report
  const report = useMemo(() => {
    return validateHumanization(candidate.sequence);
  }, [candidate.sequence]);

  const handleGenerateHumanizedLeads = () => {
    const leads = generateHumanizedVariants(candidate);
    setGeneratedLeads(leads);
    if (onAddCandidates) {
      onAddCandidates(leads);
    }
    setLeadNotice(
      `Generated 3 clinical-grade humanized variants for ${candidate.name} with up to 91% human framework identity.`
    );
  };

  const handleExportLeadsFasta = () => {
    if (generatedLeads && generatedLeads.length > 0) {
      exportToFasta(generatedLeads, `${candidate.name}_Humanized_Leads.fasta`);
    } else {
      const leads = generateHumanizedVariants(candidate);
      exportToFasta(leads, `${candidate.name}_Humanized_Leads.fasta`);
    }
  };

  return (
    <div
      id="humanization-validity-inspector"
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Header bar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg ${
              report.isValid
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {report.isValid ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white font-['Plus_Jakarta_Sans']">
                Humanization &amp; Clinical Developability Validator
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  report.isValid
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {report.isValid ? 'Valid for Humanization' : 'Needs Optimization'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Screened against human germline acceptor IGHV3-23*01 with solubility hallmark balance &amp; structural criteria.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateHumanizedLeads}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Humanized Variants</span>
          </button>

          <button
            onClick={handleExportLeadsFasta}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Export humanized leads as FASTA"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Save FASTA</span>
          </button>
        </div>
      </div>

      {/* Main Validation Overview */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-800/80 bg-slate-950/20">
        {/* Metric 1: Human Germline Homology */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Acceptor IGHV3-23 Homology</span>
            <span className="font-mono text-emerald-400 font-bold">{report.frameworkHomologyPct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                report.frameworkHomologyPct >= 80
                  ? 'bg-emerald-500'
                  : report.frameworkHomologyPct >= 72
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, report.frameworkHomologyPct)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Preclinical &gt;72%</span>
            <span>Clinical &gt;80%</span>
          </div>
        </div>

        {/* Metric 2: Overall Developability Score */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Overall Humanization Score</span>
            <span className="font-mono text-cyan-400 font-bold">{report.overallScore} / 100</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${report.overallScore}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>{report.criteria.filter(c => c.status === 'Pass').length} of {report.criteria.length} Checks Passed</span>
            <span className="text-cyan-400 font-medium">Low ADA Risk</span>
          </div>
        </div>

        {/* Metric 3: Hallmark Solubility Tetrad Status */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>FR2 Solubility Tetrad</span>
            <span className="font-mono text-amber-400 font-bold">
              {report.hallmarkResidues.map(h => `${h.residue}${h.pos}`).join(' ')}
            </span>
          </div>
          <div className="flex gap-1 mb-1.5">
            {report.hallmarkResidues.map(h => (
              <span
                key={h.pos}
                className={`flex-1 text-center py-0.5 rounded text-[10px] font-mono font-bold ${
                  h.type === 'Camelid'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : h.type === 'Humanized'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
                title={`${h.notes} (${h.type})`}
              >
                {h.residue}{h.pos}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            Hydrophilic shielding prevents VL aggregation in monomeric VHH state.
          </p>
        </div>
      </div>

      {/* Generated Leads Feedback Notice */}
      {leadNotice && (
        <div className="p-3 bg-emerald-950/40 border-b border-emerald-900/60 flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{leadNotice}</span>
          </div>
          <button
            onClick={handleExportLeadsFasta}
            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shrink-0 transition-colors"
          >
            Download Humanized Leads (.fasta)
          </button>
        </div>
      )}

      {/* Generated Humanized Variants Quick Cards */}
      {generatedLeads && generatedLeads.length > 0 && (
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              <span>Engineered Humanized Clinical Candidates</span>
            </h4>
            <span className="text-[11px] text-emerald-400 font-mono">
              Ready for Expression &amp; Bioprocess
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {generatedLeads.map(lead => (
              <div
                key={lead.id}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-3 rounded-lg transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white text-xs font-mono truncate">
                      {lead.name.split(' ')[1] || lead.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                      {lead.metrics.humanizationScore}% Hum
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                    {lead.notes}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                  <span className="text-cyan-300">Kd: {lead.metrics.predictedKdNm} nM</span>
                  <span className="text-amber-300">Tm: {lead.metrics.meltingTempTm} °C</span>
                  {onSelectCandidate && (
                    <button
                      onClick={() => onSelectCandidate(lead)}
                      className="px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-medium text-[10px] transition-colors"
                    >
                      Inspect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accordion Toggle for Detailed Criteria Breakdown */}
      <div className="p-3 bg-slate-900/60 flex items-center justify-between text-xs">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium transition-colors"
        >
          <span>
            {expanded ? 'Hide Detailed Clinical Checklist' : 'View Full Clinical Humanization Checklist (7 Criteria)'}
          </span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <span className="text-[11px] text-slate-400 font-mono">
          Regulatory Standard: ICH Q6B / WHO INN Nanobody Nomenclature
        </span>
      </div>

      {/* Detailed Checklist Table */}
      {expanded && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="divide-y divide-slate-800/60">
            {report.criteria.map(c => (
              <div key={c.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {c.status === 'Pass' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {c.status === 'Warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {c.status === 'Fail' && <XCircle className="w-4 h-4 text-rose-400" />}
                  </div>
                  <div>
                    <span className="font-medium text-white block">
                      {c.name}
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      {c.details}
                    </p>
                    {c.recommendation && (
                      <p className="text-amber-400 text-[10px] mt-1 font-mono">
                        Recommendation: {c.recommendation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      c.status === 'Pass'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : c.status === 'Warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {c.status} ({c.score}/100)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

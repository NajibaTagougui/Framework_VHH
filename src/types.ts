export interface SequenceRegion {
  name: 'FR1' | 'CDR1' | 'FR2' | 'CDR2' | 'FR3' | 'CDR3' | 'FR4';
  start: number; // 1-indexed
  end: number;
  sequence: string;
  isHallmark?: boolean;
  description?: string;
}

export interface LiabilitySite {
  type: 'Deamidation' | 'Isomerization' | 'Glycosylation' | 'Oxidation' | 'Unpaired Cys';
  position: number;
  motif: string;
  severity: 'Low' | 'Medium' | 'High';
  recommendation: string;
}

export interface MutationRecord {
  id: string;
  originalResidue: string;
  position: number;
  mutatedResidue: string;
  region: string;
  deltaKd: number; // change in Kd (negative is tighter binding)
  deltaTm: number; // change in Tm (positive is more stable)
  deltaExpression: number; // mg/L change
  rationale: string;
}

export interface VhhCandidate {
  id: string;
  name: string;
  target: string;
  targetDescription: string;
  libraryOrigin: 'Alpaca (Vicugna pacos)' | 'Llama (Lama glama)' | 'Camel (Camelus dromedarius)' | 'Synthetic CDR3-Shuffled';
  panningRound: number;
  enrichmentRatio: number;
  ngsReadCount: number;
  sequence: string;
  regions: SequenceRegion[];
  metrics: {
    predictedKdNm: number; // Nanomolar
    deltaGKcal: number; // kcal/mol
    meltingTempTm: number; // °C
    expressionYieldMgL: number; // mg/L in E. coli periplasm
    isoelectricPoint: number; // pI
    hydrophobicityIndex: number; // GRAVY
    humanizationScore: number; // % identity to human IGHV3-23
    developabilityScore: number; // 0 - 100
  };
  liabilities: LiabilitySite[];
  mutationsApplied: MutationRecord[];
  status: 'Wildtype' | 'Engineered' | 'Lead Candidate' | 'Batch Screened';
  notes?: string;
}

export interface CloudBatchJob {
  id: string;
  name: string;
  target: string;
  type: 'Deep Mutational Scanning' | 'Humanization Sweep' | 'Stability Annealing' | 'Affinity Maturation';
  status: 'Queued' | 'Running' | 'Completed' | 'Failed';
  progress: number; // 0 - 100
  variantsScreened: number;
  topCandidatesFound: number;
  cloudNode: string;
  startedAt: string;
  durationSec: number;
}

export interface LibraryFilterState {
  target: string;
  maxKd: number;
  minTm: number;
  minExpression: number;
  maxLiabilities: number;
  searchQuery: string;
}

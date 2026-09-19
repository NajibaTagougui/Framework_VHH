import { VhhCandidate, CloudBatchJob } from '../types';

export const INITIAL_TARGETS = [
  { id: 'EGFR', name: 'EGFR (Epidermal Growth Factor Receptor)', domain: 'Domain III Extracellular', clinicalRelevance: 'Oncology / Solid Tumors' },
  { id: 'HER2', name: 'HER2 / Neu (ErbB2)', domain: 'Subdomain I / IV', clinicalRelevance: 'Breast & Gastric Carcinoma' },
  { id: 'PD-L1', name: 'PD-L1 (CD274)', domain: 'IgV Extracellular Domain', clinicalRelevance: 'Immune Checkpoint Blockade' },
  { id: 'VEGF-A', name: 'VEGF-A (Vascular Endothelial Growth Factor)', domain: 'Receptor Binding Core', clinicalRelevance: 'Angiogenesis & Macular Degeneration' },
  { id: 'CD3e', name: 'CD3ε (T-Cell Co-Receptor)', domain: 'Epsilon Ectodomain', clinicalRelevance: 'Bispecific T-Cell Engagers' },
];

export function parseRegions(seq: string) {
  // Approximate standard IMGT / Kabat boundaries for standard 120-130 aa VHHs
  // FR1: 1-25
  // CDR1: 26-33
  // FR2: 34-50 (Camelid hallmarks: 37, 44, 45, 47)
  // CDR2: 51-58
  // FR3: 59-96 (Canonical Cys22 and Cys92)
  // CDR3: 97 - (len - 11)
  // FR4: (len - 10) to len
  const len = seq.length;
  const fr1End = 25;
  const cdr1End = Math.min(33, len);
  const fr2End = Math.min(50, len);
  const cdr2End = Math.min(58, len);
  const fr3End = Math.min(96, len);
  const cdr3End = Math.max(fr3End, len - 11);

  return [
    {
      name: 'FR1' as const,
      start: 1,
      end: fr1End,
      sequence: seq.slice(0, fr1End),
      description: 'Framework 1: Canonical N-terminal beta-sheet scaffold'
    },
    {
      name: 'CDR1' as const,
      start: fr1End + 1,
      end: cdr1End,
      sequence: seq.slice(fr1End, cdr1End),
      description: 'Complementarity Determining Region 1: Antigen interaction loop'
    },
    {
      name: 'FR2' as const,
      start: cdr1End + 1,
      end: fr2End,
      sequence: seq.slice(cdr1End, fr2End),
      isHallmark: true,
      description: 'Framework 2: Contains hallmark Camelid tetrad (Phe37, Glu44, Arg45, Gly47)'
    },
    {
      name: 'CDR2' as const,
      start: fr2End + 1,
      end: cdr2End,
      sequence: seq.slice(fr2End, cdr2End),
      description: 'Complementarity Determining Region 2: Secondary contact loop'
    },
    {
      name: 'FR3' as const,
      start: cdr2End + 1,
      end: fr3End,
      sequence: seq.slice(cdr2End, fr3End),
      description: 'Framework 3: Conserved core beta-sandwich and Cys92 disulfide anchor'
    },
    {
      name: 'CDR3' as const,
      start: fr3End + 1,
      end: cdr3End,
      sequence: seq.slice(fr3End, cdr3End),
      description: 'Complementarity Determining Region 3: Primary high-affinity hypervariable loop'
    },
    {
      name: 'FR4' as const,
      start: cdr3End + 1,
      end: len,
      sequence: seq.slice(cdr3End),
      description: 'Framework 4: Conserved C-terminal J-segment (WGQGTQVTVSS)'
    },
  ];
}

export function detectLiabilities(seq: string) {
  const liabilities: any[] = [];
  
  // Deamidation: NG, NS, NA
  const ngIdx = seq.indexOf('NG');
  if (ngIdx !== -1) {
    liabilities.push({
      type: 'Deamidation',
      position: ngIdx + 1,
      motif: 'NG',
      severity: 'High',
      recommendation: 'Mutate Asn to Gln or Gly to Ala to prevent succinimide intermediate formation'
    });
  }
  const nsIdx = seq.indexOf('NS');
  if (nsIdx !== -1) {
    liabilities.push({
      type: 'Deamidation',
      position: nsIdx + 1,
      motif: 'NS',
      severity: 'Medium',
      recommendation: 'Potential deamidation at neutral-alkaline pH. Consider Ser to Thr substitution'
    });
  }

  // Isomerization: DG, DS
  const dgIdx = seq.indexOf('DG');
  if (dgIdx !== -1) {
    liabilities.push({
      type: 'Isomerization',
      position: dgIdx + 1,
      motif: 'DG',
      severity: 'High',
      recommendation: 'High risk of iso-aspartate formation. Substitute Asp with Glu or Gly with Ala'
    });
  }

  // Glycosylation: N-X-[S|T] where X is not P
  for (let i = 0; i < seq.length - 2; i++) {
    if (seq[i] === 'N' && seq[i + 1] !== 'P' && (seq[i + 2] === 'S' || seq[i + 2] === 'T')) {
      liabilities.push({
        type: 'Glycosylation',
        position: i + 1,
        motif: seq.slice(i, i + 3),
        severity: 'High',
        recommendation: 'Canonical N-glycosylation sequon triggers unwanted heterogeneous post-translational modification'
      });
    }
  }

  // Unpaired Cysteines
  const cysIndices: number[] = [];
  for (let i = 0; i < seq.length; i++) {
    if (seq[i] === 'C') cysIndices.push(i + 1);
  }
  // VHHs normally have canonical Cys22 and Cys92, plus sometimes a pair in CDR1-CDR3
  if (cysIndices.length % 2 !== 0) {
    liabilities.push({
      type: 'Unpaired Cys',
      position: cysIndices[cysIndices.length - 1] || 1,
      motif: 'Cys',
      severity: 'High',
      recommendation: 'Odd number of cysteines risks intermolecular disulfide cross-linking & misfolding'
    });
  }

  return liabilities;
}

export const INITIAL_CANDIDATES: VhhCandidate[] = [
  {
    id: 'VHH-EGFR-7B4',
    name: 'Clone 7B4 (Lead Repertoire)',
    target: 'EGFR',
    targetDescription: 'Extracellular domain III epitope antagonist',
    libraryOrigin: 'Llama (Lama glama)',
    panningRound: 3,
    enrichmentRatio: 42.8,
    ngsReadCount: 184500,
    sequence: 'EVQLVESGGGLVQAGGSLRLSCAASGFTFDDYAIGWFRQAPGKEREGVSCISSSDGSTYYADSVKGRFTISRDNAKNTVYLQMNSLKPEDTAVYYCAAYSDYSGYYYEYDYWGQGTQVTVSS',
    regions: parseRegions('EVQLVESGGGLVQAGGSLRLSCAASGFTFDDYAIGWFRQAPGKEREGVSCISSSDGSTYYADSVKGRFTISRDNAKNTVYLQMNSLKPEDTAVYYCAAYSDYSGYYYEYDYWGQGTQVTVSS'),
    metrics: {
      predictedKdNm: 1.45,
      deltaGKcal: -12.1,
      meltingTempTm: 69.8,
      expressionYieldMgL: 112,
      isoelectricPoint: 8.35,
      hydrophobicityIndex: -0.24,
      humanizationScore: 81.6,
      developabilityScore: 86,
    },
    liabilities: detectLiabilities('EVQLVESGGGLVQAGGSLRLSCAASGFTFDDYAIGWFRQAPGKEREGVSCISSSDGSTYYADSVKGRFTISRDNAKNTVYLQMNSLKPEDTAVYYCAAYSDYSGYYYEYDYWGQGTQVTVSS'),
    mutationsApplied: [],
    status: 'Lead Candidate',
    notes: 'Isolated from immunized Llama lymph node cDNA library after 3 rounds of solid-phase magnetic bead panning. High affinity to EGFR.'
  },
  {
    id: 'VHH-HER2-2R15',
    name: 'Clone 2R15-D (Anti-HER2)',
    target: 'HER2',
    targetDescription: 'Subdomain I receptor capping binder',
    libraryOrigin: 'Alpaca (Vicugna pacos)',
    panningRound: 3,
    enrichmentRatio: 38.2,
    ngsReadCount: 142000,
    sequence: 'QVQLQESGGGLVQPGGSLRLSCAASGFTFSDYEMNWVRQAPGKGLEWVSSINWNGGGTDYADSVKGRFTISRDNAKNSLYLQMNSLRAEDTAVYYCAKSRYSGSLHYWGQGTQVTVSS',
    regions: parseRegions('QVQLQESGGGLVQPGGSLRLSCAASGFTFSDYEMNWVRQAPGKGLEWVSSINWNGGGTDYADSVKGRFTISRDNAKNSLYLQMNSLRAEDTAVYYCAKSRYSGSLHYWGQGTQVTVSS'),
    metrics: {
      predictedKdNm: 4.8,
      deltaGKcal: -11.4,
      meltingTempTm: 73.2,
      expressionYieldMgL: 145,
      isoelectricPoint: 8.72,
      hydrophobicityIndex: -0.18,
      humanizationScore: 86.4,
      developabilityScore: 91,
    },
    liabilities: detectLiabilities('QVQLQESGGGLVQPGGSLRLSCAASGFTFSDYEMNWVRQAPGKGLEWVSSINWNGGGTDYADSVKGRFTISRDNAKNSLYLQMNSLRAEDTAVYYCAKSRYSGSLHYWGQGTQVTVSS'),
    mutationsApplied: [],
    status: 'Wildtype',
    notes: 'Alpaca immunized with recombinant human HER2 ectodomain. Outstanding thermal stability above 73°C.'
  },
  {
    id: 'VHH-PDL1-KN03',
    name: 'Clone KN-03 (Immune Checkpoint)',
    target: 'PD-L1',
    targetDescription: 'IgV domain blocker inhibiting PD-1 interaction',
    libraryOrigin: 'Camel (Camelus dromedarius)',
    panningRound: 2,
    enrichmentRatio: 27.5,
    ngsReadCount: 89300,
    sequence: 'EVQLVESGGGLVQPGGSLRLSCAASGSIFSIYAMAWYRQAPGKQRELVATISSSGSTYYADSVKGRFTISRDNAKKTLYLQMNSLKPEDTAVYYCNAARYRSRYWGQGTQVTVSS',
    regions: parseRegions('EVQLVESGGGLVQPGGSLRLSCAASGSIFSIYAMAWYRQAPGKQRELVATISSSGSTYYADSVKGRFTISRDNAKKTLYLQMNSLKPEDTAVYYCNAARYRSRYWGQGTQVTVSS'),
    metrics: {
      predictedKdNm: 2.1,
      deltaGKcal: -11.8,
      meltingTempTm: 66.4,
      expressionYieldMgL: 98,
      isoelectricPoint: 8.9,
      hydrophobicityIndex: -0.15,
      humanizationScore: 83.2,
      developabilityScore: 82,
    },
    liabilities: detectLiabilities('EVQLVESGGGLVQPGGSLRLSCAASGSIFSIYAMAWYRQAPGKQRELVATISSSGSTYYADSVKGRFTISRDNAKKTLYLQMNSLKPEDTAVYYCNAARYRSRYWGQGTQVTVSS'),
    mutationsApplied: [],
    status: 'Wildtype',
    notes: 'Camel dromedary immunized clone. High on-rate kinetics, suitable candidate for thermal stability enhancement.'
  },
  {
    id: 'VHH-VEGF-V12',
    name: 'Clone VHH-V12 (Anti-Angiogenesis)',
    target: 'VEGF-A',
    targetDescription: 'VEGF-R2 binding site neutralizing paratope',
    libraryOrigin: 'Llama (Lama glama)',
    panningRound: 3,
    enrichmentRatio: 51.4,
    ngsReadCount: 231000,
    sequence: 'EVQLVESGGGLVQAGGSLRLSCAASERTFSSYAMGWFRQAPGKEREFVAAIRWNGGITYYADSVKGRFTISRDNAKNTVYLQMNSLKPEDTAVYYCAAGAGWSSYGYDYWGQGTQVTVSS',
    regions: parseRegions('EVQLVESGGGLVQAGGSLRLSCAASERTFSSYAMGWFRQAPGKEREFVAAIRWNGGITYYADSVKGRFTISRDNAKNTVYLQMNSLKPEDTAVYYCAAGAGWSSYGYDYWGQGTQVTVSS'),
    metrics: {
      predictedKdNm: 0.85,
      deltaGKcal: -12.4,
      meltingTempTm: 71.0,
      expressionYieldMgL: 130,
      isoelectricPoint: 8.1,
      hydrophobicityIndex: -0.21,
      humanizationScore: 82.0,
      developabilityScore: 88,
    },
    liabilities: detectLiabilities('EVQLVESGGGLVQAGGSLRLSCAASERTFSSYAMGWFRQAPGKEREFVAAIRWNGGITYYADSVKGRFTISRDNAKNTVYLQMNSLKPEDTAVYYCAAGAGWSSYGYDYWGQGTQVTVSS'),
    mutationsApplied: [],
    status: 'Lead Candidate',
    notes: 'Sub-nanomolar KD binder. Rich aromatic residues in CDR3 forming pi-stacking interactions with VEGF core.'
  },
  {
    id: 'VHH-CD3-TC4',
    name: 'Clone TC4-eng (Bispecific Arm)',
    target: 'CD3e',
    targetDescription: 'T-cell receptor subunit activation module',
    libraryOrigin: 'Synthetic CDR3-Shuffled',
    panningRound: 2,
    enrichmentRatio: 19.8,
    ngsReadCount: 65400,
    sequence: 'EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSSISSGGSTYYADSVKGRFTISRDNAKNSLYLQMNSLRAEDTAVYYCAKDGYYRGSFDYWGQGTQVTVSS',
    regions: parseRegions('EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSSISSGGSTYYADSVKGRFTISRDNAKNSLYLQMNSLRAEDTAVYYCAKDGYYRGSFDYWGQGTQVTVSS'),
    metrics: {
      predictedKdNm: 15.2,
      deltaGKcal: -10.6,
      meltingTempTm: 64.5,
      expressionYieldMgL: 78,
      isoelectricPoint: 7.95,
      hydrophobicityIndex: -0.28,
      humanizationScore: 89.2,
      developabilityScore: 76,
    },
    liabilities: detectLiabilities('EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSSISSGGSTYYADSVKGRFTISRDNAKNSLYLQMNSLRAEDTAVYYCAKDGYYRGSFDYWGQGTQVTVSS'),
    mutationsApplied: [],
    status: 'Wildtype',
    notes: 'Synthetic humanized VHH backbone with diversified CDR3 loop. Needs affinity maturation and stability optimization.'
  }
];

export const INITIAL_BATCH_JOBS: CloudBatchJob[] = [
  {
    id: 'JOB-9042',
    name: 'EGFR Deep Mutational Scanning (DMS-FR4)',
    target: 'EGFR',
    type: 'Deep Mutational Scanning',
    status: 'Completed',
    progress: 100,
    variantsScreened: 2400,
    topCandidatesFound: 18,
    cloudNode: 'us-central1-gcp-cluster-worker-08',
    startedAt: '12 minutes ago',
    durationSec: 142
  },
  {
    id: 'JOB-9043',
    name: 'HER2 Humanization & Thermal Stabilization',
    target: 'HER2',
    type: 'Humanization Sweep',
    status: 'Completed',
    progress: 100,
    variantsScreened: 1850,
    topCandidatesFound: 12,
    cloudNode: 'europe-west4-batch-tpu-v4-02',
    startedAt: '25 minutes ago',
    durationSec: 195
  },
  {
    id: 'JOB-9044',
    name: 'PD-L1 Affinity Maturation Iteration 3',
    target: 'PD-L1',
    type: 'Affinity Maturation',
    status: 'Running',
    progress: 68,
    variantsScreened: 1280,
    topCandidatesFound: 7,
    cloudNode: 'us-east4-gpu-a100-batch-14',
    startedAt: '3 minutes ago',
    durationSec: 88
  }
];

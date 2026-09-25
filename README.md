# Framework_VHH — VHH Generation Engine

A computational pipeline for generating, filtering, and validating **VHH (single-domain antibody)** sequences, with built-in support for framework integrity checks, CDR analysis, and structural validation via ESMFold.

---

## 📋 Overview

This project provides a complete workflow for **de novo VHH design** and **in silico verification**. It includes:

- **Sequence generation** with framework and CDR constraints
- **Automated verification** against 14+ developability rules
- **ESMFold integration** for 3D structure prediction
- **Batch screening** and reporting

The engine is designed to produce VHH candidates that are:
- Structurally stable (conserved Cys22-Cys92 disulfide bond)
- Free of common liabilities (deamidation, isomerization, oxidation sites)
- Physicochemically favorable (pI, GRAVY, humanization)
- Ready for downstream expression and affinity testing

---

## 🗂️ Repository Structure
Framework_VHH/
├── src/ # Source code (TypeScript / React)
│ ├── components/ # UI components (NanoVHH Studio)
│ ├── lib/ # Core logic (sequence generation, filtering)
│ └── ...
├── .env.example # Environment variable template
├── .gitignore # Git ignore rules
├── bun.lock # Bun lockfile (dependency pinning)
├── index.html # Entry HTML for the web interface
├── metadata.json # Project metadata
├── package.json # Project dependencies and scripts
├── server.ts # Backend server (ESMFold API integration)
├── tsconfig.json # TypeScript configuration
├── vite.config.ts # Vite build configuration
├── vhh_verifier.py # Python verification script (standalone)
└── README.md # This file

text

---

## 🚀 Features

### 1. Sequence Generation
- Generates VHH libraries with **diverse CDR3 regions**
- Enforces **framework consensus sequences** (FR1–FR4)
- Maintains the **canonical Cys22–Cys92 disulfide bridge**
- Supports **humanization** (default: 65%)

### 2. ESMFold Integration
- Calls the **ESMFold API** for 3D structure prediction
- Computes **pLDDT confidence scores** (core, CDR3 paratope)
- Validates **beta-sandwich fold integrity**
- Visualizes the **Cys22–Cys92 bridge** and **IMGT domain annotations**

### 3. Batch Screening
- Processes **thousands of sequences** in a single run
- Generates **detailed reports** (TXT + CSV)
- Flags sequences with violations or warnings
- Provides **statistical summaries** (pI distribution, CDR3 diversity, etc.)

---

## 🛠️ Installation

### Prerequisites
- **Node.js** (v18+) or **Bun** (v1.0+)
- **Python** (v3.9+) — for the standalone verifier
- **Biopython** — for sequence analysis in Python

### Setup

```bash
# Clone the repository
git clone https://github.com/NajibaTagougui/Framework_VHH.git
cd Framework_VHH

# Install JavaScript/TypeScript dependencies
bun install
# or: npm install

# (Optional) Set up Python environment for the verifier
pip install biopython

# Copy environment template
cp .env.example .env
# Edit .env and add your ESMFold API key if required
🧪 Usage
Web Interface (NanoVHH Studio)
bash
# Start the development server
bun run dev
# or: npm run dev
Then open http://localhost:5173 in your browser.

Features:

Generate VHH libraries by target (e.g., EGFR)

Run AI analysis (ESMFold API)

Export results as FASTA or CSV

Visualize 3D structures interactively

Standalone Python Verifier
bash
# Basic report to stdout
python vhh_verifier.py sequences.fasta

# Save report and CSV
python vhh_verifier.py sequences.fasta --output report.txt --csv results.csv
Example output:

text
================================================================================
VHH SEQUENCE VERIFICATION REPORT
================================================================================
Total sequences: 1000

--------------------------------------------------------------------------------
SUMMARY TABLE
--------------------------------------------------------------------------------
Rule                                                 Pass   Fail   Pass %
--------------------------------------------------------------------------------
FR1 Cysteine at pos 22                               1000      0   100.0%
FR3 Cysteine at pos 92                               1000      0   100.0%
FR2 pos 37 = Y/F                                     1000      0   100.0%
...
No isomerization in CDRs                              917     83    91.7%
pI > 8.5 or < 5.5                                     976     24    97.6%


🔬 Scientific Background
VHHs (also known as nanobodies) are single-domain antibodies derived from camelid heavy-chain-only antibodies. Their small size (~15 kDa), high stability, and deep tissue penetration make them attractive for therapeutic and diagnostic applications.


🤝 Contributing
Contributions are welcome! To contribute:

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

Areas of interest:

Additional target support (HER2, PD-L1, etc.)

Integration with other folding engines (AlphaFold 3, OmegaFold)

Enhanced CDR extraction (ANARCI, IMGT numbering)

Web UI improvements

📧 Contact
Najiba Tagougui

GitHub: @NajibaTagougui

Repository: Framework_VHH

🙏 Acknowledgments
ESMFold (Meta AI) — for protein structure prediction

Biopython — for sequence analysis utilities

IMGT — for antibody domain definitions

The VHH research community — for foundational work on nanobody engineering

📚 References
Muyldermans, S. (2013). Nanobodies: natural single-domain antibodies. Annual Review of Biochemistry.

Vincke, C., et al. (2009). General strategy to humanize a camelid single-domain antibody. Journal of Biological Chemistry.

Lin, Z., et al. (2023). Evolutionary-scale prediction of atomic-level protein structure with a language model. Science.

Last updated: September 2026

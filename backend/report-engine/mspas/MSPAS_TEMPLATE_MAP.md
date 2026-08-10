# MSPAS Template Structure Map

**Version**: 1.0
**Generated**: 2026-01-31
**Scope**: FASE MSPAS-1 Header Documentation

---

## 📊 Overview

Official MSPAS Excel template for "Formato Base de datos resultados de encuesta para Hospitales.xlsx"

- **Total Columns**: 170 (A through FN)
- **Template Header Range**: A1:AV3 (48 columns)
- **Data Range**: Starts row 4 onwards
- **Sheet Name**: "BAse completa"

---

## 🔍 Header Structure (Rows 1-3)

### Row 1: Main Categories
Merged cells containing primary section headers:
- **A1**: "No." (identifier)
- **B1**: "Nombre del Hospital" (hospital name)
- **C1-E1**: First statistical block (merged)
- **F1-H1**: Second statistical block (merged)
- **I1-K1**: Third statistical block (merged)
- **L1**: "Forma de aplicación"
- **M1-P1**: "Origen Étnico" (merged, 4 categories)
- **Q1-AP1**: "Idioma Predominante" (merged, 26 languages)
- **AQ1-AR1**: "Sexo" (merged, 2 categories)
- **AS1-AU1**: "Servicio" (merged, 3 services)
- **AV1-AX1**: "Trato y Atención Recibida" (merged) — **NOTE: Extends beyond AV in full template**

### Row 2: Sub-Categories
Secondary headers within merged cells:
- **C2-E2**: "No. De pacientes atendidos en COEX durante el período evaluado"
- **F2-H2**: "Satisfacción de Pacientes"
- **I2-K2**: "Calidad Percibida"
- **M2-P2**: Names of ethnic groups
- **Q2-AP2**: Language names
- **AQ2-AR2**: Gender labels
- **AS2-AU2**: Service types
- **AV2-AX2**: Likert scale header — **NOTE: Extends beyond AV**

### Row 3: Column Details
Specific column data types and calculation notes:
- **A3**: "1" (sequential number)
- **B3**: "Nombre" (text)
- **C3**: "C - No. De pacientes..." (numeric)
- **D3**: "D - No. Total de encuestas" (numeric)
- **E3**: "E - % de encuestas | #DIV/0!" (calculated, **formula vulnerable**)
- **F3-K3**: Similar structure with percentage calculations
- **L3**: Application method indicator
- **M3-P3**: One-hot encoded ethnic origin (binary 0/1)
- **Q3-AP3**: One-hot encoded language (binary 0/1)
- **AQ3-AR3**: One-hot encoded gender (binary 0/1)
- **AS3-AU3**: One-hot encoded service (binary 0/1)
- **AV3-AX3**: Likert response scale (one-hot) — **NOTE: Extends beyond AV in full template**

---

## 🚨 Critical Formula Issues (Rows 1-3 Only)

### Division by Zero (#DIV/0!)

**Current State**: Formula in rows 1-3 reference structure, but data rows (row 4+) have:
- **E4**: `=D4*100/C4` → produces #DIV/0! when C4=0
- **H4**: `=G4*100/F4` → produces #DIV/0! when F4=0
- **K4**: `=J4*100/I4` → produces #DIV/0! when I4=0

**Correction Required (PHASE 2+)**:
```
E4: =IF(C4=0,0,D4*100/C4)
H4: =IF(F4=0,0,G4*100/F4)
K4: =IF(I4=0,0,J4*100/I4)
```

**PHASE 1 Scope**: Header structure only (rows 1-3). Formula correction deferred to PHASE 2.

---

## 📋 Column Mapping (A-AV)

| Col | Letter | Row 1 | Row 2 | Row 3 | Type | Notes |
|-----|--------|-------|-------|-------|------|-------|
| 1 | A | No. | | 1 | identifier | Sequential number |
| 2 | B | Nombre del Hospital | | Nombre | identifier | Hospital name |
| 3 | C | No. De pacientes atendidos COEX | Período evaluado | C - No. De pacientes... | numeric | Count |
| 4 | D | | | D - No. Total de encuestas | numeric | Total surveys |
| 5 | E | | | E - % de encuestas \| #DIV/0! | calculated | Percentage (unsafe) |
| 6 | F | No. De pacientes atendidos COEX | Período evaluado | F - No. De pacientes... | numeric | Count |
| 7 | G | | | G - No. Total de encuestas | numeric | Total surveys |
| 8 | H | | | H - % de encuestas \| #DIV/0! | calculated | Percentage (unsafe) |
| 9 | I | No. De pacientes atendidos COEX | Período evaluado | I - No. De pacientes... | numeric | Count |
| 10 | J | | | J - No. Total de encuestas | numeric | Total surveys |
| 11 | K | | | K - % de encuestas \| #DIV/0! | calculated | Percentage (unsafe) |
| 12 | L | Forma en que se aplicó la encuesta | (impreso - digital) | L - Forma... | categorical | Application method |
| 13-16 | M-P | Origen Étnico | Maya / Xinca / Garífuna / Mestizo | M-P | one-hot | 4 categories |
| 17-42 | Q-AF | Idioma Predominante | 26 indigenous + foreign languages | Q-AF | one-hot | Language catalog |
| 43-44 | AG-AH | Sexo | Hombre / Mujer | AG-AH | one-hot | Gender (2 categories) |
| 45-47 | AI-AK | Servicio donde fue atendido | COEX / Emergencia / Encamamiento | AI-AK | one-hot | Service type |
| 48-50+ | AL-AV+ | Trato y Atención Recibida | Likert scales (MS/S/N/I/MI) × sections | AL-AV+ | one-hot | **Extends beyond AV** |

---

## 🎨 Formatting (To Be Documented in PHASE 1)

### Merges (Confirmed in template)
- Header sections are merged across columns for visual grouping
- Exact merge ranges: To be extracted from template file
- Formatting includes colors, borders, font styles

### Cell Properties
- Font: (TBD from template analysis)
- Colors: (TBD from template analysis)
- Borders: (TBD from template analysis)
- Alignment: (TBD from template analysis)
- Column Widths: (TBD from template analysis)
- Row Heights: (TBD from template analysis)

---

## ✅ PHASE 1 Deliverables

### Files to Generate
1. **MSPAS_TEMPLATE_MAP.md** (this document) ✅
2. **MSPAS_HEADER_SPECIFICATION.md** (detailed cell-by-cell spec)
3. **MSPAS_CELL_MAPPING.md** (complete A-AV mapping with formulas)
4. **mspas-header-generator.js** (Node.js script to generate header-only Excel)
5. **mspas-header-template.xlsx** (generated output, header only, frozen rows 1-3)

### Validation Checklist
- [ ] Official template located: ✅ `audit-artifacts/Formato Base de datos resultados de encuesta para Hospitales.xlsx`
- [ ] Header structure documented
- [ ] Column mapping complete (A-AV)
- [ ] Formula issues identified (#DIV/0!)
- [ ] Merged cells documented
- [ ] Cell formatting documented
- [ ] Generator script tested
- [ ] Output Excel file matches official template (header identical)
- [ ] Rows 1-3 frozen in generated file
- [ ] Zero data rows in generated file (rows 4+ empty)
- [ ] Zero formulas in data rows (data row formulas deferred to PHASE 2)

---

## 🚫 PHASE 1 Constraints

**Strict Scope**: Header-only (rows 1-3)
- ✅ Document structure
- ✅ Create generator script
- ✅ Produce output Excel file
- ❌ NO data entry
- ❌ NO formulas in data rows
- ❌ NO database queries
- ❌ NO business logic
- ❌ NO modifications to survey form
- ❌ NO additional rows beyond row 3

---

## 📚 References

- Official Template: `d:\UISAU\audit-artifacts\Formato Base de datos resultados de encuesta para Hospitales.xlsx`
- Specification Contract: `d:\UISAU\backend\report-engine\mspas\contract-first\FINAL_EXPORT_CONTRACT.json`
- Coverage Matrix: `d:\UISAU\backend\report-engine\mspas\contract-first\MSPAS_DATA_COVERAGE_MATRIX.csv`
- Sample Export: `d:\UISAU\audit-artifacts\reporte_2026.xlsx`

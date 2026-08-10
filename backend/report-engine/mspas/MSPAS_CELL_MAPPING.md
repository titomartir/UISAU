# MSPAS Cell Mapping (A-AV Complete)

**PHASE 1 Deliverable**
**Comprehensive A-AV Cell Reference**
**Row 1-3 Header-Only (No Data Rows)**

---

## 📌 Full A-AV Cell Dictionary

### Row 1: Primary Headers (Merges + Singles)

```
A1 (single)      = "No."
B1 (single)      = "Nombre del Hospital"
C1:E1 (merged)   = "No. De pacientes atendidos en COEX durante el período evaluado"
F1:H1 (merged)   = "Satisfacción de Pacientes"
I1:K1 (merged)   = "Calidad Percibida"
L1 (single)      = "Forma en que se aplicó la encuesta (impreso - digital)"
M1:P1 (merged)   = "Origen Étnico"
Q1:AF1 (merged)  = "Idioma Predominante"
AG1:AH1 (merged) = "Sexo"
AI1:AK1 (merged) = "Servicio donde fue atendido"
AL1:AV1 (merged) = "Trato y Atención Recibida" (extends beyond AV in full template)
```

---

### Row 2: Secondary Headers (Merges + Subtitles)

```
A2 (empty)       = —
B2 (empty)       = —
C2:E2 (merged)   = "No. De pacientes atendidos en COEX durante el período evaluado"
F2:H2 (merged)   = "Satisfacción de Pacientes"
I2:K2 (merged)   = "Calidad Percibida"
L2 (empty)       = —
M2:P2 (merged)   = (Ethnic categories: Maya, Xinca, Garífuna, Mestizo/Ladino)
Q2:AF2 (merged)  = (Language names: Achi, Akateko, ... Español, Otro)
AG2:AH2 (merged) = (Gender: Hombre, Mujer)
AI2:AK2 (merged) = (Services: COEX, Emergencia, Encamamiento)
AL2:AV2 (merged) = (Likert scale labels)
```

---

### Row 3: Individual Column Headers (All Singles)

#### Numeric & Identifier Columns

```
A3 = "1"                                (sequential number label)
B3 = "Nombre"                           (hospital name label)
```

#### Statistical Block 1 (C-E)

```
C3 = "C - No. De pacientes atendidos en COEX durante el período evaluado"
D3 = "D - No. Total de encuestas"
E3 = "E - % de encuestas | #DIV/0!"     (⚠️ formula marked as unsafe)
```

#### Statistical Block 2 (F-H)

```
F3 = "F - No. De pacientes atendidos en COEX durante el período evaluado"
G3 = "G - No. Total de encuestas"
H3 = "H - % de encuestas | #DIV/0!"     (⚠️ formula marked as unsafe)
```

#### Statistical Block 3 (I-K)

```
I3 = "I - No. De pacientes atendidos en COEX durante el período evaluado"
J3 = "J - No. Total de encuestas"
K3 = "K - % de encuestas | #DIV/0!"     (⚠️ formula marked as unsafe)
```

#### Application Method (L)

```
L3 = "L - Forma en que se aplicó la encuesta (impreso - digital)"
```

#### Ethnic Origin (M-P, One-Hot Encoded)

```
M3 = "M - Origen etnico | Origen etnico | Maya"
N3 = "N - Origen etnico | Origen etnico | Xinca"
O3 = "O - Origen etnico | Origen etnico | Garífuna"
P3 = "P - Origen etnico | Origen etnico | Mestizo/Ladino"
```

#### Languages (Q-AF, One-Hot Encoded, 26 Categories)

```
Q3  = "Q - Idioma predominante | Idioma predominante | Achi (1)"
R3  = "R - Idioma predominante | Idioma predominante | Akateko (2)"
S3  = "S - Idioma predominante | Idioma predominante | Awakateco (3)"
T3  = "T - Idioma predominante | Idioma predominante | Chalchiteko (4)"
U3  = "U - Idioma predominante | Idioma predominante | Chaltiteko (5)"
V3  = "V - Idioma predominante | Idioma predominante | Chuj (6)"
W3  = "W - Idioma predominante | Idioma predominante | Itza (7)"
X3  = "X - Idioma predominante | Idioma predominante | Ixil (8)"
Y3  = "Y - Idioma predominante | Idioma predominante | Jakalteko (9)"
Z3  = "Z - Idioma predominante | Idioma predominante | Kaqchikel (10)"
AA3 = "AA - Idioma predominante | Idioma predominante | K'iche' (11)"
AB3 = "AB - Idioma predominante | Idioma predominante | Mam (12)"
AC3 = "AC - Idioma predominante | Idioma predominante | Mopan (13)"
AD3 = "AD - Idioma predominante | Idioma predominante | Pocomam (14)"
AE3 = "AE - Idioma predominante | Idioma predominante | Poqomchi (15)"
AF3 = "AF - Idioma predominante | Idioma predominante | Q'anjob'al (16)"
AG3 = "AG - Idioma predominante | Idioma predominante | Q'eqchi' (17)"
AH3 = "AH - Idioma predominante | Idioma predominante | Sakapulteco (18)"
AI3 = "AI - Idioma predominante | Idioma predominante | Sipakapense (19)"
AJ3 = "AJ - Idioma predominante | Idioma predominante | Tektiteko (20)"
AK3 = "AK - Idioma predominante | Idioma predominante | Tz'utujil (21)"
AL3 = "AL - Idioma predominante | Idioma predominante | Uspanteko (22)"
AM3 = "AM - Idioma predominante | Idioma predominante | Xinca (23)"
AN3 = "AN - Idioma predominante | Idioma predominante | Garifuna (24)"
AO3 = "AO - Idioma predominante | Idioma predominante | Español (25)"
AP3 = "AP - Idioma predominante | Idioma predominante | Otro (idiomas extranjeros) (26)"
```

#### Gender (AG-AH, One-Hot Encoded)

```
AQ3 = "AQ - Sexo | Sexo | Hombre"
AR3 = "AR - Sexo | Sexo | Mujer"
```

#### Service Type (AS-AU, One-Hot Encoded)

```
AS3 = "AS - Servicio donde fue atendido | Servicio donde fue atendido | COEX"
AT3 = "AT - Servicio donde fue atendido | Servicio donde fue atendido | Emergencia"
AU3 = "AU - Servicio donde fue atendido | Servicio donde fue atendido | Encamamiento"
```

#### Likert Scale Start (AV, One-Hot Encoded)

```
AV3 = "AV - TRATO Y ATENCIÓN RECIBIDA | Personal Médico | MS"
```

---

## 🎨 Cell Formatting Reference (Header Rows 1-3)

### General Styling (All Header Rows)

```json
{
  "headerRowHeight": "30px (estimated, TBD)",
  "defaultFont": "Calibri 11 or Arial 11 (TBD)",
  "headerFontSize": "11pt",
  "headerFontBold": true,
  "headerFontColor": "#FFFFFF or #000000 (TBD)",
  "headerBackgroundColor": "#4472C4 or #808080 (TBD)",
  "subHeaderFontSize": "10pt",
  "subHeaderFontBold": true,
  "subHeaderBackgroundColor": "#D9E1F2 or #E2EFDA (TBD)",
  "borders": "All cells border 1 (black or gray, TBD)",
  "alignment": "Center for headers, Right for numeric columns, Left for text"
}
```

**Note**: Exact colors and font details to be extracted from official template during PHASE 1 implementation.

---

## 📊 Data Type & Calculation Reference

### Numeric Columns (Input Data)

| Column | Type | Source | Notes |
|--------|------|--------|-------|
| C | Numeric | External COEX patient count | Not currently in UISAU |
| D | Numeric | Survey count aggregation | Available from responses |
| F | Numeric | External COEX patient count | Not currently in UISAU |
| G | Numeric | Survey count aggregation | Available from responses |
| I | Numeric | External COEX patient count | Not currently in UISAU |
| J | Numeric | Survey count aggregation | Available from responses |

### Calculated Columns (Formula Cells - Row 4+ Only, NOT Row 1-3)

| Column | Current Formula | Issue | Corrected Formula (PHASE 2) |
|--------|-----------------|-------|-------------------------|
| E | `=D*100/C` | #DIV/0! when C=0 | `=IF(C=0,0,D*100/C)` |
| H | `=G*100/F` | #DIV/0! when F=0 | `=IF(F=0,0,G*100/F)` |
| K | `=J*100/I` | #DIV/0! when I=0 | `=IF(I=0,0,J*100/I)` |

**CRITICAL**: Row 1-3 contain HEADER TEXT ONLY. Data row formulas (row 4+) documented here for reference but deferred to PHASE 2.

### Categorical Columns (Enumerations)

| Column | Type | Values |
|--------|------|--------|
| L | Application method | "Impreso" \| "Digital" \| code (TBD) |

### One-Hot Encoded Columns (Binary)

| Range | Category | Values |
|-------|----------|--------|
| M:P | Ethnic origin | 0 \| 1 |
| Q:AP | Language (26 indigenous + foreign) | 0 \| 1 |
| AQ:AR | Gender | 0 \| 1 |
| AS:AU | Service | 0 \| 1 |
| AV:... | Likert responses | 0 \| 1 |

---

## 📏 Column Widths (Estimated, TBD from Template)

| Column | Width | Notes |
|--------|-------|-------|
| A | 6 | Narrow, numeric |
| B | 28 | Hospital name |
| C-K | 18 each | Numeric/calculated |
| L | 15 | Categorical |
| M-P | 12 each | One-hot |
| Q-AP | 12 each | Language one-hot (26 cols) |
| AQ-AR | 10 each | Gender one-hot |
| AS-AU | 12 each | Service one-hot |
| AV | 15 | Likert start |

---

## 🔄 Merge Configuration

### Merge Groups (Row 1)

```
[
  { range: "A1:A1", text: "No." },
  { range: "B1:B1", text: "Nombre del Hospital" },
  { range: "C1:E1", text: "No. De pacientes atendidos en COEX..." },
  { range: "F1:H1", text: "Satisfacción de Pacientes" },
  { range: "I1:K1", text: "Calidad Percibida" },
  { range: "L1:L1", text: "Forma en que se aplicó la encuesta..." },
  { range: "M1:P1", text: "Origen Étnico" },
  { range: "Q1:AF1", text: "Idioma Predominante" },
  { range: "AG1:AH1", text: "Sexo" },
  { range: "AI1:AK1", text: "Servicio donde fue atendido" },
  { range: "AL1:AV1+", text: "Trato y Atención Recibida" }
]
```

### Merge Groups (Row 2)

```
[
  { range: "C2:E2", text: "(subheader or repeat of C1)" },
  { range: "F2:H2", text: "(subheader or repeat of F1)" },
  { range: "I2:K2", text: "(subheader or repeat of I1)" },
  { range: "M2:P2", text: "(ethnic category names)" },
  { range: "Q2:AF2", text: "(language names)" },
  { range: "AG2:AH2", text: "(gender labels)" },
  { range: "AI2:AK2", text: "(service names)" },
  { range: "AL2:AV2+", text: "(likert scale labels)" }
]
```

### Row 3: All Single Cells

No merges in row 3; each column has distinct header text.

---

## ✅ PHASE 1 Implementation Checklist

- [ ] Extract exact cell values from official template (A1:AV3)
- [ ] Document exact merge ranges (verify row 1-2)
- [ ] Extract font properties (name, size, bold, color, background)
- [ ] Extract border properties (style, color, width)
- [ ] Extract column widths (pixels or Excel units)
- [ ] Extract cell alignment (left/center/right/top/middle/bottom)
- [ ] Verify one-hot encoding structure (Q:AP = 26 languages, confirmed)
- [ ] Identify any additional row-2 content (subtitles or repeats)
- [ ] Document exact numeric values (D*100/C formula representation)
- [ ] Confirm #DIV/0! warning in E3, H3, K3

---

## 🚫 PHASE 1 Boundaries

**IN SCOPE**:
- ✅ Header rows 1-3 structure
- ✅ Cell values and formatting
- ✅ Merge ranges
- ✅ Column widths and alignment
- ✅ Font and color styles

**OUT OF SCOPE** (Deferred to PHASE 2):
- ❌ Data rows (row 4+)
- ❌ Row 4 formula implementation
- ❌ Calculating actual values (C/D/F/G/I/J numeric data)
- ❌ Database queries
- ❌ Survey response aggregation
- ❌ One-hot encoding logic (data transformation)
- ❌ Likert response mapping
- ❌ Full template range beyond AV

---

## 📂 Deliverables

1. ✅ `MSPAS_TEMPLATE_MAP.md` — Overview
2. ✅ `MSPAS_HEADER_SPECIFICATION.md` — Detailed header spec
3. ✅ `MSPAS_CELL_MAPPING.md` — Complete A-AV reference (this file)
4. 🔄 `mspas-header-generator.js` — Node.js script
5. 🔄 `mspas-header-template.xlsx` — Generated output

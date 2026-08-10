# MSPAS Header Specification (Rows 1-3 Detailed)

**PHASE 1 Deliverable**
**Scope**: Header Structure Only
**Status**: Documentation-Only (Zero Data, Zero Formulas)

---

## 📋 Complete Cell Mapping: A1 → AV3

### COLUMN A: Sequential Identifier

| Cell | Content | Type | Merge | Style |
|------|---------|------|-------|-------|
| **A1** | "No." | text | Single (A1:A1) | Header |
| **A2** | — | empty | Part of A1 | Header |
| **A3** | "1" | text | Single (A3:A3) | SubHeader |

**Purpose**: Column label for row number
**Data Type**: Numeric identifier (integer)
**Width**: ~6 characters (narrow)
**Alignment**: Center
**Formatting**: Bold, white background

---

### COLUMN B: Hospital Name

| Cell | Content | Type | Merge | Style |
|------|---------|------|-------|-------|
| **B1** | "Nombre del Hospital" | text | Single | Header |
| **B2** | — | empty | Single | Header |
| **B3** | "Nombre" | text | Single | SubHeader |

**Purpose**: Hospital identifier
**Data Type**: Text string
**Width**: ~30 characters
**Alignment**: Left
**Formatting**: Bold, light background

---

### COLUMNS C-E: First Statistical Block (Merged)

**Merged Range**: C1:E1 → "No. De pacientes atendidos en COEX durante el período evaluado"

| Cell | Content | Type | Merge | Style |
|------|---------|------|-------|-------|
| **C1** | (start of merge) | merge parent | C1:E1 | Header |
| **D1** | (merged) | text | C1:E1 | Header |
| **E1** | (merged) | text | C1:E1 | Header |
| **C2** | (merged) | text | C2:E2 | SubHeader1 |
| **D2** | (merged) | text | C2:E2 | SubHeader1 |
| **E2** | (merged) | text | C2:E2 | SubHeader1 |
| **C3** | "C - No. De pacientes atendidos en COEX..." | text | Single | SubHeader2 |
| **D3** | "D - No. Total de encuestas" | text | Single | SubHeader2 |
| **E3** | "E - % de encuestas \| #DIV/0!" | text | Single | SubHeader2 |

**Parent Header Text** (C1:E1 merged):
```
No. De pacientes atendidos en COEX durante el período evaluado
```

**Sub-Header Text** (C2:E2 merged):
```
(Same as C1:E1 or empty, depends on template)
```

**Individual Column Headers** (Row 3):
- **C3**: "C - No. De pacientes atendidos en COEX durante el período evaluado"
- **D3**: "D - No. Total de encuestas"
- **E3**: "E - % de encuestas | #DIV/0!" (marks unsafe formula)

**Data Types**:
- **C**: Numeric (patient count from external COEX data)
- **D**: Numeric (aggregated survey count)
- **E**: Calculated (percentage: D*100/C, **currently unsafe**, produces #DIV/0!)

**Width**: C=20, D=18, E=18
**Alignment**: Right (numeric)
**Formatting**: Light gray background, borders

**🚨 PHASE 1 Note**: Row 3 headers only. Formula correction (IF guard) deferred to PHASE 2.

---

### COLUMNS F-H: Second Statistical Block (Merged)

**Merged Range**: F1:H1 → "Satisfacción de Pacientes"

| Cell | Content | Type | Merge |
|------|---------|------|-------|
| **F1** | (start) | merge | F1:H1 |
| **G1** | (merged) | text | F1:H1 |
| **H1** | (merged) | text | F1:H1 |
| **F2** | (merged) | text | F2:H2 |
| **G2** | (merged) | text | F2:H2 |
| **H2** | (merged) | text | F2:H2 |
| **F3** | "F - No. De pacientes..." | text | Single |
| **G3** | "G - No. Total de encuestas" | text | Single |
| **H3** | "H - % de encuestas \| #DIV/0!" | text | Single |

**Parent Header**: "Satisfacción de Pacientes"
**Data Types**: F=numeric, G=numeric, H=calculated (unsafe)
**Width**: F=20, G=18, H=18

---

### COLUMNS I-K: Third Statistical Block (Merged)

**Merged Range**: I1:K1 → "Calidad Percibida"

| Cell | Content | Type | Merge |
|------|---------|------|-------|
| **I1** | (start) | merge | I1:K1 |
| **J1** | (merged) | text | I1:K1 |
| **K1** | (merged) | text | I1:K1 |
| **I2** | (merged) | text | I2:K2 |
| **J2** | (merged) | text | I2:K2 |
| **K2** | (merged) | text | I2:K2 |
| **I3** | "I - No. De pacientes..." | text | Single |
| **J3** | "J - No. Total de encuestas" | text | Single |
| **K3** | "K - % de encuestas \| #DIV/0!" | text | Single |

**Parent Header**: "Calidad Percibida"
**Data Types**: I=numeric, J=numeric, K=calculated (unsafe)

---

### COLUMN L: Application Method

| Cell | Content | Type | Merge |
|------|---------|------|-------|
| **L1** | "Forma en que se aplicó la encuesta (impreso - digital)" | text | Single |
| **L2** | — | empty | Single |
| **L3** | "L - Forma..." | text | Single |

**Purpose**: Indicator of survey delivery method
**Data Type**: Categorical (code or text)
**Width**: ~15 characters
**Alignment**: Center

---

### COLUMNS M-P: Ethnic Origin (Merged M1:P1)

**Merged Range**: M1:P1 → "Origen Étnico"

| Cell | Content | Row2 | Row3 |
|------|---------|------|------|
| **M1** | (merge parent) | — | M3: "M - Origen etnico \| Maya" |
| **N1** | (merged) | — | N3: "N - Origen etnico \| Xinca" |
| **O1** | (merged) | — | O3: "O - Origen etnico \| Garífuna" |
| **P1** | (merged) | — | P3: "P - Origen etnico \| Mestizo/Ladino" |

**Parent Header** (M1:P1 merged): "Origen Étnico"
**Data Type**: One-hot encoded (binary 0/1 per category)
**Categories**:
1. Maya
2. Xinca
3. Garífuna
4. Mestizo/Ladino

**Note**: Catalog includes "Otro" but MSPAS template provides only 4 dedicated columns; "Otro" handling deferred to PHASE 2.

---

### COLUMNS Q-AF: Languages (Merged Q1:AF1)

**Merged Range**: Q1:AF1 → "Idioma Predominante"

**26 Languages** (one-hot encoded, one column per language):

| # | Column | Row 3 Header | Language |
|---|--------|--------------|----------|
| 1 | Q | Q3 | Achi (1) |
| 2 | R | R3 | Akateko (2) |
| 3 | S | S3 | Awakateco (3) |
| 4 | T | T3 | Chalchiteko (4) |
| 5 | U | U3 | Chaltiteko (5) |
| 6 | V | V3 | Chuj (6) |
| 7 | W | W3 | Itza (7) |
| 8 | X | X3 | Ixil (8) |
| 9 | Y | Y3 | Jakalteko (9) |
| 10 | Z | Z3 | Kaqchikel (10) |
| 11 | AA | AA3 | K'iche' (11) |
| 12 | AB | AB3 | Mam (12) |
| 13 | AC | AC3 | Mopan (13) |
| 14 | AD | AD3 | Pocomam (14) |
| 15 | AE | AE3 | Poqomchi (15) |
| 16 | AF | AF3 | Q'anjob'al (16) |
| 17 | AG | AG3 | Q'eqchi' (17) |
| 18 | AH | AH3 | Sakapulteco (18) |
| 19 | AI | AI3 | Sipakapense (19) |
| 20 | AJ | AJ3 | Tektiteko (20) |
| 21 | AK | AK3 | Tz'utujil (21) |
| 22 | AL | AL3 | Uspanteko (22) |
| 23 | AM | AM3 | Xinca (23) |
| 24 | AN | AN3 | Garifuna (24) |
| 25 | AO | AO3 | Español (25) |
| 26 | AP | AP3 | Otro (idiomas extranjeros) (26) |

**Note**: Column scope extends to AP (not visible in A-AV range shown in map, but documented for completeness)

---

### COLUMNS AQ-AR: Gender (Merged AQ1:AR1)

**Merged Range**: AQ1:AR1 → "Sexo"

| Cell | Content | Type |
|------|---------|------|
| **AQ1** | (merge parent) | Sexo |
| **AR1** | (merged) | Sexo |
| **AQ3** | "AQ - Sexo \| Hombre" | one-hot |
| **AR3** | "AR - Sexo \| Mujer" | one-hot |

**Categories**:
1. Hombre (Male)
2. Mujer (Female)

**Note**: "Otro" category exists in form but MSPAS has no dedicated column; mapping deferred to PHASE 2.

---

### COLUMNS AS-AU: Service Type (Merged AS1:AU1)

**Merged Range**: AS1:AU1 → "Servicio donde fue atendido"

| Cell | Content | Type |
|------|---------|------|
| **AS1** | (merge parent) | Service |
| **AT1** | (merged) | Service |
| **AU1** | (merged) | Service |
| **AS3** | "AS - Servicio \| COEX" | one-hot |
| **AT3** | "AT - Servicio \| Emergencia" | one-hot |
| **AU3** | "AU - Servicio \| Encamamiento" | one-hot |

**Categories**:
1. COEX (Consultorio Externo)
2. Emergencia
3. Encamamiento

---

### COLUMN AV: Likert Scale (Start of Multi-Column Section)

**Note**: "Trato y Atención Recibida" extends beyond AV. Full Likert section documented separately.

| Cell | Content |
|------|---------|
| **AV1** | (start of merged section) |
| **AV3** | "AV - TRATO Y ATENCIÓN RECIBIDA \| Personal Médico \| MS" |

**Data Type**: One-hot encoded Likert response
**Scale**: MS (Muy Satisfecho) / S (Satisfecho) / N (Neutral) / I (Insatisfecho) / MI (Muy Insatisfecho)

---

## 🎯 Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Columns (A-AV)** | 48 |
| **Merged Cell Groups** | ~10 |
| **One-Hot Encoded Columns** | ~40 (ethnic, language, gender, service, likert) |
| **Numeric Columns** | ~6 (C, D, F, G, I, J) |
| **Calculated Columns (Data Rows)** | 3 (E, H, K) — currently unsafe, marked with #DIV/0! |
| **Categorical Columns** | 1 (L - application method) |

---

## ✅ Validation Checklist for PHASE 1

- [ ] A1:AV3 structure documented
- [ ] All merge ranges identified
- [ ] All Row 3 headers extracted
- [ ] One-hot encoding confirmed for 26 languages
- [ ] Formula issues flagged (#DIV/0! in E, H, K)
- [ ] Column widths documented
- [ ] Cell alignments documented
- [ ] Font/color styles identified
- [ ] Border styles identified

---

## 🚫 Deferred to PHASE 2

1. **Formula Guard**: Wrap E/H/K formulas with IF(denominator=0,0,formula)
2. **Language "Otro" Handling**: Define mapping for "Otro" category (currently no column)
3. **Gender "Otro" Handling**: Define mapping for "Otro" category (currently no column)
4. **Service Extensions**: Verify if "Otro servicio" exists in full template
5. **Data Row Formulas**: Implement row 4+ formulas after header validation
6. **Likert Section Full Mapping**: Document complete "Trato y Atención Recibida" section (may extend beyond AV)

---

## 📂 Files Generated

- ✅ `MSPAS_TEMPLATE_MAP.md` (overview)
- ✅ `MSPAS_HEADER_SPECIFICATION.md` (this file, detailed)
- 🔄 `MSPAS_CELL_MAPPING.md` (to be generated)
- 🔄 `mspas-header-generator.js` (to be generated)
- 🔄 `mspas-header-template.xlsx` (to be generated)

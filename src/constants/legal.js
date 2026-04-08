// src/constants/legal.js
// Year-dependent legal constants for No Me Chinguen
// Updated annually — see source citations for each value
// ═══════════════════════════════════════

// Display year for UI strings
// Update: Every January when new SM/UMA are published
export const LEGAL_YEAR = 2026;

// Salario Minimo General 2026
// Source: CONASAMI — DOF 09/12/2025 — effective 01/01/2026
export const SALARIO_MINIMO_DIARIO = 315.04;

// UMA 2026 (Unidad de Medida y Actualizacion)
// Source: INEGI — DOF 09/01/2026 — effective 01/02/2026
// Note: Jan 2026 used 2025 value ($113.14); from Feb 2026 onward: $117.31
export const UMA_DIARIO = 117.31;
export const UMA_DIARIO_2025 = 113.14;

// Prima de antiguedad tope (Art. 162 LFT)
// IMPORTANT: Cap = 2 x Salario Minimo General diario — NOT UMA
// Source: Art. 162 LFT, verified against 2026 SM
export const PRIMA_ANTIGUEDAD_TOPE = SALARIO_MINIMO_DIARIO * 2; // 630.08

// Aguinaldo minimum (Art. 87 LFT)
export const AGUINALDO_DIAS = 15;

// Prima vacacional minimum (Art. 80 LFT — 25% of vacation pay)
export const PRIMA_VACACIONAL_PCT = 0.25;

// Prima dominical (Art. 71 LFT — 25% of one day's salary per Sunday worked)
export const PRIMA_DOMINICAL_PCT = 0.25;

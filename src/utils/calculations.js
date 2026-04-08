// src/utils/calculations.js
// Pure calculation functions for compensation calculator
// Legal basis: LFT ultima reforma DOF 15/01/2026, LSS Art. 27
// ═══════════════════════════════════════

import {
  AGUINALDO_DIAS,
  PRIMA_VACACIONAL_PCT,
  PRIMA_DOMINICAL_PCT,
  PRIMA_ANTIGUEDAD_TOPE,
} from '../constants/legal.js'

// ── toSalarioDia ──
// Convert any pay frequency to daily rate per Art. 89 LFT
// Art. 89: "cuando el salario se fije por semana o por mes, se dividirá
//           entre siete o entre treinta, respectivamente"
export function toSalarioDia(amount, frequency) {
  const n = parseFloat(amount) || 0
  switch (frequency) {
    case 'diario':    return n
    case 'semanal':   return n / 7
    case 'quincenal': return n / 15
    case 'mensual':   return n / 30  // Art. 89 LFT — divide by 30, NOT 30.4167
    default:          return n
  }
}

// ── getVacationDays ──
// Vacation days by completed years per Art. 76 LFT, reforma 2023
// (DOF 27/12/2022, vigente 01/01/2023)
export function getVacationDays(completedYears) {
  if (completedYears <= 1)  return 12
  if (completedYears <= 5)  return 10 + completedYears * 2  // 14, 16, 18, 20
  if (completedYears <= 10) return 22
  if (completedYears <= 15) return 24
  if (completedYears <= 20) return 26
  if (completedYears <= 25) return 28
  if (completedYears <= 30) return 30
  return 32  // 31+ years
}

// ── calcSeniority ──
// Compute seniority from start month + year input.
// Returns { totalMonths, completedYears, daysInCurrentYear, daysInSeniorityYear }
// or null if inputs are empty, invalid, or in the future.
export function calcSeniority(startMonth, startYear) {
  const m = parseInt(startMonth, 10)
  const y = parseInt(startYear, 10)

  if (!startMonth && startMonth !== 0) return null
  if (!startYear && startYear !== 0) return null
  if (isNaN(m) || isNaN(y)) return null

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1  // 1-12

  const totalMonths = (currentYear - y) * 12 + (currentMonth - m)

  if (totalMonths < 0) return null  // future date

  const completedYears = Math.floor(totalMonths / 12)
  // Months since January 1 of current calendar year
  const monthsSinceJanThisYear = (currentMonth - 1)  // 0 in January, 11 in December
  const daysInCurrentYear = monthsSinceJanThisYear * 30
  // Months in the current seniority year (since last anniversary)
  const monthsInSeniorityYear = totalMonths % 12
  const daysInSeniorityYear = monthsInSeniorityYear * 30

  return { totalMonths, completedYears, daysInCurrentYear, daysInSeniorityYear }
}

// ── calcSDI ──
// Salario Diario Integrado for IMSS base calculation
// Legal basis: LSS Art. 27, LFT Art. 84
// factorIntegracion = 1 + (AGUINALDO_DIAS/365) + (vacDays * PRIMA_VACACIONAL_PCT / 365)
export function calcSDI(salarioDia, completedYears) {
  const sd = parseFloat(salarioDia) || 0
  const vacDays = getVacationDays(completedYears)
  const fi = 1 + AGUINALDO_DIAS / 365 + (vacDays * PRIMA_VACACIONAL_PCT / 365)
  const sdi = sd * fi
  return { sdi, fi, vacDays }
}

// ── calcPrestaciones ──
// Annual statutory benefits entitlement
// Includes: aguinaldo (Art. 87), vacaciones + prima vacacional (Art. 76+80),
//           prima dominical (Art. 71, gated), SDI (LSS Art. 27)
export function calcPrestaciones(salarioDia, seniority, trabajaDomingos) {
  const sd = parseFloat(salarioDia) || 0
  const { completedYears } = seniority
  const vacDays = getVacationDays(completedYears)

  const aguinaldo = sd * AGUINALDO_DIAS                           // Art. 87
  const vacPago = sd * vacDays                                    // Art. 76
  const primaVac = vacPago * PRIMA_VACACIONAL_PCT                 // Art. 80
  const primaDom = trabajaDomingos
    ? sd * PRIMA_DOMINICAL_PCT * 52                               // Art. 71, 52 Sundays/year
    : 0
  const fi = 1 + AGUINALDO_DIAS / 365 + (vacDays * PRIMA_VACACIONAL_PCT / 365)
  const sdi = sd * fi

  return {
    aguinaldo,
    vacDays,
    vacPago,
    primaVac,
    primaDom,
    sdi,
    fi,
    subtotal: aguinaldo + vacPago + primaVac + primaDom,
  }
}

// ── calcFiniquito ──
// Proportional amounts due when worker resigns (renuncia voluntaria)
// Legal basis: Art. 79 (vac prop), Art. 87 (aguinaldo prop), Art. 80 (prima vac prop),
//              Art. 162 (prima antiguedad — only with 15+ completed years on voluntary exit)
export function calcFiniquito(salarioDia, seniority) {
  const sd = parseFloat(salarioDia) || 0
  const { completedYears, daysInCurrentYear, daysInSeniorityYear } = seniority
  const vacDays = getVacationDays(completedYears)

  // Aguinaldo proportional: based on days worked in calendar year since Jan 1
  const aguinaldoProp = sd * AGUINALDO_DIAS * (daysInCurrentYear / 365)

  // Vacation proportional: based on months in current seniority year (since last anniversary)
  // Use months/12 ratio. On exact anniversary (0 months), use full year from completed period
  const monthsInSeniorityYear = daysInSeniorityYear / 30
  const vacRatio = monthsInSeniorityYear === 0 && completedYears > 0 ? 1 : monthsInSeniorityYear / 12
  const effectiveVacDays = monthsInSeniorityYear === 0 && completedYears > 0 ? getVacationDays(completedYears) : vacDays
  const vacProp = sd * effectiveVacDays * vacRatio
  const primaVacProp = vacProp * PRIMA_VACACIONAL_PCT

  // Prima antiguedad: only for voluntary resignation with 15+ completed years (Art. 162)
  const primaAnt = completedYears >= 15
    ? Math.min(sd, PRIMA_ANTIGUEDAD_TOPE) * 12 * completedYears
    : 0

  const total = aguinaldoProp + vacProp + primaVacProp + primaAnt

  return { aguinaldoProp, vacProp, primaVacProp, primaAnt, total }
}

// ── calcLiquidacion ──
// Severance components for unjustified dismissal (despido injustificado)
// Legal basis: Art. 48 (3 meses), Art. 50 (20 dias/anio), Art. 162 (prima antiguedad)
// Note: prima antiguedad applies from year 1 on dismissal (no 15-year threshold)
export function calcLiquidacion(salarioDia, seniority) {
  const sd = parseFloat(salarioDia) || 0
  const { completedYears } = seniority

  const t3 = sd * 90                                             // Art. 48 — 3 meses = 90 dias
  const v20 = sd * 20 * completedYears                          // Art. 50 — 20 dias/anio
  const primaAnt = Math.min(sd, PRIMA_ANTIGUEDAD_TOPE) * 12 * completedYears  // Art. 162

  return { t3, v20, primaAnt, total: t3 + v20 + primaAnt }
}

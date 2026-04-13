// src/utils/calculations.test.js
// Unit tests for all compensation calculation functions
// Legal basis: LFT ultima reforma DOF 15/01/2026
// ═══════════════════════════════════════

import { describe, it, expect } from 'vitest'
import {
  toSalarioDia,
  calcSeniority,
  getVacationDays,
  calcSDI,
  calcPrestaciones,
  calcFiniquito,
  calcLiquidacion,
  calcInfonavitCredit,
  calcComparacion,
} from './calculations.js'

// ── toSalarioDia ──
describe('toSalarioDia', () => {
  it('semanal: divides by 7 per Art. 89', () => {
    expect(toSalarioDia(3000, 'semanal')).toBeCloseTo(3000 / 7)
  })
  it('quincenal: divides by 15 per Art. 89', () => {
    expect(toSalarioDia(9000, 'quincenal')).toBeCloseTo(9000 / 15)
  })
  it('mensual: divides by 30 per Art. 89 (NOT 30.4167)', () => {
    expect(toSalarioDia(12000, 'mensual')).toBeCloseTo(12000 / 30)
  })
  it('diario: returns value as-is', () => {
    expect(toSalarioDia(400, 'diario')).toBe(400)
  })
  it('invalid string input returns 0', () => {
    expect(toSalarioDia('abc', 'mensual')).toBe(0)
  })
  it('empty string input returns 0', () => {
    expect(toSalarioDia('', 'diario')).toBe(0)
  })
})

// ── getVacationDays ──
describe('getVacationDays', () => {
  it('0 years returns 12 (first-year base)', () => {
    expect(getVacationDays(0)).toBe(12)
  })
  it('1 year returns 12', () => {
    expect(getVacationDays(1)).toBe(12)
  })
  it('2 years returns 14', () => {
    expect(getVacationDays(2)).toBe(14)
  })
  it('3 years returns 16', () => {
    expect(getVacationDays(3)).toBe(16)
  })
  it('4 years returns 18', () => {
    expect(getVacationDays(4)).toBe(18)
  })
  it('5 years returns 20', () => {
    expect(getVacationDays(5)).toBe(20)
  })
  it('6 years returns 22', () => {
    expect(getVacationDays(6)).toBe(22)
  })
  it('10 years returns 22', () => {
    expect(getVacationDays(10)).toBe(22)
  })
  it('11 years returns 24', () => {
    expect(getVacationDays(11)).toBe(24)
  })
  it('15 years returns 24', () => {
    expect(getVacationDays(15)).toBe(24)
  })
  it('16 years returns 26', () => {
    expect(getVacationDays(16)).toBe(26)
  })
  it('31 years returns 32', () => {
    expect(getVacationDays(31)).toBe(32)
  })
})

// ── calcSeniority ──
describe('calcSeniority', () => {
  it('April 2024 start gives completedYears=2 and totalMonths=24 when today is April 2026', () => {
    // Mock: today = April 2026 (month=4, year=2026)
    // startMonth=4, startYear=2024 => totalMonths = (2026-2024)*12 + (4-4) = 24
    const result = calcSeniority(4, 2024)
    // This test depends on actual current date being April 2026
    // totalMonths should be >= 24 (we are in April 2026 per project context)
    expect(result).not.toBeNull()
    expect(result.completedYears).toBe(2)
    expect(result.totalMonths).toBe(24)
  })
  it('current month start returns completedYears=0 and totalMonths=0', () => {
    const now = new Date()
    const result = calcSeniority(now.getMonth() + 1, now.getFullYear())
    expect(result).not.toBeNull()
    expect(result.completedYears).toBe(0)
    expect(result.totalMonths).toBe(0)
  })
  it('empty strings return null', () => {
    expect(calcSeniority('', '')).toBeNull()
  })
  it('future date returns null', () => {
    expect(calcSeniority(1, 2030)).toBeNull()
  })
})

// ── calcSDI ──
describe('calcSDI', () => {
  it('1 completed year (12 vac days): factor = 1 + 15/365 + (12*0.25/365)', () => {
    const result = calcSDI(400, 1)
    const expectedFi = 1 + 15 / 365 + (12 * 0.25 / 365)
    expect(result.fi).toBeCloseTo(expectedFi, 6)
    expect(result.sdi).toBeCloseTo(400 * expectedFi, 4)
    expect(result.vacDays).toBe(12)
  })
  it('5 completed years (20 vac days): factor = 1 + 15/365 + (20*0.25/365)', () => {
    const result = calcSDI(400, 5)
    const expectedFi = 1 + 15 / 365 + (20 * 0.25 / 365)
    expect(result.fi).toBeCloseTo(expectedFi, 6)
    expect(result.sdi).toBeCloseTo(400 * expectedFi, 4)
    expect(result.vacDays).toBe(20)
  })
})

// ── calcPrestaciones ──
describe('calcPrestaciones', () => {
  it('3 years seniority, no domingos: correct aguinaldo, vacaciones, prima, subtotal', () => {
    const seniority = { completedYears: 3, totalMonths: 36, daysInCurrentYear: 0, daysInSeniorityYear: 0 }
    const result = calcPrestaciones(400, seniority, false)
    expect(result.aguinaldo).toBeCloseTo(400 * 15)         // 6000
    expect(result.vacDays).toBe(16)
    expect(result.vacPago).toBeCloseTo(400 * 16)           // 6400
    expect(result.primaVac).toBeCloseTo(6400 * 0.25)       // 1600
    expect(result.primaDom).toBe(0)
    expect(result.subtotal).toBeCloseTo(6000 + 6400 + 1600) // 14000
  })
  it('trabajaDomingos=true adds 52-Sunday prima dominical', () => {
    const seniority = { completedYears: 3, totalMonths: 36, daysInCurrentYear: 0, daysInSeniorityYear: 0 }
    const result = calcPrestaciones(400, seniority, true)
    expect(result.primaDom).toBeCloseTo(400 * 0.25 * 52)   // 5200
  })
})

// ── calcFiniquito ──
describe('calcFiniquito', () => {
  it('3 years, 90 days worked in year/seniority year: proportional amounts correct', () => {
    const seniority = {
      completedYears: 3,
      totalMonths: 36,
      daysInCurrentYear: 90,
      daysInSeniorityYear: 90,
    }
    const result = calcFiniquito(400, seniority)
    const expectedAguinaldoProp = 400 * 15 * (90 / 365)
    const vacDays = 16  // getVacationDays(3) for next year
    const monthsInSeniorityYear = 90 / 30  // 3 months
    const expectedVacProp = 400 * vacDays * (monthsInSeniorityYear / 12)
    const expectedPrimaVacProp = expectedVacProp * 0.25
    expect(result.aguinaldoProp).toBeCloseTo(expectedAguinaldoProp, 2)
    expect(result.vacProp).toBeCloseTo(expectedVacProp, 2)
    expect(result.primaVacProp).toBeCloseTo(expectedPrimaVacProp, 2)
    expect(result.primaAnt).toBe(0)  // < 15 years — no prima antiguedad on renuncia
  })
  it('16 years seniority: primaAnt applies (min(salarioDia, tope) * 12 * years)', () => {
    const seniority = {
      completedYears: 16,
      totalMonths: 192,
      daysInCurrentYear: 90,
      daysInSeniorityYear: 90,
    }
    // salarioDia=400 < PRIMA_ANTIGUEDAD_TOPE (630.08) => use 400
    const result = calcFiniquito(400, seniority)
    expect(result.primaAnt).toBeCloseTo(400 * 12 * 16, 2) // 76800
  })
})

// ── calcLiquidacion ──
describe('calcLiquidacion', () => {
  it('3 years, salarioDia=400: t3=36000, v20=24000, primaAnt=14400, total=74400', () => {
    const seniority = { completedYears: 3, totalMonths: 36, daysInCurrentYear: 0, daysInSeniorityYear: 0 }
    const result = calcLiquidacion(400, seniority)
    expect(result.t3).toBeCloseTo(400 * 90)       // 36000
    expect(result.v20).toBeCloseTo(400 * 20 * 3)  // 24000
    expect(result.primaAnt).toBeCloseTo(400 * 12 * 3) // 14400
    expect(result.total).toBeCloseTo(36000 + 24000 + 14400) // 74400
  })
  it('salarioDia=800 (exceeds tope 630.08): primaAnt uses 630.08', () => {
    const seniority = { completedYears: 3, totalMonths: 36, daysInCurrentYear: 0, daysInSeniorityYear: 0 }
    const result = calcLiquidacion(800, seniority)
    const expectedPrimaAnt = 630.08 * 12 * 3
    expect(result.primaAnt).toBeCloseTo(expectedPrimaAnt, 2)
  })
})

// ── calcInfonavitCredit ──
// Legal basis: Ley del Infonavit Art. 29-II — patron contributes 5% of SDI annually
describe('calcInfonavitCredit', () => {
  it('returns 0 when completedYears is 0', () => {
    expect(calcInfonavitCredit(500, 0)).toBe(0)
  })
  it('returns 0 when completedYears is negative', () => {
    expect(calcInfonavitCredit(500, -1)).toBe(0)
  })
  it('salarioDia=500, completedYears=5: accumulated = SDI * 365 * 0.05 * 5', () => {
    // SDI for 500, 5 years: vacDays=20, fi = 1 + 15/365 + (20*0.25/365)
    const fi = 1 + 15 / 365 + (20 * 0.25 / 365)
    const sdi = 500 * fi
    const expected = sdi * 365 * 0.05 * 5
    expect(calcInfonavitCredit(500, 5)).toBeCloseTo(expected, 2)
  })
  it('salarioDia=315.04, completedYears=1: positive number', () => {
    const result = calcInfonavitCredit(315.04, 1)
    expect(result).toBeGreaterThan(0)
  })
  it('invalid string input for salary returns 0 (0 years guard)', () => {
    // With completedYears=0, always returns 0 regardless of salary
    expect(calcInfonavitCredit('abc', 0)).toBe(0)
  })
  it('result is proportional to completedYears (linear model)', () => {
    const one = calcInfonavitCredit(500, 1)
    const five = calcInfonavitCredit(500, 5)
    // Not exact 5x because SDI also depends on years (vacation days change)
    // But for years 2-5 vacDays=20 (same), so 5yr should be > 1yr
    expect(five).toBeGreaterThan(one)
  })
})

// ── calcComparacion ──
// Verifies comparison of real vs registered salary across all six concepts
describe('calcComparacion', () => {
  const seniority3 = { completedYears: 3, totalMonths: 36, daysInCurrentYear: 0, daysInSeniorityYear: 0 }

  it('aguinaldo real = 500 * 15 = 7500', () => {
    const result = calcComparacion(500, 315.04, seniority3)
    expect(result.real.aguinaldo).toBeCloseTo(500 * 15)  // 7500
  })

  it('aguinaldo registrado = 315.04 * 15 = 4725.60', () => {
    const result = calcComparacion(500, 315.04, seniority3)
    expect(result.registrado.aguinaldo).toBeCloseTo(315.04 * 15, 2)  // 4725.60
  })

  it('diferencia.aguinaldo = 7500 - 4725.60 = 2774.40', () => {
    const result = calcComparacion(500, 315.04, seniority3)
    expect(result.diferencia.aguinaldo).toBeCloseTo(500 * 15 - 315.04 * 15, 2)  // 2774.40
  })

  it('returns all six concepts in real and registrado objects', () => {
    const result = calcComparacion(500, 315.04, seniority3)
    const fields = ['aguinaldo', 'vacPago', 'primaVac', 'liq3meses', 'liq20dias', 'primaAnt', 'infonavit']
    for (const f of fields) {
      expect(result.real).toHaveProperty(f)
      expect(result.registrado).toHaveProperty(f)
      expect(result.diferencia).toHaveProperty(f)
    }
  })

  it('diferencia.total equals sum of all individual differences', () => {
    const result = calcComparacion(500, 315.04, seniority3)
    const { aguinaldo, vacPago, primaVac, liq3meses, liq20dias, primaAnt, infonavit } = result.diferencia
    const expectedTotal = aguinaldo + vacPago + primaVac + liq3meses + liq20dias + primaAnt + infonavit
    expect(result.diferencia.total).toBeCloseTo(expectedTotal, 2)
  })

  it('all diferencias are positive when salarioReal > salarioRegistrado', () => {
    const result = calcComparacion(500, 315.04, seniority3)
    const fields = ['aguinaldo', 'vacPago', 'primaVac', 'liq3meses', 'liq20dias', 'primaAnt', 'infonavit']
    for (const f of fields) {
      expect(result.diferencia[f]).toBeGreaterThan(0)
    }
    expect(result.diferencia.total).toBeGreaterThan(0)
  })

  it('edge case: salarioReal === salarioRegistrado -> all diferencias are 0', () => {
    const result = calcComparacion(400, 400, seniority3)
    const fields = ['aguinaldo', 'vacPago', 'primaVac', 'liq3meses', 'liq20dias', 'primaAnt', 'infonavit']
    for (const f of fields) {
      expect(result.diferencia[f]).toBeCloseTo(0, 5)
    }
    expect(result.diferencia.total).toBeCloseTo(0, 5)
  })

  it('liq3meses real = 500 * 90 = 45000 (Art. 48)', () => {
    const result = calcComparacion(500, 315.04, seniority3)
    expect(result.real.liq3meses).toBeCloseTo(500 * 90)
  })

  it('liq20dias real = 500 * 20 * 3 = 30000 (Art. 50)', () => {
    const result = calcComparacion(500, 315.04, seniority3)
    expect(result.real.liq20dias).toBeCloseTo(500 * 20 * 3)
  })

  it('infonavit real > 0 for completedYears=3', () => {
    const result = calcComparacion(500, 315.04, seniority3)
    expect(result.real.infonavit).toBeGreaterThan(0)
  })

  it('infonavit = 0 when completedYears = 0', () => {
    const seniority0 = { completedYears: 0, totalMonths: 0, daysInCurrentYear: 0, daysInSeniorityYear: 0 }
    const result = calcComparacion(500, 315.04, seniority0)
    expect(result.real.infonavit).toBe(0)
    expect(result.registrado.infonavit).toBe(0)
    expect(result.diferencia.infonavit).toBe(0)
  })
})

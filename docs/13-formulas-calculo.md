# Formulas de Calculo

**Referencia tecnica para desarrolladores.** Todas las formulas implementadas en `src/utils/calculations.js`.

---

## 1. Conversion de salario (Art. 89)

```
toSalarioDia(monto, frecuencia):
  diario    → monto
  semanal   → monto / 7
  quincenal → monto / 15
  mensual   → monto / 30    (Art. 89 — NO usar 30.4167)
```

## 2. Antiguedad

```
calcSeniority(mesIngreso, anoIngreso):
  totalMeses = (anoActual - anoIngreso) x 12 + (mesActual - mesIngreso)
  anosCompletos = floor(totalMeses / 12)
  mesesEnAnoAniversario = totalMeses % 12
  diasEnAnoCalendario = (mesActual - 1) x 30
  diasEnAnoAniversario = mesesEnAnoAniversario x 30
```

## 3. Dias de vacaciones (Art. 76)

```
getVacationDays(anosCompletos):
  0-1 anos  → 12 dias
  2 anos    → 14 dias
  3 anos    → 16 dias
  4 anos    → 18 dias
  5 anos    → 20 dias
  6-10 anos → 22 dias
  11-15     → 24 dias
  16-20     → 26 dias
  21-25     → 28 dias
  26-30     → 30 dias
  31+       → 32 dias
```

## 4. Salario Diario Integrado (Art. 84, LSS Art. 27)

```
calcSDI(salarioDia, anosCompletos):
  diasVac = getVacationDays(anosCompletos)
  factorIntegracion = 1 + (15 / 365) + (diasVac x 0.25 / 365)
  SDI = salarioDia x factorIntegracion
```

## 5. Prestaciones anuales

```
calcPrestaciones(salarioDia, antiguedad, trabajaDomingos):
  diasVac = getVacationDays(antiguedad.anosCompletos)

  aguinaldo      = salarioDia x 15                         (Art. 87)
  vacPago        = salarioDia x diasVac                    (Art. 76)
  primaVac       = vacPago x 0.25                          (Art. 80)
  primaDominical = trabajaDomingos ? salarioDia x 0.25 x 52 : 0  (Art. 71)

  subtotal = aguinaldo + vacPago + primaVac + primaDominical
```

## 6. Finiquito — renuncia voluntaria (Art. 79, 87, 80, 162)

```
calcFiniquito(salarioDia, antiguedad):
  diasVac = getVacationDays(antiguedad.anosCompletos)
  mesesEnAno = antiguedad.diasEnAnoAniversario / 30

  # Aguinaldo proporcional (ano calendario, desde enero)
  aguinaldoProp = salarioDia x 15 x (antiguedad.diasEnAnoCalendario / 365)

  # Vacaciones proporcionales (ano de antiguedad, desde ultimo aniversario)
  # Caso especial: en aniversario exacto (0 meses) → ano completo
  Si mesesEnAno == 0 Y anosCompletos > 0:
    vacProp = salarioDia x getVacationDays(anosCompletos) x 1
  Sino:
    vacProp = salarioDia x diasVac x (mesesEnAno / 12)

  primaVacProp = vacProp x 0.25

  # Prima antiguedad: SOLO con 15+ anos en renuncia voluntaria
  Si anosCompletos >= 15:
    primaAnt = min(salarioDia, TOPE_PRIMA) x 12 x anosCompletos
  Sino:
    primaAnt = 0

  total = aguinaldoProp + vacProp + primaVacProp + primaAnt
```

## 7. Liquidacion — despido injustificado (Art. 48, 50, 162)

```
calcLiquidacion(salarioDia, antiguedad):
  tresMeses  = salarioDia x 90                              (Art. 48)
  veinteDias = salarioDia x 20 x antiguedad.anosCompletos   (Art. 50)
  primaAnt   = min(salarioDia, TOPE_PRIMA) x 12 x antiguedad.anosCompletos  (Art. 162)

  total = tresMeses + veinteDias + primaAnt
```

**Nota:** En despido, la prima de antiguedad aplica **desde el primer ano** (sin umbral de 15 anos).

## 8. Total por despido injustificado

```
totalDespido = calcLiquidacion.total
             + calcFiniquito.aguinaldoProp
             + calcFiniquito.vacProp
             + calcFiniquito.primaVacProp
             (NO sumar calcFiniquito.primaAnt — ya esta en calcLiquidacion)
```

## 9. Horas extra (Art. 66-68)

```
calcExtras(salarioDia, horasExtra, horasJornada):
  horaNormal = salarioDia / horasJornada
  horasDobles = min(horasExtra, 9)
  horasTriples = max(0, horasExtra - 9)

  pagoDoble  = horasDobles x horaNormal x 2    (Art. 67)
  pagoTriple = horasTriples x horaNormal x 3   (Art. 68)
  total = pagoDoble + pagoTriple
```

## Constantes legales 2026

```
SALARIO_MINIMO_DIARIO = 315.04    (CONASAMI DOF 09/12/2025)
UMA_DIARIO = 117.31               (INEGI DOF 09/01/2026)
PRIMA_ANTIGUEDAD_TOPE = 630.08    (2 x SM — Art. 162)
AGUINALDO_DIAS = 15               (Art. 87)
PRIMA_VACACIONAL_PCT = 0.25       (Art. 80)
PRIMA_DOMINICAL_PCT = 0.25        (Art. 71)
```

---

*Fuente: LFT multiples articulos, verificado abril 2026. Codigo: src/utils/calculations.js*

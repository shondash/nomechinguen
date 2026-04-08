# Tabla de Vacaciones (Art. 76 LFT)

**Base legal:** LFT Art. 76, reforma "Vacaciones Dignas" DOF 27/12/2022, vigente 01/01/2023

---

## Tabla completa

| Anos de servicio | Dias de vacaciones | Incremento |
|------------------|--------------------|------------|
| 1 | 12 | Base |
| 2 | 14 | +2 |
| 3 | 16 | +2 |
| 4 | 18 | +2 |
| 5 | 20 | +2 |
| 6 | 22 | +2 |
| 7 | 22 | — |
| 8 | 22 | — |
| 9 | 22 | — |
| 10 | 22 | — |
| 11 | 24 | +2 |
| 12-15 | 24 | — |
| 16 | 26 | +2 |
| 17-20 | 26 | — |
| 21 | 28 | +2 |
| 22-25 | 28 | — |
| 26 | 30 | +2 |
| 27-30 | 30 | — |
| 31 | 32 | +2 |
| 32-35 | 32 | — |

## Patron de incremento

- **Anos 1-5:** +2 dias por cada ano
- **Anos 6-10:** Se mantiene en 22 dias
- **A partir del ano 11:** +2 dias por cada 5 anos (bloque)

## Reforma 2023 ("Vacaciones Dignas")

La reforma publicada en el DOF el 27/12/2022 (vigente 01/01/2023) duplico el minimo de vacaciones:

| | Antes de 2023 | Desde 2023 |
|---|--------------|------------|
| Primer ano | 6 dias | **12 dias** |
| Segundo ano | 8 dias | **14 dias** |
| Tercer ano | 10 dias | **16 dias** |

Si tu patron te da los dias anteriores a la reforma, esta violando la ley.

## Implementacion en el codigo

```javascript
// src/utils/calculations.js
export function getVacationDays(completedYears) {
  if (completedYears <= 1)  return 12
  if (completedYears <= 5)  return 10 + completedYears * 2
  if (completedYears <= 10) return 22
  if (completedYears <= 15) return 24
  if (completedYears <= 20) return 26
  if (completedYears <= 25) return 28
  if (completedYears <= 30) return 30
  return 32
}
```

---

*Fuente: LFT Art. 76, DOF 27/12/2022, verificado abril 2026*

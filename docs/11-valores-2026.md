# Valores Monetarios 2026

**Actualizacion:** Enero 2026

---

## Valores vigentes

| Concepto | Valor 2026 | Fuente | Fecha DOF |
|----------|-----------|--------|-----------|
| Salario Minimo General | **$315.04/dia** | CONASAMI | DOF 09/12/2025, vigente 01/01/2026 |
| UMA (Unidad de Medida y Actualizacion) | **$117.31/dia** | INEGI | DOF 09/01/2026, vigente 01/02/2026 |
| UMA valor anterior (enero 2026) | $113.14/dia | INEGI | DOF 10/01/2025, vigente hasta 31/01/2026 |
| Prima de antiguedad tope diario | **$630.08/dia** | Art. 162 LFT (2 x SM) | Calculado |

## Valores derivados

| Concepto | Calculo | Resultado |
|----------|---------|-----------|
| Salario Minimo Mensual | $315.04 x 30 | $9,451.20 |
| UMA Mensual | $117.31 x 30.4 | $3,566.23 |
| UMA Anual | $117.31 x 365 | $42,818.15 |
| Prima antiguedad tope mensual | $630.08 x 30 | $18,902.40 |

## Nota sobre UMA vs Salario Minimo

Desde la reforma de 2016, muchas referencias legales que usaban "salario minimo" fueron sustituidas por la UMA. Sin embargo, **la prima de antiguedad (Art. 162 LFT) sigue usando el salario minimo**, no la UMA. El texto del Art. 162 es explicito: "doble del salario minimo general vigente".

## Donde se usa cada valor en la app

| Valor | Usado en | Archivo |
|-------|---------|---------|
| SALARIO_MINIMO_DIARIO ($315.04) | Tope prima antiguedad, display en header/footer | src/constants/legal.js |
| UMA_DIARIO ($117.31) | Display en glosario | src/constants/legal.js |
| PRIMA_ANTIGUEDAD_TOPE ($630.08) | Calculo liquidacion y finiquito | src/constants/legal.js |
| AGUINALDO_DIAS (15) | Calculo aguinaldo, SDI | src/constants/legal.js |
| PRIMA_VACACIONAL_PCT (0.25) | Calculo prima vacacional, SDI | src/constants/legal.js |
| PRIMA_DOMINICAL_PCT (0.25) | Calculo prima dominical | src/constants/legal.js |

## Actualizacion anual

Cada enero:

1. CONASAMI publica el nuevo salario minimo (tipicamente en diciembre del ano anterior, vigente 1 de enero)
2. INEGI publica la nueva UMA (tipicamente en enero, vigente 1 de febrero)
3. Actualizar `src/constants/legal.js`:
   - `LEGAL_YEAR`
   - `SALARIO_MINIMO_DIARIO`
   - `UMA_DIARIO`
   - `PRIMA_ANTIGUEDAD_TOPE` se calcula automaticamente (2 x SM)
4. Ejecutar pruebas: `npx vitest run`
5. Regenerar volante: `npm run generate-flyer`
6. Regenerar imagen OG: `npm run generate-og`
7. Build y deploy: `npm run build && npx wrangler pages deploy dist/`

---

*Fuente: CONASAMI DOF 09/12/2025, INEGI DOF 09/01/2026, verificado abril 2026*

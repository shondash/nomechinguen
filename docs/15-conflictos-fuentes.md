# Conflictos de Fuentes

**Documentacion de interpretaciones legales divergentes encontradas durante la verificacion.**

---

## Conflicto #1: Art. 50 — "20 dias por ano" en despido injustificado

### El problema

El Art. 50 LFT establece una indemnizacion de 20 dias de salario por cada ano de servicios, pero su alcance textual no es identico a como se aplica en la practica.

### Posiciones

| Fuente | Interpretacion |
|--------|---------------|
| **Texto estricto del Art. 50** | La indemnizacion de 20 dias/ano aplica especificamente en: (a) cuando el patron rechaza la reinstalacion ordenada por el tribunal (Art. 49), (b) cuando el trabajador rescinde la relacion por culpa del patron (Art. 52), (c) en terminaciones colectivas. Una lectura estricta no lista el "despido injustificado ordinario" como detonante explicito del Art. 50. |
| **Calculadora oficial del gobierno** (conciliacionlaboral.org.mx) | Formula: (SD x 90) + (SD x 20 x anos) — trata los 20 dias/ano como componente estandar de la liquidacion por despido injustificado. |
| **PROFEDET** (materiales educativos) | "3 meses + 20 dias por ano" se describe como el paquete estandar de liquidacion por despido injustificado en todas sus guias publicas. |
| **Jurisprudencia laboral** | Los tribunales laborales y los procedimientos de conciliacion aplican rutinariamente los 20 dias/ano como parte de las liquidaciones por despido injustificado. La formulacion del gobierno refleja la practica real. |

### Resolucion adoptada

La app usa la formulacion **gobierno/PROFEDET/jurisprudencia**. Esto es apropiado para una herramienta de **educacion al trabajador** porque refleja lo que los trabajadores reciben en la practica a traves del proceso de conciliacion.

La distincion entre el texto estricto y la aplicacion practica se documenta aqui para completitud. La app **no debe** cambiarse a la interpretacion del texto estricto, que subrepresentaria lo que los trabajadores pueden legitimamente reclamar.

### Impacto en la app

Tanto la calculadora (`calcLiquidacion`) como el capitulo de despido muestran correctamente el componente de 20 dias/ano conforme a la formulacion gubernamental. No se requiere cambio.

---

## Nota general sobre conflictos

Cuando se detecta una discrepancia entre fuentes, la app sigue esta prioridad:

1. **Jurisprudencia y practica de conciliacion** — como se aplica realmente
2. **Materiales PROFEDET y gobierno** — como las instituciones lo explican al trabajador
3. **Texto estricto de la LFT** — la letra de la ley

Esta jerarquia prioriza la utilidad practica para el trabajador sobre la precision academica. La app no es un tratado juridico; es una herramienta para que el trabajador sepa que puede exigir.

---

*Documentado: Abril 2026, durante la verificacion legal de Phase 01*

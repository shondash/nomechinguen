# Reformas Pendientes y Recientes

**Estado a:** Abril 2026

---

## Reforma DOF 15/01/2026 (vigente)

**Decreto** publicado el 15 de enero de 2026 que reforma diversas leyes incluyendo la LFT.

### Articulos modificados de la LFT

| Articulo | Cambio | Impacto en la app |
|----------|--------|-------------------|
| Art. 2o. (primer parrafo) | Lenguaje de igualdad de genero y perspectiva de genero | Ninguno — la app no cita Art. 2 |
| Art. 3o. (primer parrafo) | Lenguaje de no discriminacion con perspectiva de genero | Ninguno — la app no cita Art. 3 |
| Art. 16 (parrafos 2 y 3 nuevos) | Se agregan disposiciones sobre perspectiva de genero | Ninguno — la app no cita Art. 16 |
| Art. 56 | Igualdad de condiciones con perspectiva de genero | Ninguno — la app no cita Art. 56 |

**Conclusion:** Esta reforma es sobre **igualdad de genero y anti-discriminacion**. No modifica ningun articulo relacionado con jornada, horas extra, vacaciones, aguinaldo, despido, liquidacion, o cualquier calculo de la app. El contenido de la app permanece correcto.

## Reforma de las 40 horas (pendiente)

| Aspecto | Estado |
|---------|--------|
| Propuesta | Reducir la jornada laboral maxima de 48 a 40 horas semanales |
| Aprobacion Senado | Si |
| Aprobacion Camara de Diputados | Pendiente (voto final) |
| Publicacion en DOF | **No publicada** |
| Implementacion propuesta | Gradual, a partir de 2027 |

### Que cambiaria si se aprueba

| Actual (vigente) | Propuesto |
|-------------------|-----------|
| Jornada diurna: 8 hrs/dia, 48 hrs/semana | 40 hrs/semana |
| Jornada nocturna: 7 hrs/dia, 42 hrs/semana | Por definir |
| Descanso: 1 dia por cada 6 trabajados | 2 dias por cada 5 trabajados |

### Impacto potencial en la app (cuando se publique en DOF)

1. Actualizar `JORNADA_TABLE` con nuevos maximos
2. Actualizar `renderChapter("jornada")` con los nuevos limites
3. Actualizar `CHECA_QUESTIONS[0]` sobre jornada excesiva
4. Revisar la calculadora de horas extra (los limites de Art. 66 podrian cambiar)

### Accion actual

**Ninguna.** La reforma no ha sido publicada en el DOF. Los contenidos de la app reflejan correctamente la ley vigente (Art. 60-62 LFT). Cuando se publique, se actualizara.

---

## Reforma de febrero 2025 (DOF 21/02/2025)

Reforma publicada en febrero de 2025, principalmente sobre temas de **Infonavit y vivienda**. Los articulos relevantes para la app (Art. 60, 66-68, 76, 80, 87, 162) **no fueron modificados** por esta reforma.

---

## Como monitorear reformas

1. **DOF:** [dof.gob.mx](https://www.dof.gob.mx) — publicacion oficial de todas las reformas
2. **Camara de Diputados:** [diputados.gob.mx](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf) — texto vigente actualizado
3. **Justia Mexico:** [mexico.justia.com](https://mexico.justia.com/federales/leyes/ley-federal-del-trabajo/) — texto con anotaciones de reformas

---

*Ultima revision: Abril 2026*

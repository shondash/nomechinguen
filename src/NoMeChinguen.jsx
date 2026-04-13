import { LEGAL_YEAR, SALARIO_MINIMO_DIARIO, UMA_DIARIO, PRIMA_ANTIGUEDAD_TOPE, AGUINALDO_DIAS, PRIMA_VACACIONAL_PCT, PRIMA_DOMINICAL_PCT } from "./constants/legal.js";
import { toSalarioDia, calcSeniority, getVacationDays, calcPrestaciones, calcFiniquito, calcLiquidacion, calcSDI, calcComparacion } from "./utils/calculations.js";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

// ── Responsive hook ──
function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return mobile;
}

// ── Palette ──
const C = {
  primary: "#163A5F",
  primaryHover: "#0F2C49",
  secondary: "#1F5F5B",
  accent: "#006847",
  bg: "#F7F5F0",
  surface: "#FFFFFF",
  text: "#1F2933",
  textSec: "#52606D",
  border: "#D9E2EC",
  info: "#2F80ED",
  success: "#2E7D32",
  warning: "#C28A2E",
  error: "#A63A3A",
};
const font = `'DM Sans', sans-serif`;
const mono = `'Space Mono', monospace`;

// ── Data ──
const VACATION_TABLE = [[1,12],[2,14],[3,16],[4,18],[5,20],["6–10",22],["11–15",24],["16–20",26],["21–25",28],["26–30",30],["31–35",32]];
const JORNADA_TABLE = [["Diurna","6:00–20:00","8 hrs (Art. 60)"],["Nocturna","20:00–6:00","7 hrs (Art. 61)"],["Mixta","Ambas","7.5 hrs (Art. 62)"]];
const DIAS_OBL = ["1 de enero","Primer lunes de febrero","Tercer lunes de marzo","1 de mayo","16 de septiembre","Tercer lunes de noviembre","25 de diciembre","Toma de posesión (cada 6 años)","Jornada electoral"];
const ALERTAS = ["No registrarte en el IMSS","Pagarte \"por fuera\" para evadir IMSS/impuestos","Hacerte firmar una carta de renuncia en blanco","Obligarte a trabajar horas extra sin pago","Darte menos de 12 días de vacaciones","Pagar aguinaldo tarde o menos de 15 días","Correrte sin aviso escrito","Represalias por sindicato o queja","Discriminación (embarazo, género, edad, etc.)","Retener tu salario","Cobrarte por uniformes o herramientas","Impedirte ir al IMSS","No darte tu CFDI de nómina"];
const RECURSOS = {
  "Ayuda Legal Gratuita": [
    ["PROFEDET","800 911 7877","Defensa legal gratuita (federal)","tel:8009117877","https://www.gob.mx/profedet"],
    ["Procuraduría del Trabajo CDMX","trabajo.cdmx.gob.mx","Defensa laboral local (CDMX)",null,"https://trabajo.cdmx.gob.mx"],
    ["PRODETSE","prodetse.segob.gob.mx","Para trabajadores del Estado (Apartado B)",null,"https://prodetse.segob.gob.mx"],
    ["CAT","apoyoaltrabajador.org.mx","Asesoría y acompañamiento (ONG)",null,"https://apoyoaltrabajador.org.mx"],
    ["Fundación Trabajo Digno","fundaciontrabajodigno.com","Representación en juicios (ONG, gratuito)",null,"https://fundaciontrabajodigno.com"],
  ],
  "Denuncia y Conciliación": [
    ["Centro de Conciliación Laboral","centrolaboral.gob.mx","Paso obligatorio antes de juicio",null,"https://centrolaboral.gob.mx"],
    ["STPS","gob.mx/stps","Denuncia de violaciones laborales",null,"https://www.gob.mx/stps"],
    ["CNDH","cndh.org.mx","Acoso, discriminación, derechos humanos",null,"https://www.cndh.org.mx"],
  ],
  "Seguridad Social": [
    ["IMSS","800 623 2323","Seguro Social","tel:8006232323","https://www.imss.gob.mx"],
    ["Infonavit","800 008 3900","Crédito vivienda","tel:8000083900","https://portalmx.infonavit.org.mx"],
  ],
  "Herramientas": [
    ["Otra calculadora de liquidación","conciliacionlaboral.org.mx","Calcula tu liquidación",null,"https://conciliacionlaboral.org.mx"],
    ["LFT completa","justia.com","Texto íntegro de la ley",null,"https://mexico.justia.com/federales/leyes/ley-federal-del-trabajo/"],
    ["NOM-035 texto completo","dof.gob.mx","Riesgo psicosocial en el trabajo",null,"https://www.dof.gob.mx/nota_detalle.php?codigo=5541828&fecha=23/10/2018"],
  ],
};
const FAQS = [["¿Me pueden despedir sin razón?","Sí, pero deben pagarte liquidación completa: 3 meses + 20 días por año + prima de antigüedad + finiquito. Si no te dan aviso escrito de despido justificado (robo, violencia, faltas repetidas, etc. — Art. 47 LFT), el despido es automáticamente injustificado."],["¿Qué hago si no me dan IMSS?","Llama a PROFEDET (800 911 7877). Tu patrón está obligado a registrarte desde el primer día. Puedes denunciar ante la STPS."],["¿Me pueden obligar a trabajar horas extra?","Solo dentro del límite legal (3 hrs/día, 3 veces/semana). Más allá de eso, NO estás obligado. Todas deben pagarse al doble o triple."],["¿Qué pasa si firmo la renuncia bajo presión?","Si puedes demostrar presión (testigos, grabaciones, mensajes), la renuncia puede invalidarse. Consulta a PROFEDET antes de firmar."],["¿Cuánto tiempo tengo para demandar?","2 meses desde el despido para indemnización. 1 año para salarios, aguinaldo y prestaciones."],["¿PROFEDET es realmente gratis?","Sí. Servicio federal gratuito. Te asesoran y representan en juicio sin costo. 800 911 7877."],["¿Me pueden descontar de mi salario?","Solo lo legal: IMSS, ISR, Infonavit, cuota sindical. No pueden descontarte por errores o \"multas\" sin tu consentimiento."],["¿Cuántos días de vacaciones me tocan?","Mínimo 12 desde el primer año (reforma 2023). Si te dan menos, están violando la ley."]];
const GLOSSARY = [["LFT","Ley Federal del Trabajo — la ley que protege tus derechos."],["Patrón","Tu empleador. La persona o empresa que te contrata."],["Trabajador","Tú. Cualquier persona que presta un servicio subordinado a cambio de salario."],["Contrato individual","El acuerdo escrito con tu patrón. Si no tienes uno, la culpa es del patrón."],["SDI","Salario Diario Integrado — salario + proporcional de aguinaldo, vacaciones y prima vacacional."],["IMSS","Seguro Social — tu patrón DEBE registrarte desde el día 1."],["Infonavit","Tu derecho a crédito para vivienda."],["AFORE","Donde se guarda tu ahorro para el retiro."],["CFDI de nómina","Recibo fiscal de tu sueldo. Te lo deben dar cada quincena/mes."],["PROFEDET","Abogados GRATIS del gobierno que te defienden contra tu patrón. 800 911 7877."],["Centro de Conciliación","Donde se resuelve un conflicto antes de juicio. Es obligatorio."],["Finiquito","Pago al terminar la relación laboral (siempre aplica)."],["Liquidación","Pago adicional por despido injustificado."],["PTU","10% de utilidades de la empresa, para los trabajadores."],["Prima de antigüedad","12 días de salario por año trabajado."],["UMA",`Unidad de Medida y Actualización: $${UMA_DIARIO}/día (${LEGAL_YEAR}).`],[`Salario mínimo ${LEGAL_YEAR}`,`$${SALARIO_MINIMO_DIARIO}/día (CONASAMI).`]];

// ── Tone system ──
// directo = irreverent default, tranquilo = softer but still colloquial
const TONE_STRINGS = {
  directo: {
    siteTitle: "No Me Chinguen",
    siteSub: `Guia de Derechos Laborales · México ${LEGAL_YEAR}`,
    checaTitle: "A ver cabrones...",
    checaIntro: "Contesta con honestidad. Si algo te suena familiar, probablemente te est\u00e1n chingando y ni cuenta te das.",
    badLabel: "Te est\u00e1n chingando.",
    goodLabel: "Ah\u00ed la llevas.",
    extrasBadIntro: "Si tu patr\u00f3n te hace quedarte tarde y no te las paga, te est\u00e1 robando.",
    footer: `No Me Chinguen · Edición ${LEGAL_YEAR} · Distribución libre · No se recopilan datos`,
    privResp: "No Me Chinguen",
  },
  tranquilo: {
    siteTitle: "Conoce Tus Derechos",
    siteSub: `Guia de Derechos Laborales · México ${LEGAL_YEAR}`,
    checaTitle: "A ver, checamos...",
    checaIntro: "Contesta cada pregunta. Si algo te suena conocido, puede que no te est\u00e9n respetando tus derechos.",
    badLabel: null, // use per-question verdictTranquilo prefix
    goodLabel: "Vas bien por ah\u00ed.",
    extrasBadIntro: "Si tu patr\u00f3n te hace quedarte tarde y no te las paga, eso no est\u00e1 bien.",
    footer: `Conoce Tus Derechos · Edición ${LEGAL_YEAR} · Distribución libre · No se recopilan datos`,
    privResp: "Conoce Tus Derechos",
  },
};

const CHECA_QUESTIONS = [
  {q:"\u00bfTu jornada laboral es de m\u00e1s de 8 horas (diurna), 7 horas (nocturna) o 7.5 horas (mixta)?", bad:"si", verdict:"Tu patr\u00f3n se est\u00e1 pasando. Art. 60-62 LFT: esas son las jornadas m\u00e1ximas. Lo que pase de ah\u00ed son horas extra y se pagan aparte.", verdictTranquilo:"Ojo, se est\u00e1n pasando. Art. 60-62 LFT: esas son las jornadas m\u00e1ximas. Lo que pase de ah\u00ed son horas extra y se pagan aparte.", ref:"Cap. 2"},
  {q:"\u00bfTe hacen quedarte tarde y NO te pagan horas extra?", bad:"si", verdict:"Te est\u00e1n robando tu tiempo. Las horas extra se pagan al DOBLE, y despu\u00e9s de 9 a la semana al TRIPLE. Art. 67-68 LFT.", verdictTranquilo:"Te est\u00e1n robando tu tiempo. Las horas extra se pagan al DOBLE, y despu\u00e9s de 9 a la semana al TRIPLE. Art. 67-68 LFT.", ref:"Cap. 3"},
  {q:"\u00bfTrabajas m\u00e1s de 9 horas extra a la semana?", bad:"si", verdict:"Eso es ilegal. Art. 66 LFT: m\u00e1ximo 3 horas extra al d\u00eda, m\u00e1ximo 3 veces por semana. No est\u00e1s obligado a m\u00e1s.", verdictTranquilo:"Eso no deber\u00eda pasar. Art. 66 LFT: m\u00e1ximo 3 horas extra al d\u00eda, m\u00e1ximo 3 veces por semana. No est\u00e1s obligado a m\u00e1s.", ref:"Cap. 3"},
  {q:"\u00bfTe dan menos de 12 d\u00edas de vacaciones al a\u00f1o?", bad:"si", verdict:"Desde enero 2023 el m\u00ednimo es 12 d\u00edas. Si te dan 6, tu patr\u00f3n sigue en el M\u00e9xico de antes. Art. 76 LFT.", verdictTranquilo:"Desde enero 2023 el m\u00ednimo es 12 d\u00edas. Si te dan menos, no est\u00e1n cumpliendo. Art. 76 LFT.", ref:"Cap. 4"},
  {q:"\u00bfTu patr\u00f3n NO te tiene dado de alta en el IMSS?", bad:"si", verdict:"Grav\u00edsimo. Est\u00e1s sin seguro m\u00e9dico, sin cotizar para tu retiro, sin Infonavit. Tu patr\u00f3n est\u00e1 cometiendo un delito. Art. 15 Ley del Seguro Social.", verdictTranquilo:"Esto es serio. Est\u00e1s sin seguro m\u00e9dico, sin cotizar para tu retiro, sin Infonavit. Tu patr\u00f3n est\u00e1 incumpliendo la ley. Art. 15 Ley del Seguro Social.", ref:"Cap. 8"},
  {q:"\u00bfTe pagan parte o todo tu sueldo por fuera de la n\u00f3mina? (efectivo sin recibo, \"bonos\" que no aparecen en tu CFDI, vales de despensa inflados, transferencias por separado)", bad:"si", verdict:"Te est\u00e1n registrando con un salario menor ante el IMSS. Eso te jode en incapacidades, cr\u00e9dito Infonavit, liquidaci\u00f3n, aguinaldo, vacaciones y pensi\u00f3n. Todo se calcula sobre tu salario registrado, no sobre lo que realmente ganas.", verdictTranquilo:"Te est\u00e1n viendo la cara. Te registran con un salario menor ante el IMSS y eso te afecta en incapacidades, cr\u00e9dito Infonavit, liquidaci\u00f3n, aguinaldo, vacaciones y pensi\u00f3n. Todo se calcula sobre tu salario registrado, no sobre lo que realmente ganas.", ref:"Cap. 8"},
  {q:"\u00bfTe hicieron firmar una carta de renuncia en blanco cuando entraste?", bad:"si", verdict:"Eso es completamente ilegal y lo usan para correrte sin pagarte liquidaci\u00f3n. Si te pasa, guarda evidencia y llama a PROFEDET.", verdictTranquilo:"Eso no es legal. Lo usan para sacarte sin pagarte liquidaci\u00f3n. Guarda evidencia y llama a PROFEDET.", ref:"Cap. 8"},
  {q:"\u00bfTe proh\u00edben o amenazan por querer unirte a un sindicato?", bad:"si", verdict:"Libertad sindical es un derecho constitucional. Art. 123-A fr. XVI. Las represalias son ilegales.", verdictTranquilo:"Eso va contra la Constituci\u00f3n. Art. 123-A fr. XVI. Las represalias son ilegales.", ref:"Cap. 8"},
  {q:"\u00bfTe marcan a tu cel personal fuera de horario esperando que contestes como si fueras su empleado 24/7?", bad:"si", verdict:"Si te exigen disponibilidad fuera de tu jornada, eso es tiempo de trabajo y debe pagarse. No eres su esclavo.", verdictTranquilo:"Si te exigen disponibilidad fuera de tu jornada, eso es tiempo de trabajo y debe pagarse. No es tu mam\u00e1.", ref:"Cap. 2"},
  {q:"\u00bfRecibiste menos de 15 d\u00edas de aguinaldo (o no te lo pagaron antes del 20 de diciembre)?", bad:"si", verdict:"Art. 87 LFT: m\u00ednimo 15 d\u00edas, antes del 20 de diciembre. Si no cumplieron, tienes 1 a\u00f1o para reclamar.", verdictTranquilo:"Art. 87 LFT: m\u00ednimo 15 d\u00edas, antes del 20 de diciembre. Si no cumplieron, tienes 1 a\u00f1o para reclamar.", ref:"Cap. 5"},
  {q:"\u00bfTu empresa no te paga PTU (reparto de utilidades) o te dice que \"no hubo ganancias\" sin mostrarte nada?", bad:"si", verdict:"Art. 117-131 LFT: tienes derecho al 10% de las utilidades. Se paga entre mayo y junio. Si dicen que no hubo, DEBEN mostrarte la declaraci\u00f3n fiscal (Art. 121). Es tu derecho revisarla.", verdictTranquilo:"Art. 117-131 LFT: tienes derecho al 10% de las utilidades. Se paga entre mayo y junio. Si dicen que no hubo, DEBEN mostrarte la declaraci\u00f3n fiscal (Art. 121). Es tu derecho revisarla.", ref:"Cap. 6"},
  {q:"\u00bfTe cobran por uniformes, herramientas o equipo que necesitas para trabajar?", bad:"si", verdict:"El patr\u00f3n debe proporcionar los instrumentos de trabajo. Art. 132 fr. III LFT. No te pueden cobrar.", verdictTranquilo:"El patr\u00f3n debe proporcionar los instrumentos de trabajo. Art. 132 fr. III LFT. No te pueden cobrar.", ref:"Cap. 8"},
  {q:"\u00bfTienes contrato escrito?", bad:"no", verdict:"La falta de contrato escrito es culpa del patr\u00f3n, no tuya. Y en un juicio, se presume cierto lo que t\u00fa declares sobre las condiciones laborales. Art. 26 LFT.", verdictTranquilo:"La falta de contrato escrito es responsabilidad del patr\u00f3n. En un juicio, se presume cierto lo que t\u00fa declares sobre las condiciones laborales. Art. 26 LFT.", ref:"Cap. 1"},
];

// ── Primitives ──
const Label = ({children}) => <p style={{fontFamily:mono,fontSize:11,color:C.secondary,letterSpacing:2,textTransform:"uppercase",margin:"0 0 6px"}}>◆ {children}</p>;
const H1 = ({children}) => <h2 style={{fontSize:26,fontWeight:700,color:C.primary,margin:"4px 0 12px",lineHeight:1.2}}>{children}</h2>;
const H2 = ({children}) => <h3 style={{fontSize:17,fontWeight:700,color:C.secondary,margin:"20px 0 8px"}}>{children}</h3>;
const Body = ({children}) => <p style={{fontSize:15,lineHeight:1.7,color:C.text,margin:"0 0 10px"}}>{children}</p>;
const Bullet = ({children}) => <p style={{fontSize:15,lineHeight:1.7,color:C.text,margin:"0 0 5px",paddingLeft:20}}>• {children}</p>;
const Hr = () => <hr style={{border:"none",borderTop:`1px solid ${C.border}`,margin:"16px 0"}}/>;
const Callout = ({children,type="info"}) => {
  const m = {info:[C.info,"#EBF4FF"],warning:[C.warning,"#FFF8EB"],error:[C.error,"#FFF0F0"],success:[C.success,"#EEFBEE"]};
  const [b,bg] = m[type]||m.info;
  return <div style={{background:bg,borderLeft:`3px solid ${b}`,padding:"14px 18px",fontSize:14,lineHeight:1.6,color:C.text,fontWeight:500,margin:"14px 0",borderRadius:"0 8px 8px 0"}}>{children}</div>;
};
const MiniTable = ({headers,rows}) => (
  <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",margin:"12px 0"}}>
    <table style={{borderCollapse:"collapse",fontSize:14,maxWidth:600,minWidth:320}}>
      <thead><tr>{headers.map((h,i)=><th key={i} style={{background:C.primary,color:"#fff",padding:"10px 16px",textAlign:"left",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j} style={{padding:"8px 16px",background:i%2===1?"#F0F4F8":C.surface,borderBottom:`1px solid ${C.border}`}}>{c}</td>)}</tr>)}</tbody>
    </table>
  </div>
);

// ── NAV items ──
const NAV = [
  {id:"checa",label:"A Ver",desc:"Checklist rápido"},
  {id:"guia",label:"Guía",desc:"Tus derechos"},
  {id:"calc",label:"Calculadora",desc:"Horas extra y liquidación"},
  {id:"faq",label:"Preguntas",desc:"Lo más preguntado"},
  {id:"recursos",label:"Recursos",desc:"Contactos y ayuda"},
];

// ═══════════════════════════════════════
// CHECA TAB
// ═══════════════════════════════════════
function ChecaTab({onNav, mobile, tone}) {
  const T = TONE_STRINGS[tone];
  const [answers, setAnswers] = useState({});
  const toggle = (i, val) => setAnswers(prev => ({...prev, [i]: prev[i]===val ? undefined : val}));
  const answered = Object.keys(answers).filter(k => answers[k] !== undefined).length;
  const problems = Object.entries(answers).filter(([i,v]) => v !== undefined && v === CHECA_QUESTIONS[parseInt(i)].bad).length;

  return (
    <div>
      <Label>CHECKLIST</Label>
      <H1>{T.checaTitle}</H1>
      <Body>{T.checaIntro}</Body>

      {/* Frases chingadoras banner */}
      <div style={{background:C.primaryHover,borderRadius:12,padding:"20px 24px",margin:"16px 0"}}>
        <p style={{fontFamily:mono,fontSize:10,color:"rgba(255,255,255,0.6)",letterSpacing:2,textTransform:"uppercase",margin:"0 0 12px"}}>{"\u25C6"} FRASES CHINGADORAS {"\u2014"} SI TU PATR{"\u00D3"}N DICE ESTO, AGUAS</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {["Somos familia","Ponte la camiseta","Aqu\u00ed todos le echamos ganas","Es que apenas estamos creciendo","Eso no es hora extra, es compromiso","Te lo compenso despu\u00e9s","No seas conflictivo","Aqu\u00ed no hay sindicato porque no hace falta","El IMSS te lo damos despu\u00e9s de 3 meses","Tu aguinaldo ya va incluido en tu sueldo","Las utilidades no aplican para ti","Firma aqu\u00ed, es puro tr\u00e1mite"].map((f,i)=>(
            <span key={i} style={{background:"rgba(255,255,255,0.12)",padding:"6px 14px",borderRadius:20,fontSize:13,fontStyle:"italic",color:"#fff",whiteSpace:"nowrap"}}>{"\u201C"}{f}{"\u201D"}</span>
          ))}
        </div>
        <p style={{fontSize:13,color:C.warning,fontWeight:600,margin:"14px 0 0",lineHeight:1.5}}>Ninguna de estas frases te quita derechos. La ley no cambia porque tu patr{"\u00F3"}n sea {"\u201C"}buena onda{"\u201D"}.</p>
      </div>

      <Hr/>

      {/* Score strip */}
      {answered > 0 && (
        <div style={{display:"flex",gap:16,marginBottom:24,flexWrap:"wrap"}}>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 24px",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:28,fontWeight:700,color:C.primary,fontFamily:mono}}>{answered}</span>
            <span style={{fontSize:13,color:C.textSec}}>respondidas</span>
          </div>
          {problems > 0 && (
            <div style={{background:"#FFF0F0",border:`1px solid #E8AAAA`,borderRadius:10,padding:"14px 24px",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:28,fontWeight:700,color:C.error,fontFamily:mono}}>{problems}</span>
              <span style={{fontSize:13,color:C.error}}>problema{problems!==1&&"s"}</span>
            </div>
          )}
          {answered > 0 && problems === 0 && (
            <div style={{background:"#EEFBEE",border:`1px solid #A5D6A7`,borderRadius:10,padding:"14px 24px",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:28,fontWeight:700,color:C.success,fontFamily:mono}}>0</span>
              <span style={{fontSize:13,color:C.success}}>problemas</span>
            </div>
          )}
        </div>
      )}

      {/* Questions grid */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:mobile?12:16}}>
        {CHECA_QUESTIONS.map((item,i) => {
          const val = answers[i];
          const isBad = val !== undefined && val === item.bad;
          const isGood = val !== undefined && val !== item.bad;
          return (
            <div key={i} style={{background:C.surface,border:`1px solid ${isBad?"#E8AAAA":isGood?"#A5D6A7":C.border}`,borderRadius:10,padding:20,display:"flex",flexDirection:"column",justifyContent:"space-between",transition:"border-color .2s"}}>
              <div style={{fontSize:14,fontWeight:600,color:C.text,lineHeight:1.55,marginBottom:14}}>{item.q}</div>
              <div>
                <div style={{display:"flex",gap:8}}>
                  {["si","no"].map(opt => {
                    const selected = val === opt;
                    const bad = selected && opt === item.bad;
                    const good = selected && opt !== item.bad;
                    return (
                      <button key={opt} onClick={()=>toggle(i,opt)} style={{
                        flex:1,padding:"8px 0",fontSize:14,fontWeight:600,borderRadius:6,cursor:"pointer",
                        border:selected?"none":`1.5px solid ${C.border}`,
                        background:bad?C.error:good?C.success:C.surface,
                        color:selected?"#fff":C.textSec,transition:"all .15s"
                      }}>{opt==="si"?"Sí":"No"}</button>
                    );
                  })}
                </div>
                {isBad && (
                  <div style={{marginTop:12,background:"#FFF0F0",borderLeft:`3px solid ${C.error}`,padding:"10px 14px",borderRadius:"0 6px 6px 0",fontSize:13,lineHeight:1.55,color:C.text}}>
                    {T.badLabel && <span style={{fontWeight:700,color:C.error}}>{T.badLabel} </span>}{tone==="directo"?item.verdict:item.verdictTranquilo}
                    <div style={{marginTop:6,fontFamily:mono,fontSize:10,color:C.error}}>→ Ver {item.ref} en la Guía</div>
                  </div>
                )}
                {isGood && (
                  <div style={{marginTop:12,background:"#EEFBEE",borderLeft:`3px solid ${C.success}`,padding:"8px 14px",borderRadius:"0 6px 6px 0",fontSize:13,color:C.success,fontWeight:600}}>
                    {T.goodLabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      {problems > 0 && answered >= 4 && (
        <div style={{marginTop:28,padding:24,background:"#FFF0F0",border:`1px solid #E8AAAA`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:C.error}}>{problems} problema{problems!==1&&"s"} detectado{problems!==1&&"s"}</div>
            <div style={{fontSize:14,color:C.text,marginTop:4}}>Llama a PROFEDET: <strong>800 911 7877</strong> (gratis, confidencial)</div>
          </div>
          <button onClick={()=>onNav("calc")} style={{background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"12px 28px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:font,whiteSpace:"nowrap"}}>Ir a la Calculadora</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// GUÍA TAB
// ═══════════════════════════════════════
const CHAPTERS = [
  {id:"glosario",ch:"1",title:"Glosario Laboral"},
  {id:"jornada",ch:"2",title:"Tu Jornada de Trabajo"},
  {id:"extras",ch:"3",title:"Horas Extra — No Regales Tu Tiempo"},
  {id:"vacaciones",ch:"4",title:"Vacaciones — Son 12 Días Mínimo"},
  {id:"aguinaldo",ch:"5",title:"Aguinaldo — Mínimo 15 Días"},
  {id:"ptu",ch:"6",title:"PTU — Las Utilidades Son Tuyas"},
  {id:"despido",ch:"7",title:"Despido — Conoce la Diferencia"},
  {id:"alertas",ch:"8",title:"Señales de Alerta"},
  {id:"quehago",ch:"9",title:"¿Qué Hago? — Tus Opciones"},
  {id:"privacidad",ch:"11",title:"Aviso de Privacidad"},
];

function renderChapter(id, mobile, tone="directo") {
  const T = TONE_STRINGS[tone];
  switch(id) {
    case "glosario": return <div style={{columns:mobile?"1":"2",columnGap:32,columnRule:mobile?"none":`1px solid ${C.border}`}}>{GLOSSARY.map(([t,d],i)=><div key={i} style={{breakInside:"avoid",marginBottom:10}}><Body><strong>{t}:</strong> {d}</Body></div>)}</div>;
    case "jornada": return (
      <div>
        <Body>La ley pone límites claros a cuántas horas puedes trabajar. Si tu patrón te hace trabajar más sin pagarte, está violando la ley.</Body>
        <MiniTable headers={["Tipo","Horario","Máximo"]} rows={JORNADA_TABLE}/>
        <H2>Tus derechos durante la jornada</H2>
        <Bullet><strong>Art. 63:</strong> Mínimo 30 minutos de descanso en jornada continua.</Bullet>
        <Bullet><strong>Art. 69:</strong> 1 día de descanso por cada 6 trabajados.</Bullet>
        <Bullet><strong>Art. 73:</strong> Trabajar tu día de descanso = pago triple.</Bullet>
        <H2>Días de descanso obligatorio (Art. 74)</H2>
        <div style={{columns:mobile?"1":"2",columnGap:24}}>{DIAS_OBL.map((d,i)=><Bullet key={i}>{d}</Bullet>)}</div>
        <Callout type="warning">Art. 75: Si trabajas un día de descanso obligatorio, tu patrón te debe pagar TRIPLE. Si ganas $400/día, te corresponden $1,200.</Callout>
      </div>
    );
    case "extras": return (
      <div>
        <Body>Las horas extra se pagan m&#225;s caras. {T.extrasBadIntro}</Body>
        <H2>¿Cuánto se pagan?</H2>
        <Bullet><strong>Art. 66:</strong> Máx 3 hrs/día, 3 veces/semana = 9 hrs/semana.</Bullet>
        <Bullet>Primeras 9 hrs/semana = pago al <strong>DOBLE</strong>.</Bullet>
        <Bullet>A partir de la hora 10 = pago al <strong>TRIPLE</strong>.</Bullet>
        <Bullet><strong>Art. 68:</strong> NO estás obligado a trabajar más allá del límite legal.</Bullet>
        <Callout type="info">Art. 784 fr. VIII: En un juicio, el PATRÓN debe probar las horas que trabajaste. Si no tiene registros, se presume cierto lo que tú declares.</Callout>
        <H2>Ejemplo ($400/día, jornada 8 hrs)</H2>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"1fr 1fr",gap:12,maxWidth:500}}>
          {[["Hora normal","$50/hora"],["Extra doble","$100/hora"],["Extra triple","$150/hora"],["12 extras/sem","$1,350 total"]].map(([l,v],i)=>(
            <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px"}}>
              <div style={{fontSize:12,color:C.textSec}}>{l}</div>
              <div style={{fontSize:18,fontWeight:700,color:C.primary,fontFamily:mono}}>{v}</div>
            </div>
          ))}
        </div>
        <Callout type="success">CONSEJO: Mándate un WhatsApp diario con tu hora de entrada y salida. Eso crea evidencia con fecha y hora que sirve en un juicio.</Callout>
      </div>
    );
    case "vacaciones": return (
      <div>
        <Body>Desde la reforma "Vacaciones Dignas" (DOF 27/12/2022, vigente 01/01/2023), el mínimo subió de 6 a <strong>12 días</strong>.</Body>
        <MiniTable headers={["Antigüedad","Días"]} rows={VACATION_TABLE.map(([y,d])=>[y+" año(s)",String(d)])}/>
        <H2>Lo que debes saber</H2>
        <Bullet><strong>Art. 80:</strong> Prima vacacional = 25% del salario de tus vacaciones.</Bullet>
        <Bullet><strong>Art. 79:</strong> Las vacaciones NO se pueden cambiar por dinero.</Bullet>
        <Bullet><strong>Art. 81:</strong> Deben darse dentro de 6 meses de tu aniversario.</Bullet>
        <Bullet><strong>Art. 81:</strong> Tu patrón debe darte una constancia escrita cada año.</Bullet>
        <Callout type="error">Si tu patrón todavía te da 6 días de vacaciones, está violando la ley. Punto. Desde enero de 2023 el mínimo es 12 días.</Callout>
      </div>
    );
    case "aguinaldo": return (
      <div>
        <Body><strong>Art. 87 LFT:</strong> Tu patrón debe pagarte mínimo 15 días de salario como aguinaldo, a más tardar el <strong>20 de diciembre</strong>.</Body>
        <Body>Si no trabajaste el año completo, te toca la parte proporcional.</Body>
        <H2>Ejemplo</H2>
        <Bullet>Salario diario: $400</Bullet>
        <Bullet>Aguinaldo completo: $400 × 15 = <strong>$6,000</strong></Bullet>
        <Bullet>Si entraste el 1 de julio (6 meses): $6,000 × 6/12 = <strong>$3,000</strong></Bullet>
        <Callout type="warning">Si no recibes tu aguinaldo antes del 20 de diciembre, tu patrón está en violación. Tienes 1 año para reclamarlo ante PROFEDET o el Centro de Conciliación.</Callout>
      </div>
    );
    case "ptu": return (
      <div>
        <Body><strong>Art. 117-131 LFT:</strong> Los trabajadores tienen derecho al <strong>10% de las utilidades</strong> de la empresa.</Body>
        <H2>¿Cuándo se paga?</H2>
        <Body>Entre mayo y junio — dentro de los 60 días siguientes a la declaración anual.</Body>
        <H2>¿Quién NO recibe PTU?</H2>
        <Bullet>Directores generales y administradores únicos</Bullet>
        <Bullet>Socios o accionistas</Bullet>
        <Bullet>Trabajadores domésticos</Bullet>
        <Bullet>Menos de 60 días en la empresa</Bullet>
        <H2>Tope (reforma 2021)</H2>
        <Body>Máximo: 3 meses de salario o promedio de PTU de los últimos 3 años (el que sea mayor).</Body>
        <Callout type="info">Si tu empresa dice que no tuvo utilidades, tiene que mostrarte la declaración fiscal. Tienes derecho a revisarla (Art. 121).</Callout>
      </div>
    );
    case "despido": return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:mobile?16:24}}>
          <div>
            <H2>Finiquito — siempre aplica</H2>
            <Body>Sin importar la razón de la terminación:</Body>
            <Bullet>Salario devengado y no pagado</Bullet>
            <Bullet>Aguinaldo proporcional</Bullet>
            <Bullet>Vacaciones proporcionales + prima vacacional</Bullet>
            <Bullet>Cualquier otra prestación pendiente</Bullet>
            <Body>Debe pagarse en <strong>3 días hábiles</strong>.</Body>
          </div>
          <div>
            <H2>Liquidación — despido injustificado</H2>
            <Body>Además del finiquito:</Body>
            <Bullet><strong>Art. 48:</strong> 3 meses de salario</Bullet>
            <Bullet><strong>Art. 50:</strong> 20 días por año trabajado</Bullet>
            <Bullet><strong>Art. 162:</strong> Prima antigüedad: 12 días/año (tope 2× SM)</Bullet>
          </div>
        </div>
        <Callout type="error">Art. 47: Si tu patrón NO te da aviso ESCRITO con la causa del despido al momento de correrte, el despido se presume AUTOMÁTICAMENTE injustificado.</Callout>
        <H2>Ejemplo ($400/día, 5 años)</H2>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:12,maxWidth:600}}>
          {[["3 meses","$36,000"],["20 días × 5","$40,000"],["Prima","$24,000"],["Total","~$100,000"]].map(([l,v],i)=>(
            <div key={i} style={{background:i===3?"#EBF4FF":C.surface,border:`1px solid ${i===3?"#B6D4FE":C.border}`,borderRadius:8,padding:"10px 14px",textAlign:"center"}}>
              <div style={{fontSize:11,color:C.textSec}}>{l}</div>
              <div style={{fontSize:16,fontWeight:700,color:i===3?C.info:C.primary,fontFamily:mono}}>{v}</div>
            </div>
          ))}
        </div>
        <Callout type="warning">NUNCA firmes nada al momento del despido. Llévate el papel, consulta a PROFEDET. Tienes 2 meses para presentar tu demanda.</Callout>
      </div>
    );
    case "alertas": return (
      <div>
        <Body>Si tu patrón hace cualquiera de estas cosas, está violando la ley:</Body>
        <div style={{columns:mobile?"1":"2",columnGap:32,columnRule:mobile?"none":`1px solid ${C.border}`,margin:"12px 0"}}>{ALERTAS.map((a,i)=><div key={i} style={{breakInside:"avoid"}}><Bullet>{a}</Bullet></div>)}</div>
        <Callout type="error">Si cualquiera de estas te pasa, ve a "¿Qué Hago?" o llama a PROFEDET: 800 911 7877.</Callout>
      </div>
    );
    case "quehago": return (
      <div>
        <Body>Si tu patrón viola tus derechos, no te quedes callado. Plan de acción:</Body>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr 1fr",gap:14,margin:"16px 0"}}>
          {[
            ["1. Documenta todo","Screenshots de mensajes, fotos de horarios, copias de nómina, WhatsApps con hora de entrada/salida."],
            ["2. Habla con tu patrón","Algunos problemas se resuelven cuando demuestras que conoces tus derechos. Cita los artículos."],
            ["3. PROFEDET","800 911 7877. Gratis, confidencial, nacional. Te asesoran y representan sin costo."],
            ["4. Conciliación Laboral","Obligatorio antes de juicio. Un conciliador media entre tú y tu patrón."],
            ["5. Tribunal Laboral","Si conciliación falla. PROFEDET puede ser tu abogado gratis."],
            ["6. Denuncia STPS","Violaciones sistemáticas de la empresa. Puede ser anónima."],
          ].map(([t,d],i)=>(
            <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 18px"}}>
              <div style={{fontSize:14,fontWeight:700,color:C.primary,marginBottom:6}}>{t}</div>
              <div style={{fontSize:13,lineHeight:1.55,color:C.textSec}}>{d}</div>
            </div>
          ))}
        </div>
        <Callout type="success">La ley laboral en México protege al trabajador. En caso de duda, la ley te favorece. No tengas miedo de exigir lo que te corresponde.</Callout>
      </div>
    );
    case "privacidad": return (
      <div style={{maxWidth:600}}>
        <Body><strong>Responsable:</strong> {T.privResp}</Body>
        <Body>Esta guía es un documento informativo y educativo. <strong>No se recopila, almacena ni transmite ningún dato personal.</strong></Body>
        <Body>No contiene formularios, rastreadores ni mecanismos de recolección de datos. Los cálculos se realizan en tu dispositivo.</Body>
        <Body>Aviso en cumplimiento de la LFPDPPP y su Reglamento.</Body>
        <Hr/>
        <Callout type="warning">AVISO LEGAL: Esta guía es informativa. No constituye asesoría legal. Para casos específicos consulta a un abogado laboralista o a PROFEDET (800 911 7877). Referencias: LFT última reforma DOF 15/01/2026, Constitución Art. 123 Apartado A.</Callout>
      </div>
    );
    default: return null;
  }
}

function GuiaTab({mobile, tone}) {
  const [active, setActive] = useState("glosario");

  if (mobile) {
    return (
      <div style={{padding:"20px 16px"}}>
        {/* Horizontal scrollable chapter tabs */}
        <div style={{display:"flex",gap:8,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:12,marginBottom:16}}>
          {CHAPTERS.map(c=>(
            <button key={c.id} onClick={()=>setActive(c.id)} style={{
              flexShrink:0,padding:"8px 16px",fontSize:12,fontWeight:active===c.id?700:500,
              background:active===c.id?C.primary:"transparent",color:active===c.id?"#fff":C.textSec,
              border:`1px solid ${active===c.id?C.primary:C.border}`,borderRadius:20,
              cursor:"pointer",fontFamily:font,whiteSpace:"nowrap",transition:"all .12s"
            }}>{c.title}</button>
          ))}
        </div>
        <Label>CAPÍTULO {CHAPTERS.find(c=>c.id===active)?.ch}</Label>
        <H1>{CHAPTERS.find(c=>c.id===active)?.title}</H1>
        <Hr/>
        {renderChapter(active, true, tone)}
      </div>
    );
  }

  return (
    <div style={{display:"flex",gap:0,minHeight:"70vh"}}>
      {/* Chapter sidebar */}
      <div style={{width:240,flexShrink:0,borderRight:`1px solid ${C.border}`,paddingTop:8}}>
        {CHAPTERS.map(c=>(
          <div key={c.id} onClick={()=>setActive(c.id)} style={{
            padding:"10px 20px",cursor:"pointer",
            background:active===c.id?C.surface:"transparent",
            borderLeft:active===c.id?`3px solid ${C.primary}`:"3px solid transparent",
            transition:"all .12s"
          }}>
            <div style={{fontFamily:mono,fontSize:9,color:C.secondary,letterSpacing:1.2,textTransform:"uppercase"}}>Cap. {c.ch}</div>
            <div style={{fontSize:13,fontWeight:active===c.id?700:500,color:active===c.id?C.primary:C.textSec,marginTop:1}}>{c.title}</div>
          </div>
        ))}
      </div>
      {/* Chapter content */}
      <div style={{flex:1,padding:"24px 36px",overflow:"auto"}}>
        <Label>CAPÍTULO {CHAPTERS.find(c=>c.id===active)?.ch}</Label>
        <H1>{CHAPTERS.find(c=>c.id===active)?.title}</H1>
        <Hr/>
        {renderChapter(active, false, tone)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// CALCULADORA TAB
// ═══════════════════════════════════════
function CalcTab({mobile}) {
  // D-14: default to prestaciones mode
  const [mode, setMode] = useState("prestaciones");
  // D-10: shared salary inputs across all modes
  const [salarioAmt, setSalarioAmt] = useState("");
  const [frequency, setFrequency] = useState("mensual"); // D-08: default mensual
  const [startMonth, setStartMonth] = useState(""); // D-09
  const [startYear, setStartYear] = useState("");   // D-09
  // Horas Extra mode state
  const [horasExtra, setHorasExtra] = useState("");
  const [jornada, setJornada] = useState("8");
  // Prestaciones mode state
  const [trabajaDomingos, setTrabajaDomingos] = useState(false); // D-06
  const [ptuAmt, setPtuAmt] = useState("");            // D-03
  const [noConozcoSDI, setNoConozcoSDI] = useState(false); // D-02
  const [contractualItems, setContractualItems] = useState([]); // D-04
  const [showContractual, setShowContractual] = useState(false); // D-04
  const [viewMode, setViewMode] = useState("anual");   // D-11
  const [usaNeto, setUsaNeto] = useState(false);        // gross vs net salary toggle
  // Comparacion mode state
  const [salarioRegistrado, setSalarioRegistrado] = useState("");
  const [usaMinimo, setUsaMinimo] = useState(true); // default ON — fills registrado with SALARIO_MINIMO_DIARIO

  // Derived values (D-15)
  const salarioDia = toSalarioDia(salarioAmt, frequency);
  const seniority = calcSeniority(parseInt(startMonth), parseInt(startYear));

  const fmt = (n) => "$" + n.toLocaleString("es-MX",{minimumFractionDigits:2,maximumFractionDigits:2});
  const inp = {padding:"12px 16px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:16,fontFamily:font,background:C.surface,color:C.text,boxSizing:"border-box",outline:"none",width:"100%"};

  const calcExtras = () => {
    const sd=salarioDia,he=parseFloat(horasExtra)||0,j=parseFloat(jornada)||8;
    const hn=sd/j,d=Math.min(he,9),tr=Math.max(0,he-9);
    return {hn,d,tr,pd:d*hn*2,pt:tr*hn*3,total:d*hn*2+tr*hn*3};
  };

  const mBtn = (m,label) => (
    <button onClick={()=>setMode(m)} style={{padding:"12px 32px",fontSize:14,fontWeight:mode===m?700:400,background:mode===m?C.primary:"transparent",color:mode===m?"#fff":C.textSec,border:`1.5px solid ${mode===m?C.primary:C.border}`,borderRadius:8,cursor:"pointer",fontFamily:font,transition:"all .15s"}}>{label}</button>
  );

  // Month options for start date dropdown
  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({length:currentYear-1999},(_,i)=>currentYear-i);

  return (
    <div>
      <Label>CALCULADORA</Label>
      <H1>Calcula lo que te deben</H1>
      <Hr/>

      {/* Shared salary inputs — always visible above mode buttons (D-10, D-15) */}
      <div style={{marginBottom:24,padding:20,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:13,color:C.textSec,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
            <input type="checkbox" checked={usaNeto} onChange={e=>{setUsaNeto(e.target.checked);setSalarioAmt("");}} style={{width:16,height:16,cursor:"pointer"}}/>
            No conozco mi salario bruto (uso mi salario neto)
          </label>
        </div>
        {usaNeto && (
          <Callout type="warning">
            <b>Resultados aproximados.</b> Las prestaciones de ley se calculan sobre el salario bruto (antes de deducciones de IMSS, ISR e Infonavit). Al usar tu salario neto, los montos reales pueden ser mayores. Para encontrar tu salario bruto, revisa tu recibo de nomina en la linea "Percepciones totales", o pregunta a Recursos Humanos.
          </Callout>
        )}
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:16,marginBottom:16}}>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:C.text,display:"block",marginBottom:6}}>{usaNeto?"Tu salario neto ($)":"Tu salario bruto ($)"}</label>
            <input type="text" inputMode="decimal" value={salarioAmt} onChange={e=>{const v=e.target.value.replace(/[^0-9.]/g,"");setSalarioAmt(v);}} placeholder={usaNeto?"Ej: 10000":"Ej: 12000"} style={{...inp,...(salarioAmt&&!parseFloat(salarioAmt)?{borderColor:C.error}:{})}}/>
            {salarioAmt&&!parseFloat(salarioAmt)&&<div style={{fontSize:12,color:C.error,marginTop:4}}>Ingresa solo numeros</div>}
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:C.text,display:"block",marginBottom:6}}>Frecuencia de pago</label>
            <select value={frequency} onChange={e=>setFrequency(e.target.value)} style={{...inp,appearance:"auto"}}>
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:C.text,display:"block",marginBottom:6}}>Mes de ingreso</label>
            <select value={startMonth} onChange={e=>setStartMonth(e.target.value)} style={{...inp,appearance:"auto"}}>
              <option value="">-- Mes --</option>
              {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:C.text,display:"block",marginBottom:6}}>Año de ingreso</label>
            <select value={startYear} onChange={e=>setStartYear(e.target.value)} style={{...inp,appearance:"auto"}}>
              <option value="">-- Año --</option>
              {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {seniority && seniority.totalMonths > 0 && (
          <div style={{fontSize:13,color:C.textSec,marginTop:10}}>
            Antiguedad: {seniority.completedYears} {seniority.completedYears===1?"año":"años"}, {seniority.totalMonths%12} {(seniority.totalMonths%12)===1?"mes":"meses"}
          </div>
        )}
      </div>

      {/* Mode buttons — D-14 */}
      <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap"}}>
        {mBtn("prestaciones","Prestaciones")}
        {mBtn("extras","Horas Extra")}
        {mBtn("despido","Despido / Renuncia")}
        {mBtn("comparacion","Nomina Real vs Minimo")}
      </div>

      {/* Despido / Renuncia mode — full-width comparison (D-12, D-13) */}
      {mode==="despido" && (() => {
        // Empty state
        if (!salarioDia || salarioDia <= 0 || !seniority) {
          return (
            <div style={{background:C.surface,border:`2px dashed ${C.border}`,borderRadius:12,padding:40,textAlign:"center",color:C.textSec,fontSize:14}}>
              Ingresa tu salario y fecha de ingreso para ver la comparacion
            </div>
          );
        }
        // Edge case: less than 1 month
        if (seniority.totalMonths <= 0) {
          return (
            <Callout type="info">Con menos de un mes trabajado, las prestaciones proporcionales son minimas. Ingresa al menos un mes de antiguedad para ver el calculo.</Callout>
          );
        }

        // Art. 84+89: salario integrado incluye prestaciones contractuales regulares
        const contractualMonthly = contractualItems.reduce((sum,item) => sum + (parseFloat(item.amount)||0), 0);
        const salarioIntegrado = salarioDia + (contractualMonthly / 30);
        const usaSalarioIntegrado = contractualMonthly > 0;
        const liq = calcLiquidacion(salarioIntegrado, seniority);
        const fin = calcFiniquito(salarioIntegrado, seniority);
        // Despido total: liquidacion (t3 + v20 + primaAnt) + finiquito sin primaAnt (evitar doble conteo)
        const despidoTotal = liq.total + fin.aguinaldoProp + fin.vacProp + fin.primaVacProp;
        // Renuncia total: calcFiniquito.total (incluye primaAnt solo si >= 15 años)
        const renunciaTotal = fin.total;

        return (
          <div>
            {/* Contractual benefits for salary integration — Art. 84 */}
            <div style={{marginBottom:20}}>
              <button onClick={()=>setShowContractual(!showContractual)} style={{fontSize:13,color:C.primary,background:"transparent",border:"none",cursor:"pointer",fontFamily:font,padding:0,fontWeight:600}}>
                {showContractual ? "− Prestaciones contractuales (Art. 84)" : "+ Agregar prestaciones contractuales (Art. 84)"}
              </button>
              {showContractual && (
                <div style={{marginTop:12,padding:16,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8}}>
                  <div style={{fontSize:12,color:C.textSec,marginBottom:10}}>Art. 84 y 89 LFT: las prestaciones regulares se integran al salario para calcular indemnizaciones. <b>No incluyas PTU</b> — la participacion de utilidades no se integra al salario (Art. 129 LFT).</div>
                  {contractualItems.map((item,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                      <input type="text" placeholder="Ej: Vales de despensa" value={item.label} onChange={e=>{const next=[...contractualItems];next[i]={...next[i],label:e.target.value};setContractualItems(next);}} style={{...inp,flex:1}}/>
                      <input type="text" inputMode="decimal" placeholder="$/mes" value={item.amount} onChange={e=>{const next=[...contractualItems];next[i]={...next[i],amount:e.target.value.replace(/[^0-9.]/g,"")};setContractualItems(next);}} style={{...inp,width:100,flexShrink:0}}/>
                      <button onClick={()=>setContractualItems(contractualItems.filter((_,j)=>j!==i))} style={{padding:"8px 12px",fontSize:14,color:C.error,background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",fontFamily:font,flexShrink:0}}>x</button>
                    </div>
                  ))}
                  <button onClick={()=>setContractualItems([...contractualItems,{label:"",amount:""}])} style={{fontSize:13,color:C.primary,background:"transparent",border:"none",cursor:"pointer",fontFamily:font,padding:"4px 0"}}>+ Agregar otra</button>
                </div>
              )}
              {usaSalarioIntegrado && (
                <div style={{fontSize:12,color:C.info,marginTop:6}}>Salario integrado: {fmt(salarioIntegrado)}/día (base {fmt(salarioDia)} + prestaciones {fmt(contractualMonthly/30)}/día)</div>
              )}
            </div>

            {/* Side-by-side columns — D-12 */}
            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:mobile?24:32}}>

              {/* Despido column */}
              <div style={{background:"#FFF0F0",border:"1px solid #E8A3A3",borderRadius:12,padding:24}}>
                <div style={{fontFamily:mono,fontSize:11,color:C.error,letterSpacing:2,marginBottom:16}}>TE DESPIDEN (INJUSTIFICADO)</div>

                {/* Seccion 1: Indemnizacion */}
                <div style={{fontFamily:mono,fontSize:10,color:C.textSec,letterSpacing:1.5,marginBottom:8}}>INDEMNIZACION</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.text,marginBottom:4}}>
                  <span>3 meses de salario (Art. 48)</span>
                  <span style={{fontFamily:mono}}>{fmt(liq.t3)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.text,marginBottom:4}}>
                  <span>20 días por año — {seniority.completedYears} {seniority.completedYears===1?"año":"años"} (Art. 50)</span>
                  <span style={{fontFamily:mono}}>{fmt(liq.v20)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.text,marginBottom:4}}>
                  <span>Prima de antiguedad (Art. 162)</span>
                  <span style={{fontFamily:mono}}>{fmt(liq.primaAnt)}</span>
                </div>

                <Hr/>

                {/* Seccion 2: Finiquito */}
                <div style={{fontFamily:mono,fontSize:10,color:C.textSec,letterSpacing:1.5,marginBottom:8}}>FINIQUITO</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.text,marginBottom:4}}>
                  <span>Aguinaldo proporcional (Art. 87)</span>
                  <span style={{fontFamily:mono}}>{fmt(fin.aguinaldoProp)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.text,marginBottom:4}}>
                  <span>Vacaciones proporcionales (Art. 76)</span>
                  <span style={{fontFamily:mono}}>{fmt(fin.vacProp)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.text,marginBottom:4}}>
                  <span>Prima vacacional prop. (Art. 80)</span>
                  <span style={{fontFamily:mono}}>{fmt(fin.primaVacProp)}</span>
                </div>

                <Hr/>

                <div style={{fontSize:28,fontWeight:700,color:C.primary,fontFamily:mono}}>{fmt(despidoTotal)}</div>
                <div style={{fontSize:12,color:C.textSec,marginTop:6}}>Total si te despiden</div>
                <div style={{fontSize:11,color:C.warning,marginTop:8,fontWeight:600}}>
                  {"* Prima con tope de 2x salario minimo ($" + PRIMA_ANTIGUEDAD_TOPE.toFixed(2) + "/dia)"}
                </div>
              </div>

              {/* Renuncia column */}
              <div style={{background:"#EEFBEE",border:"1px solid #A5D6A7",borderRadius:12,padding:24}}>
                <div style={{fontFamily:mono,fontSize:11,color:C.success,letterSpacing:2,marginBottom:16}}>RENUNCIAS VOLUNTARIAMENTE</div>

                {/* Finiquito */}
                <div style={{fontFamily:mono,fontSize:10,color:C.textSec,letterSpacing:1.5,marginBottom:8}}>FINIQUITO</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.text,marginBottom:4}}>
                  <span>Aguinaldo proporcional (Art. 87)</span>
                  <span style={{fontFamily:mono}}>{fmt(fin.aguinaldoProp)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.text,marginBottom:4}}>
                  <span>Vacaciones proporcionales (Art. 76)</span>
                  <span style={{fontFamily:mono}}>{fmt(fin.vacProp)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.text,marginBottom:4}}>
                  <span>Prima vacacional prop. (Art. 80)</span>
                  <span style={{fontFamily:mono}}>{fmt(fin.primaVacProp)}</span>
                </div>
                {seniority.completedYears >= 15 ? (
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.text,marginBottom:4}}>
                    <span>Prima de antiguedad (Art. 162)</span>
                    <span style={{fontFamily:mono}}>{fmt(fin.primaAnt)}</span>
                  </div>
                ) : (
                  <div style={{fontSize:11,color:C.textSec,marginTop:8,fontStyle:"italic"}}>
                    Prima de antiguedad: solo aplica con 15+ años de servicio (Art. 162)
                  </div>
                )}

                <Hr/>

                <div style={{fontSize:28,fontWeight:700,color:C.primary,fontFamily:mono}}>{fmt(renunciaTotal)}</div>
                <div style={{fontSize:12,color:C.textSec,marginTop:6}}>Total si renuncias</div>
              </div>
            </div>

            {/* Difference callout */}
            <Callout type="warning">
              {"Diferencia: " + fmt(despidoTotal - renunciaTotal) + " \u2014 esto es lo que pierdes si renuncias en vez de que te despidan injustificadamente."}
            </Callout>
          </div>
        );
      })()}

      {/* Comparacion: Nomina Real vs Minimo — full-width layout */}
      {mode==="comparacion" && (() => {
        const sdRegistrado = usaMinimo ? SALARIO_MINIMO_DIARIO : (parseFloat(salarioRegistrado) || 0);

        if (!salarioDia || salarioDia <= 0 || !seniority) {
          return (
            <div style={{background:C.surface,border:`2px dashed ${C.border}`,borderRadius:12,padding:40,textAlign:"center",color:C.textSec,fontSize:14}}>
              Ingresa tu salario y fecha de ingreso arriba
            </div>
          );
        }
        if (seniority.totalMonths <= 0) {
          return <Callout type="info">Ingresa al menos un mes de antiguedad.</Callout>;
        }

        // Registered salary input card
        const registradoCard = (
          <div style={{marginBottom:20,padding:16,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
            <div style={{fontSize:12,fontFamily:mono,color:C.info,marginBottom:10}}>
              Tu salario diario: {fmt(salarioDia)} ({salarioAmt} {frequency})
            </div>
            <label style={{fontSize:13,fontWeight:600,color:C.text,display:"block",marginBottom:10}}>
              Salario diario registrado en el IMSS
            </label>
            <label style={{fontSize:13,color:C.textSec,cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginBottom:usaMinimo?0:12}}>
              <input type="checkbox" checked={usaMinimo}
                onChange={e=>{setUsaMinimo(e.target.checked);if(e.target.checked)setSalarioRegistrado("");}}
                style={{width:16,height:16,cursor:"pointer"}}/>
              Registrado con el minimo (${SALARIO_MINIMO_DIARIO.toFixed(2)}/dia)
            </label>
            {!usaMinimo && (
              <input type="text" inputMode="decimal"
                value={salarioRegistrado}
                onChange={e=>setSalarioRegistrado(e.target.value.replace(/[^0-9.]/g,""))}
                placeholder="Ej: 200"
                style={inp}/>
            )}
          </div>
        );

        if (salarioDia <= sdRegistrado) {
          return (
            <div>
              {registradoCard}
              <Callout type="info">Tu salario real es igual o menor al registrado. No hay diferencia que mostrar.</Callout>
            </div>
          );
        }

        const comp = calcComparacion(salarioDia, sdRegistrado, seniority); // comparacion: real vs registrado

        const conceptos = [
          { label: "Aguinaldo (Art. 87)", key: "aguinaldo" },
          { label: "Vacaciones (Art. 76)", key: "vacPago" },
          { label: "Prima Vacacional (Art. 80)", key: "primaVac" },
          { label: "Liquidacion 3 meses (Art. 48)", key: "liq3meses" },
          { label: "Liquidacion 20d/anio (Art. 50)", key: "liq20dias" },
          { label: "Prima Antiguedad (Art. 162)", key: "primaAnt" },
          { label: "Credito Infonavit (est.)", key: "infonavit" },
        ];

        const totalReal = Object.values(comp.real).reduce((a,b)=>a+b,0);
        const totalReg  = Object.values(comp.registrado).reduce((a,b)=>a+b,0);

        return (
          <div>
            {registradoCard}

            {/* Desktop table */}
            {!mobile && (
              <div style={{background:"#FFF0F0",border:"1px solid #E8A3A3",borderRadius:12,padding:24,marginBottom:20,overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr>
                      {["Concepto","Salario Real","Registrado IMSS","Lo que pierdes"].map((h,i)=>(
                        <th key={i} style={{fontFamily:mono,fontSize:11,letterSpacing:1.5,color:C.textSec,textAlign:i===0?"left":"right",padding:"0 8px 12px",borderBottom:`1px solid #E8A3A3`}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {conceptos.map(({label,key})=>(
                      <tr key={key}>
                        <td style={{fontSize:13,color:C.text,padding:"8px 8px",borderBottom:`1px solid #F5D5D5`}}>{label}</td>
                        <td style={{fontSize:13,fontFamily:mono,color:C.text,textAlign:"right",padding:"8px 8px",borderBottom:`1px solid #F5D5D5`}}>{fmt(comp.real[key])}</td>
                        <td style={{fontSize:13,fontFamily:mono,color:C.text,textAlign:"right",padding:"8px 8px",borderBottom:`1px solid #F5D5D5`}}>{fmt(comp.registrado[key])}</td>
                        <td style={{fontSize:13,fontFamily:mono,color:C.error,fontWeight:700,textAlign:"right",padding:"8px 8px",borderBottom:`1px solid #F5D5D5`}}>-{fmt(comp.diferencia[key])}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{fontSize:15,fontWeight:700,color:C.text,padding:"14px 8px 0",borderTop:`2px solid #E8A3A3`}}>TOTAL</td>
                      <td style={{fontSize:15,fontFamily:mono,fontWeight:700,color:C.text,textAlign:"right",padding:"14px 8px 0",borderTop:`2px solid #E8A3A3`}}>{fmt(totalReal)}</td>
                      <td style={{fontSize:15,fontFamily:mono,fontWeight:700,color:C.text,textAlign:"right",padding:"14px 8px 0",borderTop:`2px solid #E8A3A3`}}>{fmt(totalReg)}</td>
                      <td style={{fontSize:15,fontFamily:mono,fontWeight:700,color:C.error,textAlign:"right",padding:"14px 8px 0",borderTop:`2px solid #E8A3A3`}}>-{fmt(comp.diferencia.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile stacked cards */}
            {mobile && (
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:mono,fontSize:11,color:C.textSec,letterSpacing:1.5,marginBottom:12}}>CONCEPTO POR CONCEPTO</div>
                {conceptos.map(({label,key})=>(
                  <div key={key} style={{background:"#FFF0F0",border:"1px solid #E8A3A3",borderRadius:10,padding:14,marginBottom:10}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>{label}</div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSec,marginBottom:4}}>
                      <span>Salario real</span>
                      <span style={{fontFamily:mono,color:C.text}}>{fmt(comp.real[key])}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSec,marginBottom:4}}>
                      <span>Registrado IMSS</span>
                      <span style={{fontFamily:mono,color:C.text}}>{fmt(comp.registrado[key])}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,color:C.error,marginTop:4,paddingTop:6,borderTop:`1px solid #F5D5D5`}}>
                      <span>Pierdes</span>
                      <span style={{fontFamily:mono}}>-{fmt(comp.diferencia[key])}</span>
                    </div>
                  </div>
                ))}
                <div style={{background:"#FFF0F0",border:"2px solid #E8A3A3",borderRadius:10,padding:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700,color:C.error}}>
                    <span>TOTAL QUE PIERDES</span>
                    <span style={{fontFamily:mono}}>-{fmt(comp.diferencia.total)}</span>
                  </div>
                </div>
              </div>
            )}

            <Callout type="error">
              Por estar registrado con el minimo, pierdes {fmt(comp.diferencia.total)} en prestaciones y proteccion laboral.
            </Callout>
            <Callout type="info">
              Si tu patron te registra con un salario menor al real ante el IMSS, esta violando el Art. 15 de la Ley del Seguro Social. Puedes denunciarlo ante el IMSS o acudir a PROFEDET (800 911 7877) para asesoria gratuita.
            </Callout>
          </div>
        );
      })()}

      {/* Prestaciones and Horas Extra modes — 2-col layout (inputs | results) */}
      {mode!=="despido" && mode!=="comparacion" && (
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:mobile?24:40,alignItems:"start"}}>
        {/* Left: mode-specific inputs */}
        <div>
          {mode==="extras" && (
            <div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:13,fontWeight:600,color:C.text,display:"block",marginBottom:6}}>Horas extra en la semana</label>
                <input type="number" value={horasExtra} onChange={e=>setHorasExtra(e.target.value)} placeholder="Ej: 12" style={inp}/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:13,fontWeight:600,color:C.text,display:"block",marginBottom:6}}>Tipo de jornada</label>
                <select value={jornada} onChange={e=>setJornada(e.target.value)} style={{...inp,appearance:"auto"}}>
                  <option value="8">Diurna (8 hrs)</option>
                  <option value="7">Nocturna (7 hrs)</option>
                  <option value="7.5">Mixta (7.5 hrs)</option>
                </select>
              </div>
            </div>
          )}
          {mode==="prestaciones" && (
            <div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:13,fontWeight:600,color:C.text,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                  <input type="checkbox" checked={trabajaDomingos} onChange={e=>setTrabajaDomingos(e.target.checked)}/>
                  Trabajas los domingos?
                </label>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:13,fontWeight:600,color:C.text,display:"block",marginBottom:6}}>PTU recibida (opcional)</label>
                <input type="number" value={ptuAmt} onChange={e=>setPtuAmt(e.target.value)} placeholder="Monto de tu ultimo recibo de PTU" style={inp}/>
                {(!ptuAmt || parseFloat(ptuAmt)===0) && (
                  <Callout type="info">La PTU es el 10% de las utilidades de tu empresa, repartido entre todos los trabajadores. Se paga en mayo. Si tu empresa tuvo ganancias, tienes derecho a recibirla. Pide tu comprobante de pago de PTU.</Callout>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: results */}
        <div>
          {/* Horas Extra results */}
          {mode==="extras" && salarioDia>0 && horasExtra && (()=>{const r=calcExtras();return(
            <div style={{background:"#EBF4FF",border:`1px solid #B6D4FE`,borderRadius:12,padding:24}}>
              <div style={{fontFamily:mono,fontSize:11,color:C.info,letterSpacing:2,marginBottom:14}}>◆ RESULTADO</div>
              <div style={{fontSize:14,color:C.text,marginBottom:4}}>Hora normal: {fmt(r.hn)}</div>
              <div style={{fontSize:14,color:C.text,marginBottom:4}}>Horas dobles ({r.d} hrs): {fmt(r.pd)}</div>
              {r.tr>0&&<div style={{fontSize:14,color:C.text,marginBottom:4}}>Horas triples ({r.tr} hrs): {fmt(r.pt)}</div>}
              <Hr/>
              <div style={{fontSize:32,fontWeight:700,color:C.primary,fontFamily:mono}}>{fmt(r.total)}</div>
              <div style={{fontSize:12,color:C.textSec,marginTop:6}}>Pago por horas extra esta semana</div>
            </div>
          );})()}
          {mode==="extras" && !(salarioDia>0 && horasExtra) && (
            <div style={{background:C.surface,border:`2px dashed ${C.border}`,borderRadius:12,padding:40,textAlign:"center",color:C.textSec,fontSize:14}}>
              Ingresa los datos para ver el resultado
            </div>
          )}

          {/* Prestaciones mode — D-01, D-02, D-03, D-06, D-11, D-13 */}
          {mode==="prestaciones" && (() => {
            // Insufficient inputs — show empty state
            if (!salarioDia || salarioDia <= 0 || !seniority) {
              return (
                <div style={{background:C.surface,border:`2px dashed ${C.border}`,borderRadius:12,padding:40,textAlign:"center",color:C.textSec,fontSize:14}}>
                  Ingresa tu salario y fecha de ingreso para ver tus prestaciones
                </div>
              );
            }
            // Edge case: less than 1 month
            if (seniority.totalMonths <= 0) {
              return (
                <Callout type="info">Con menos de un mes trabajado, las prestaciones proporcionales son minimas. Ingresa al menos un mes de antiguedad para ver el calculo.</Callout>
              );
            }

            const prestResult = calcPrestaciones(salarioDia, seniority, trabajaDomingos);
            const sdiResult = calcSDI(salarioDia, seniority.completedYears);
            const divisor = viewMode === "mensual" ? 12 : 1;
            const ptu = parseFloat(ptuAmt) || 0;
            const contractualMonthly = contractualItems.reduce((sum,item) => sum + (parseFloat(item.amount)||0), 0);
            const grandTotal = viewMode === "mensual"
              ? (prestResult.subtotal / 12) + (ptu / 12) + contractualMonthly
              : prestResult.subtotal + ptu + (contractualMonthly * 12);

            return (
              <div>
                {/* Annual/monthly toggle — D-11 */}
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <button onClick={()=>setViewMode("anual")} style={{padding:"6px 16px",fontSize:12,fontWeight:viewMode==="anual"?700:400,background:viewMode==="anual"?C.primary:"transparent",color:viewMode==="anual"?"#fff":C.textSec,border:`1px solid ${viewMode==="anual"?C.primary:C.border}`,borderRadius:6,cursor:"pointer",fontFamily:font}}>Anual</button>
                  <button onClick={()=>setViewMode("mensual")} style={{padding:"6px 16px",fontSize:12,fontWeight:viewMode==="mensual"?700:400,background:viewMode==="mensual"?C.primary:"transparent",color:viewMode==="mensual"?"#fff":C.textSec,border:`1px solid ${viewMode==="mensual"?C.primary:C.border}`,borderRadius:6,cursor:"pointer",fontFamily:font}}>Mensual</button>
                </div>

                {/* Results card */}
                <div style={{background:"#FFF8EB",border:"1px solid #E8D5A3",borderRadius:12,padding:24}}>
                  <div style={{fontFamily:mono,fontSize:11,color:C.warning,letterSpacing:2,marginBottom:14}}>
                    ◆ PRESTACIONES {viewMode==="anual"?"ANUALES":"MENSUALES"}
                  </div>

                  {/* Itemized lines — D-01 */}
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:C.text,marginBottom:4}}>
                    <span>Aguinaldo — {AGUINALDO_DIAS} dias (Art. 87)</span>
                    <span>{fmt(prestResult.aguinaldo / divisor)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:C.text,marginBottom:4}}>
                    <span>Vacaciones — {prestResult.vacDays} dias (Art. 76)</span>
                    <span>{fmt(prestResult.vacPago / divisor)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:C.text,marginBottom:4}}>
                    <span>Prima Vacacional — {Math.round(PRIMA_VACACIONAL_PCT*100)}% (Art. 80)</span>
                    <span>{fmt(prestResult.primaVac / divisor)}</span>
                  </div>
                  {/* Prima Dominical gated by toggle — D-06 */}
                  {trabajaDomingos && (
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:C.text,marginBottom:4}}>
                      <span>Prima Dominical — 52 domingos (Art. 71)</span>
                      <span>{fmt(prestResult.primaDom / divisor)}</span>
                    </div>
                  )}
                  {ptu > 0 && (
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:C.text,marginBottom:4}}>
                      <span>PTU (Art. 117-131)</span>
                      <span>{fmt(ptu / divisor)}</span>
                    </div>
                  )}
                  <Hr/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>
                    <span>SUBTOTAL LEGAL</span>
                    <span>{fmt((prestResult.subtotal + ptu) / divisor)}</span>
                  </div>

                  {/* Prima Dominical toggle inside card — D-06 */}
                  <div style={{marginTop:12}}>
                    <label style={{fontSize:13,fontWeight:600,color:C.text,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                      <input type="checkbox" checked={trabajaDomingos} onChange={e=>setTrabajaDomingos(e.target.checked)}/>
                      Trabajas los domingos?
                    </label>
                  </div>

                  <Hr/>

                  {/* SDI section — D-02 */}
                  <div style={{fontFamily:mono,fontSize:11,color:C.textSec,letterSpacing:1.5,marginBottom:8}}>SALARIO DIARIO INTEGRADO (IMSS)</div>
                  <div style={{fontSize:13,color:C.textSec,marginBottom:4}}>Factor de integracion: {sdiResult.fi.toFixed(4)}</div>
                  <div style={{fontSize:16,fontWeight:600,color:C.text}}>SDI estimado: {fmt(sdiResult.sdi)} / dia</div>
                  <label style={{fontSize:12,color:C.textSec,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginTop:8}}>
                    <input type="checkbox" checked={noConozcoSDI} onChange={e=>setNoConozcoSDI(e.target.checked)}/>
                    No lo conozco
                  </label>
                  {noConozcoSDI && (
                    <Callout type="info">Pidelo a Recursos Humanos, consultalo en el portal del IMSS (idse.imss.gob.mx) o revisa tu recibo de nomina — debe decir 'SBC' o 'Salario Base de Cotizacion'. El valor arriba es un estimado basado en tus prestaciones minimas de ley.</Callout>
                  )}

                  <Hr/>

                  {/* Grand total — D-13 */}
                  <div style={{fontSize:32,fontWeight:700,color:C.primary,fontFamily:mono}}>{fmt(grandTotal)}</div>
                  <div style={{fontSize:12,color:C.textSec,marginTop:6}}>{"Total estimado " + (viewMode==="mensual"?"al mes":"al año")}</div>
                </div>

                {/* Contractual benefits — D-04 */}
                <div style={{marginTop:16}}>
                  {!showContractual ? (
                    <button
                      onClick={()=>{setShowContractual(true);setContractualItems([{label:"",amount:""}]);}}
                      style={{width:"100%",padding:"12px 16px",fontSize:14,color:C.textSec,background:"transparent",border:`1.5px dashed ${C.border}`,borderRadius:8,cursor:"pointer",fontFamily:font}}
                    >+ Agregar prestaciones contractuales</button>
                  ) : (
                    <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:16}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Prestaciones contractuales</div>
                      {contractualItems.map((item,i)=>(
                        <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                          <input
                            type="text"
                            value={item.label}
                            onChange={e=>{const next=[...contractualItems];next[i]={...next[i],label:e.target.value};setContractualItems(next);}}
                            placeholder="Nombre (ej: Vales)"
                            style={{...inp,flex:2}}
                          />
                          <input
                            type="number"
                            value={item.amount}
                            onChange={e=>{const next=[...contractualItems];next[i]={...next[i],amount:e.target.value};setContractualItems(next);}}
                            placeholder="$ monto mensual"
                            style={{...inp,flex:1}}
                          />
                          <button onClick={()=>setContractualItems(contractualItems.filter((_,j)=>j!==i))} style={{padding:"8px 12px",fontSize:14,color:C.error,background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",fontFamily:font,flexShrink:0}}>x</button>
                        </div>
                      ))}
                      <button onClick={()=>setContractualItems([...contractualItems,{label:"",amount:""}])} style={{fontSize:13,color:C.primary,background:"transparent",border:"none",cursor:"pointer",fontFamily:font,padding:"4px 0"}}>+ Agregar otra</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      )}
      <Callout type="info">Estimacion referencial. Para calculo exacto usa conciliacionlaboral.org.mx o consulta a PROFEDET.</Callout>
    </div>
  );
}

// ═══════════════════════════════════════
// PREGUNTAS TAB
// ═══════════════════════════════════════
function PreguntasTab({mobile}) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div>
      <Label>PREGUNTAS FRECUENTES</Label>
      <H1>Lo que más preguntan</H1>
      <Hr/>
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:"0 32px"}}>
        {FAQS.map(([q,a],i)=>(
          <div key={i} style={{borderBottom:`1px solid ${C.border}`,padding:"16px 0",cursor:"pointer"}} onClick={()=>setOpenIdx(openIdx===i?null:i)}>
            <div style={{fontSize:15,fontWeight:600,color:C.text,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <span>{q}</span>
              <span style={{color:C.secondary,fontSize:14,transform:openIdx===i?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0,marginTop:3}}>▾</span>
            </div>
            {openIdx===i&&<div style={{fontSize:14,lineHeight:1.65,color:C.textSec,marginTop:12}}>{a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// RECURSOS TAB
// ═══════════════════════════════════════
function RecursosTab({mobile}) {
  return (
    <div>
      <Label>RECURSOS</Label>
      <H1>Contactos y Recursos</H1>
      <Hr/>
      {Object.entries(RECURSOS).map(([category, items])=>(
        <div key={category} style={{marginBottom:28}}>
          <H2>{category}</H2>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(3,1fr)",gap:14}}>
            {items.map(([name,contact,desc,telLink,webLink],i)=>(
              <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 20px"}}>
                <div style={{fontSize:16,fontWeight:700,color:C.primary}}>{name}</div>
                {telLink ? (
                  <a href={telLink} style={{fontSize:14,color:C.secondary,fontFamily:mono,marginTop:4,display:"block",textDecoration:"none"}}>{contact}</a>
                ) : (
                  <div style={{fontSize:14,color:C.secondary,fontFamily:mono,marginTop:4}}>{contact}</div>
                )}
                <div style={{fontSize:13,color:C.textSec,marginTop:4}}>{desc}</div>
                {webLink && <a href={webLink} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.info,marginTop:8,display:"inline-block",textDecoration:"underline"}}>Visitar sitio</a>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Callout type="success">PROFEDET es gratuito y confidencial. Te asesoran y pueden representarte en juicio sin costo. Llama al 800 911 7877.</Callout>
      <div style={{marginTop:24,padding:20,background:C.bg,border:`1px solid ${C.border}`,borderRadius:10}}>
        <div style={{fontFamily:mono,fontSize:11,color:C.textSec,letterSpacing:1.5,marginBottom:8}}>◆ AVISO LEGAL</div>
        <p style={{fontSize:13,lineHeight:1.6,color:C.textSec,margin:0}}>
          Esta guía es informativa y educativa. No constituye asesoría legal. No se recopilan datos personales.
          Consulta a un abogado laboralista o a PROFEDET para casos específicos.
          Basado en la LFT (última reforma DOF 15/01/2026) y la Constitución Art. 123 Apartado A.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// INSTALL BANNER
// ═══════════════════════════════════════
function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      setShowTip(true);
      setTimeout(() => setShowTip(false), 6000);
    }
  };

  return (
    <>
      <div style={{
        background: "linear-gradient(135deg, #1B2A1B 0%, #2d4a2d 100%)",
        color: "#fff",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: font,
        fontSize: 13,
        cursor: "pointer"
      }} onClick={handleInstall}>
        <span style={{ fontSize: 18 }}>📲</span>
        <span>Instala la app — funciona sin internet</span>
        <button style={{
          background: "#F5F1EB", color: C.primary, border: "none",
          borderRadius: 6, padding: "5px 12px", fontWeight: 700,
          fontFamily: font, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap"
        }}>Instalar</button>
      </div>
      {showTip && <div style={{
        background: "#FFF3CD", color: "#664D03", padding: "10px 16px",
        fontFamily: font, fontSize: 13, textAlign: "center", lineHeight: 1.5
      }}>
        En tu navegador, toca <strong>⋮</strong> (menú) → <strong>"Instalar app"</strong> o <strong>"Añadir a pantalla de inicio"</strong>
      </div>}
    </>
  );
}

// ═══════════════════════════════════════
// UPDATE TOAST
// ═══════════════════════════════════════
function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  // Auto-dismiss after 15 seconds per D-06
  useEffect(() => {
    if (!needRefresh) return;
    const timer = setTimeout(() => setNeedRefresh(false), 15000);
    return () => clearTimeout(timer);
  }, [needRefresh, setNeedRefresh]);

  if (!needRefresh) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 16,
      left: "50%",
      transform: "translateX(-50%)",
      background: C.primary,
      color: "#fff",
      borderRadius: 10,
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      zIndex: 9999,
      fontFamily: font,
      fontSize: 14,
      maxWidth: 360,
      width: "calc(100% - 32px)"
    }}>
      <span style={{ flex: 1 }}>Nueva versión disponible</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: "#fff",
          color: C.primary,
          border: "none",
          borderRadius: 6,
          padding: "6px 14px",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: font,
          fontSize: 13
        }}
      >
        Actualizar
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        style={{
          background: "transparent",
          color: "#fff",
          border: "none",
          fontSize: 18,
          cursor: "pointer",
          lineHeight: 1,
          padding: 4
        }}
      >&#x2715;</button>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN
// ═══════════════════════════════════════
export default function NoMeChinguen() {
  const [tab, setTab] = useState("checa");
  const [tone, setTone] = useState("directo");
  const mobile = useIsMobile();
  const px = mobile ? "16px" : "56px";
  const T = TONE_STRINGS[tone];

  const ToneToggle = () => (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:10,fontWeight:600,color:"#DAA520",fontFamily:mono,letterSpacing:1.5,textTransform:"uppercase"}}>Tono</span>
      {["directo","tranquilo"].map(t=>(
        <button key={t} onClick={()=>setTone(t)} style={{
          padding:"5px 14px",fontSize:11,fontWeight:tone===t?700:400,
          background:tone===t?"rgba(255,255,255,0.2)":"transparent",
          color:tone===t?"#fff":"rgba(255,255,255,0.45)",
          border:`1px solid ${tone===t?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.15)"}`,
          borderRadius:20,cursor:"pointer",fontFamily:font,transition:"all .15s",
          letterSpacing:0.3,textTransform:"capitalize"
        }}>{t}</button>
      ))}
    </div>
  );

  return (
    <div style={{fontFamily:font,background:C.bg,color:C.text,minHeight:"100vh"}}>
      <InstallBanner />
      {/* Header */}
      <div style={{background:`linear-gradient(135deg, ${C.primary} 0%, ${C.primaryHover} 100%)`,padding:mobile?"24px 16px 20px":"36px 56px 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",flexDirection:mobile?"column":"row",justifyContent:"space-between",alignItems:mobile?"flex-start":"flex-end",gap:mobile?12:0}}>
          <div>
            <h1 style={{fontSize:mobile?28:38,fontWeight:700,color:"#FFFFFF",margin:"0 0 6px",lineHeight:1.1}}>{T.siteTitle}</h1>
            <p style={{fontSize:mobile?13:15,color:"rgba(255,255,255,0.6)",margin:0}}>{T.siteSub}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:mobile?"flex-start":"flex-end",gap:8}}>
            <ToneToggle/>
            <a
              href="/volante.pdf"
              download="NoMeChinguen-Volante.pdf"
              style={{
                display:"inline-flex",
                alignItems:"center",
                gap:6,
                padding:"5px 14px",
                fontSize:11,
                fontWeight:600,
                color:"rgba(255,255,255,0.85)",
                background:"rgba(255,255,255,0.1)",
                border:"1px solid rgba(255,255,255,0.25)",
                borderRadius:20,
                textDecoration:"none",
                fontFamily:font,
                letterSpacing:0.3,
                transition:"all .15s",
                cursor:"pointer",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.2)";e.currentTarget.style.borderColor="rgba(255,255,255,0.35)"}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.borderColor="rgba(255,255,255,0.25)"}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Descarga el volante
            </a>
            {!mobile && (
              <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",fontFamily:mono,textAlign:"right"}}>
                <div>Salario minimo 2026: $315.04/dia</div>
                <div>LFT ultima reforma DOF 15/01/2026</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",gap:0,padding:`0 ${px}`,overflowX:mobile?"auto":"visible",WebkitOverflowScrolling:"touch"}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{
              padding:mobile?"12px 16px":"14px 24px",fontSize:13,fontWeight:tab===n.id?700:500,
              color:tab===n.id?C.primary:C.textSec,
              background:"transparent",border:"none",
              borderBottom:tab===n.id?`3px solid ${C.primary}`:"3px solid transparent",
              cursor:"pointer",fontFamily:font,transition:"all .12s",letterSpacing:0.3,
              whiteSpace:"nowrap",flexShrink:0
            }}>
              <div>{n.label}</div>
              {!mobile && <div style={{fontSize:10,fontWeight:400,color:tab===n.id?C.secondary:C.border,marginTop:1}}>{n.desc}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:tab==="guia"?"0":`${mobile?"20px":"36px"} ${px} ${mobile?"40px":"80px"}`}}>
        {tab==="checa"&&<ChecaTab onNav={setTab} mobile={mobile} tone={tone}/>}
        {tab==="guia"&&<GuiaTab mobile={mobile} tone={tone}/>}
        {tab==="calc"&&<CalcTab mobile={mobile}/>}
        {tab==="faq"&&<PreguntasTab mobile={mobile}/>}
        {tab==="recursos"&&<RecursosTab mobile={mobile}/>}
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${C.border}`,padding:`20px ${px}`,textAlign:"center",fontSize:12,color:C.textSec}}>
        {T.footer}
      </div>
      <UpdateToast />
    </div>
  );
}

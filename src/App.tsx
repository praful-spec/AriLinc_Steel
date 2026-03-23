// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend,
} from "recharts";

const B = {
  blue:"#1d4ed8", teal:"#0891b2", green:"#059669", purple:"#7c3aed",
  orange:"#d97706", red:"#dc2626", steel:"#475569", silver:"#94a3b8",
  grey:"#f8fafc", border:"#e2e8f0", text:"#0f172a", sub:"#64748b", light:"#94a3b8",
};

const ASSETS = [
  {
    id:"EAF-101", name:"Electric Arc Furnace 1", type:"Steelmaking", location:"Melt Shop",
    icon:"⚡", color:B.red, status:"tapping",
    kpis:{ heatTemp:"1,658°C", heatNumber:"H-4821", tapWeight:"142 t", energyRate:"412 kWh/t" },
    health:82, electrode:{ wear:0.62, replace:0.85, unit:"index" },
    vibration:{ val:3.2, warn:5.0, crit:8.0, unit:"mm/s" },
    temp:{ val:1658, warn:1680, crit:1700, unit:"°C" },
    aiAlert:"Heat H-4821 ready for tapping — 1,658°C, chemistry confirmed. Energy consumption 412 kWh/t vs 398 kWh/t target. AI identifies transformer tap optimization opportunity — Rs 1.2L/heat saving.",
    aiAction:"Optimise",
  },
  {
    id:"LF-201", name:"Ladle Furnace 1", type:"Secondary Metallurgy", location:"Melt Shop",
    icon:"🪣", color:B.orange, status:"refining",
    kpis:{ temperature:"1,612°C", treatment:"Desulphurisation", sulphur:"0.008%", alloyAdd:"18 kg" },
    health:91, electrode:{ wear:0.31, replace:0.85, unit:"index" },
    vibration:{ val:0.8, warn:3.0, crit:5.0, unit:"mm/s" },
    temp:{ val:1612, warn:1650, crit:1680, unit:"°C" },
    aiAlert:"Desulphurisation progressing — sulphur 0.008% vs 0.005% target. AI predicts 4 more minutes treatment needed. All alloy additions complete.",
    aiAction:"Monitoring",
  },
  {
    id:"CC-301", name:"Continuous Caster #1", type:"Casting", location:"Caster Bay",
    icon:"🔩", color:B.blue, status:"casting",
    kpis:{ castSpeed:"1.4 m/min", moldTemp:"278°C", bulge:"0.12 mm", yield:"97.8%" },
    health:88, electrode:{ wear:0, replace:0, unit:"" },
    vibration:{ val:1.8, warn:3.5, crit:6.0, unit:"mm/s" },
    temp:{ val:278, warn:320, crit:360, unit:"°C" },
    aiAlert:"Casting nominal. Mold level variation ±2.1mm — within spec. Strand 2 showing minor oscillation mark irregularity — AI monitoring for surface crack risk.",
    aiAction:"Monitoring",
  },
  {
    id:"HSM-401", name:"Hot Strip Mill", type:"Hot Rolling", location:"Rolling Mill",
    icon:"🏗️", color:B.steel, status:"rolling",
    kpis:{ thickness:"6.5 mm", width:"1,250 mm", rollForce:"2,840 t", coilTemp:"842°C" },
    health:76, electrode:{ wear:0, replace:0, unit:"" },
    vibration:{ val:4.8, warn:4.5, crit:7.5, unit:"mm/s" },
    temp:{ val:842, warn:900, crit:950, unit:"°C" },
    aiAlert:"VIBRATION WARNING: Work roll chatter detected at 4.8 mm/s. Roll wear index 0.74 — approaching 0.80 threshold. Schedule roll change within next 2 coils. Surface quality risk increasing.",
    aiAction:"Action Required",
  },
  {
    id:"HT-501", name:"Heat Treatment Furnace", type:"Heat Treatment", location:"Finishing",
    icon:"🔥", color:B.purple, status:"soaking",
    kpis:{ setPoint:"920°C", actual:"918°C", soakTime:"42 min", throughput:"28 t/hr" },
    health:93, electrode:{ wear:0, replace:0, unit:"" },
    vibration:{ val:0.6, warn:2.0, crit:4.0, unit:"mm/s" },
    temp:{ val:918, warn:950, crit:980, unit:"°C" },
    aiAlert:"Temperature uniformity ±3°C — excellent. Refractory wear index 0.28. AI predicts 94 days to next refractory inspection. Energy efficiency 96.2% of benchmark.",
    aiAction:"Monitoring",
  },
];

const STEEL_GRADES = [
  { grade:"IS 2062 E250", heats:28, quality:"Prime", yield:"98.2%", defects:2, color:B.green },
  { grade:"SAE 1018",     heats:16, quality:"Prime", yield:"97.4%", defects:4, color:B.blue },
  { grade:"SAE 4140",     heats:9,  quality:"Prime", yield:"96.8%", defects:5, color:B.teal },
  { grade:"SS 304",       heats:5,  quality:"Review",yield:"94.1%", defects:12,color:B.orange },
];

const ENERGY_ZONES = [
  { zone:"EAF Melting",     actual:412, target:398, unit:"kWh/t", savings:"Rs 2.8L/day" },
  { zone:"Ladle Heating",   actual:28,  target:26,  unit:"kWh/t", savings:"Rs 0.4L/day" },
  { zone:"Reheat Furnace",  actual:1.42,target:1.35,unit:"GJ/t",  savings:"Rs 1.1L/day" },
  { zone:"Hot Strip Mill",  actual:0.38,target:0.36,unit:"GJ/t",  savings:"Rs 0.6L/day" },
];

const genEnergyTrend = () => Array.from({length:30},(_,i)=>({
  day:`D${i+1}`,
  actual: +(410+Math.random()*18-(i>20?8:0)).toFixed(0),
  target:398,
}));

const genTempTrend = () => Array.from({length:24},(_,i)=>({
  hr:`${i}:00`,
  eaf:  +(1640+Math.sin(i*0.8)*15+Math.random()*8).toFixed(0),
  ladle:+(1610+Math.sin(i*0.6)*12+Math.random()*6).toFixed(0),
}));

const genVibTrend = () => Array.from({length:30},(_,i)=>({
  sample:`S${i+1}`,
  hsm: +(3.8+Math.sin(i*0.5)*0.8+(i>22?0.9:0)+Math.random()*0.3).toFixed(2),
  warn:4.5, crit:7.5,
}));

const genYieldTrend = () => Array.from({length:30},(_,i)=>({
  day:`D${i+1}`,
  prime:  +(96.8+Math.random()*1.8+(i>20?0.6:0)).toFixed(1),
  scrap:  +(1.2+Math.random()*0.8-(i>20?0.3:0)).toFixed(1),
  rework: +(1.8+Math.random()*0.6-(i>20?0.2:0)).toFixed(1),
}));

const ENERGY_TREND = genEnergyTrend();
const TEMP_TREND = genTempTrend();
const VIB_TREND = genVibTrend();
const YIELD_TREND = genYieldTrend();

const StatusPill = ({ status }) => {
  const cfg = {
    tapping: ["#fff5f5","#dc2626","🔴 TAPPING"],
    refining: ["#fffbeb","#d97706","⚡ REFINING"],
    casting:  ["#eff6ff","#1d4ed8","● CASTING"],
    rolling:  ["#fffbeb","#d97706","⚠ ROLLING"],
    soaking:  ["#f0fdf4","#059669","● SOAKING"],
  };
  const [bg,col,lbl] = cfg[status]||["#f8fafc","#94a3b8","—"];
  return <span style={{background:bg,color:col,border:`1px solid ${col}40`,borderRadius:4,padding:"2px 9px",fontSize:10,fontWeight:700,letterSpacing:0.8,whiteSpace:"nowrap"}}>{lbl}</span>;
};

const CT = ({ active, payload, label }) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 14px",fontSize:12,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <div style={{color:"#64748b",fontWeight:600,marginBottom:5}}>{label}</div>
      {payload.map((p,i)=>(<div key={i} style={{color:p.color,fontWeight:600}}>{p.name}: {p.value}</div>))}
    </div>
  );
};

function SignInScreen({ onSubmit }) {
  const [form, setForm] = useState({ name:"", company:"", email:"" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const validate = () => {
    const e = {};
    if(!form.name.trim()) e.name="Required";
    if(!form.company.trim()) e.company="Required";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email="Valid email required";
    return e;
  };
  const handleSubmit = async () => {
    const e = validate(); if(Object.keys(e).length){setErrors(e);return;}
    setSubmitting(true);
    try {
      await fetch("https://formspree.io/f/xqeywrry",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({name:form.name,company:form.company,email:form.email,_subject:`AriLinc Steel Sign-in: ${form.name} from ${form.company}`})});
    } catch(_){}
    onSubmit(form);
  };
  const inp = k => ({width:"100%",padding:"11px 14px",borderRadius:8,fontSize:14,border:`1.5px solid ${errors[k]?"#fca5a5":"rgba(255,255,255,0.25)"}`,outline:"none",fontFamily:"Inter,sans-serif",color:"#0f172a",background:"#fff",marginTop:5});
  const lbl = {fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.75)",letterSpacing:0.3};
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1e293b 0%,#334155 45%,#475569 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Inter,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:64,height:64,background:"rgba(255,255,255,0.12)",borderRadius:16,marginBottom:16,border:"1px solid rgba(255,255,255,0.2)"}}>
            <span style={{fontSize:28}}>🏭</span>
          </div>
          <div style={{fontFamily:"Inter,sans-serif",fontSize:28,fontWeight:800,color:"#fff",marginBottom:4}}>AriLinc</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:2,textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Steel & Metals Intelligence · by AriPrus</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>EAF · Casting · Rolling Mill · Heat Treatment</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(20px)",borderRadius:20,padding:"32px",border:"1px solid rgba(255,255,255,0.15)",boxShadow:"0 24px 64px rgba(0,0,0,0.4)"}}>
          <div style={{fontFamily:"Inter,sans-serif",fontSize:20,fontWeight:800,color:"#fff",marginBottom:4,textAlign:"center"}}>Sign In</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",textAlign:"center",marginBottom:24}}>Access the Steel Intelligence Platform</div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label style={lbl}>Full Name *</label><input style={inp("name")} value={form.name} onChange={set("name")} />{errors.name&&<div style={{fontSize:11,color:"#fca5a5",marginTop:3}}>{errors.name}</div>}</div>
            <div><label style={lbl}>Company *</label><input style={inp("company")} value={form.company} onChange={set("company")} />{errors.company&&<div style={{fontSize:11,color:"#fca5a5",marginTop:3}}>{errors.company}</div>}</div>
            <div><label style={lbl}>Work Email *</label><input type="email" style={inp("email")} value={form.email} onChange={set("email")} />{errors.email&&<div style={{fontSize:11,color:"#fca5a5",marginTop:3}}>{errors.email}</div>}</div>
          </div>
          <button onClick={handleSubmit} disabled={submitting} style={{width:"100%",marginTop:28,padding:"14px",background:submitting?"rgba(255,255,255,0.12)":"#fff",color:submitting?"rgba(255,255,255,0.4)":"#334155",border:"none",borderRadius:10,fontSize:15,fontWeight:800,cursor:submitting?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s"}}>
            {submitting?"Launching...":"🚀 Launch Platform"}
          </button>
          <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:14}}>Secure · <a href="mailto:info@ariprus.com" style={{color:"rgba(255,255,255,0.6)",textDecoration:"none",fontWeight:600}}>info@ariprus.com</a></div>
        </div>
        <div style={{textAlign:"center",marginTop:18,fontSize:12,color:"rgba(255,255,255,0.25)"}}>2026 AriPrus · <a href="https://ariprus.com" style={{color:"rgba(255,255,255,0.4)",textDecoration:"none"}}>ariprus.com</a></div>
      </div>
    </div>
  );
}

export default function SteelMfg() {
  const [user, setUser] = useState(null);
  const [section, setSection] = useState("assets");
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(()=>{ const t=setInterval(()=>setTime(new Date().toLocaleTimeString()),1000); return()=>clearInterval(t); },[]);

  useEffect(()=>{
    const el = document.createElement("style");
    el.textContent = [
      "*{box-sizing:border-box;margin:0;padding:0;}",
      ".card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.05);}",
      ".sec-btn{padding:12px 16px;border:none;background:none;cursor:pointer;font-family:Inter,sans-serif;font-size:13px;font-weight:600;color:#64748b;border-bottom:3px solid transparent;transition:all 0.2s;white-space:nowrap;}",
      ".sec-btn:hover{color:#0f172a;background:#f1f5f9;}",
      ".g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}",
      ".g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}",
      ".g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}",
      ".g5{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;}",
      ".hdr{background:#1e293b;border-bottom:1px solid #334155;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}",
      ".sec-bar{background:#fff;border-bottom:2px solid #e2e8f0;padding:0 24px;display:flex;overflow-x:auto;}",
      ".pp{padding:20px 24px 32px;}",
      ".fw{padding:12px 24px;border-top:1px solid #334155;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;background:#1e293b;}",
      "@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}",
      "@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}",
      "@media(max-width:900px){.g3{grid-template-columns:repeat(2,1fr);}.g4{grid-template-columns:repeat(2,1fr);}.g5{grid-template-columns:repeat(3,1fr);}.g2{grid-template-columns:1fr;}.pp{padding:14px 16px;}.hdr{padding:10px 14px;}.sec-bar{padding:0 12px;}}",
      "@media(max-width:600px){.g3{grid-template-columns:1fr;}.g4{grid-template-columns:repeat(2,1fr);}.g5{grid-template-columns:repeat(2,1fr);}.g2{grid-template-columns:1fr;}.pp{padding:10px 12px;}.sec-btn{padding:10px 12px;font-size:12px;}.hdr{flex-direction:column;align-items:flex-start;}.fw{flex-direction:column;}}",
    ].join(" ");
    document.head.appendChild(el);
    return()=>{ document.head.removeChild(el); };
  },[]);

  if(!user) return <SignInScreen onSubmit={setUser}/>;

  const warningCount = ASSETS.filter(a=>a.status==="rolling").length;
  const STEEL = "#475569";

  const sections = [
    {key:"assets",  icon:"🏭", label:"Asset Status"},
    {key:"eaf",     icon:"⚡", label:"EAF Intelligence"},
    {key:"rolling", icon:"🏗️", label:"Rolling Mill"},
    {key:"energy",  icon:"⚡", label:"Energy Optimisation"},
    {key:"quality", icon:"🔬", label:"Quality & Yield"},
    {key:"maint",   icon:"🔧", label:"Predictive Maintenance"},
  ];

  return (
    <div style={{background:"#f1f5f9",minHeight:"100vh",color:B.text,fontFamily:"Inter,sans-serif"}}>
      {/* Header — steel dark theme */}
      <div className="hdr">
        <div style={{flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontFamily:"Inter,sans-serif",fontSize:18,fontWeight:800,color:"#f1f5f9"}}>AriLinc <span style={{color:"#fbbf24"}}>Steel</span> Intelligence</div>
            <span style={{background:"#334155",color:"#94a3b8",border:"1px solid #475569",borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700}}>EAF · LF · CC · HSM</span>
          </div>
          <div style={{fontSize:11,color:"#64748b",marginTop:2}}>Steel & Metals Intelligence · Powered by AriPrus</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          {warningCount>0&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:700,color:B.orange}}>⚠ Roll Change Due</div>}
          <div style={{background:"#dc2626",border:"1px solid #b91c1c",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:5}}><span style={{animation:"pulse 1.5s infinite"}}>●</span>HEAT IN PROGRESS</div>
          <div style={{fontSize:12,color:"#64748b"}}>{time}</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>👋 {user.name}</div>
          <button onClick={()=>setUser(null)} style={{fontSize:11,color:"#94a3b8",background:"none",border:"1px solid #475569",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Sign Out</button>
        </div>
      </div>

      <div className="sec-bar">
        {sections.map(s=>(
          <button key={s.key} className="sec-btn"
            style={{color:section===s.key?STEEL:B.sub,borderBottom:`3px solid ${section===s.key?STEEL:"transparent"}`,fontWeight:section===s.key?800:600}}
            onClick={()=>setSection(s.key)}>{s.icon} {s.label}</button>
        ))}
      </div>

      <div className="pp">

        {/* ── ASSET STATUS ── */}
        {section==="assets" && (
          <div>
            <div className="g4" style={{marginBottom:20}}>
              {[
                {icon:"🏭",label:"Assets Online",value:"5 / 5",sub:"All monitored",color:STEEL},
                {icon:"⚡",label:"Current Heat",value:"H-4821",sub:"EAF tapping now",color:B.red},
                {icon:"📊",label:"Today's Output",value:"1,842 t",sub:"94.2% of plan",color:B.blue},
                {icon:"⚡",label:"Energy Rate",value:"412 kWh/t",sub:"vs 398 target",color:B.orange},
              ].map((k,i)=>(
                <div key={i} style={{background:"#fff",border:`2px solid ${k.color}25`,borderRadius:12,padding:"16px 18px",borderTop:`4px solid ${k.color}`,boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                  <div style={{fontSize:22,marginBottom:6}}>{k.icon}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:26,fontWeight:800,color:k.color}}>{k.value}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#334155",marginTop:3}}>{k.label}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div style={{fontFamily:"Inter,sans-serif",fontSize:17,fontWeight:800,color:B.text,marginBottom:14}}>Steelmaking Asset Status</div>
            <div className="g3">
              {ASSETS.map(asset=>(
                <div key={asset.id} style={{background:"#fff",border:`2px solid ${asset.status==="rolling"?"#fde68a":asset.status==="tapping"?"#fecaca":"#e2e8f0"}`,borderRadius:12,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                  <div style={{padding:"12px 16px",borderBottom:`3px solid ${asset.color}`,background:"#1e293b",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                        <span style={{fontSize:18}}>{asset.icon}</span>
                        <div style={{fontFamily:"Inter,sans-serif",fontSize:15,fontWeight:800,color:"#f1f5f9"}}>{asset.id}</div>
                      </div>
                      <div style={{fontSize:11,color:"#94a3b8"}}>{asset.name}</div>
                      <div style={{fontSize:10,color:"#64748b"}}>{asset.type} · {asset.location}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <StatusPill status={asset.status}/>
                      <div style={{background:`${asset.health>=90?B.green:asset.health>=75?B.orange:B.red}20`,border:`1px solid ${asset.health>=90?B.green:asset.health>=75?B.orange:B.red}50`,borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:700,color:asset.health>=90?B.green:asset.health>=75?B.orange:B.red}}>H:{asset.health}</div>
                    </div>
                  </div>
                  {/* Temp & vibration */}
                  <div style={{padding:"8px 14px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,borderBottom:"1px solid #f1f5f9"}}>
                    {[
                      {l:"Temp",v:`${asset.temp.val}${asset.temp.unit}`,ok:asset.temp.val<asset.temp.warn,c:asset.temp.val<asset.temp.warn?B.green:B.orange},
                      {l:"Vibration",v:`${asset.vibration.val} ${asset.vibration.unit}`,ok:asset.vibration.val<asset.vibration.warn,c:asset.vibration.val<asset.vibration.warn?B.green:B.orange},
                    ].map((s,i)=>(
                      <div key={i} style={{background:`${s.c}08`,border:`1px solid ${s.c}25`,borderRadius:6,padding:"5px 8px",textAlign:"center"}}>
                        <div style={{fontSize:8,color:B.light}}>{s.l}</div>
                        <div style={{fontSize:12,fontWeight:800,color:s.c}}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:"8px 14px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,borderBottom:"1px solid #f1f5f9"}}>
                    {Object.entries(asset.kpis).map(([k,v])=>(
                      <div key={k} style={{background:"#f8fafc",borderRadius:6,padding:"4px 7px"}}>
                        <div style={{fontSize:8,color:B.light,textTransform:"capitalize"}}>{k.replace(/([A-Z])/g," $1").trim()}</div>
                        <div style={{fontSize:11,fontWeight:700,color:B.text}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:"8px 14px"}}>
                    <div style={{background:asset.status==="rolling"?"#fffbeb":asset.status==="tapping"?"#fff5f5":"#f0fdf4",border:`1px solid ${asset.status==="rolling"?"#fde68a":asset.status==="tapping"?"#fecaca":"#bbf7d0"}`,borderLeft:`3px solid ${asset.status==="rolling"?B.orange:asset.status==="tapping"?B.red:B.green}`,borderRadius:7,padding:"6px 10px",fontSize:11,color:B.text,lineHeight:1.5}}>
                      <strong style={{color:asset.status==="rolling"?B.orange:asset.status==="tapping"?B.red:B.green}}>AI: </strong>{asset.aiAlert}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EAF INTELLIGENCE ── */}
        {section==="eaf" && (
          <div>
            <div style={{fontFamily:"Inter,sans-serif",fontSize:18,fontWeight:800,color:B.text,marginBottom:4}}>EAF Intelligence — Heat H-4821</div>
            <div style={{fontSize:13,color:B.sub,marginBottom:20}}>Real-time heat tracking · Energy optimisation · Electrode management · Tap temperature prediction</div>
            <div className="g4" style={{marginBottom:20}}>
              {[
                {icon:"🌡️",label:"Tap Temperature",value:"1,658°C",sub:"Target: 1,650±10°C",color:B.red},
                {icon:"⚡",label:"Energy Consumption",value:"412 kWh/t",sub:"vs 398 kWh/t target",color:B.orange},
                {icon:"⏱",label:"Heat Time",value:"52 min",sub:"Target: 48 min",color:B.purple},
                {icon:"🔋",label:"Electrode Wear",value:"0.62",sub:"Replace at 0.85",color:B.blue},
              ].map((k,i)=>(
                <div key={i} style={{background:"#fff",border:`2px solid ${k.color}25`,borderRadius:12,padding:"16px 18px",borderTop:`4px solid ${k.color}`,boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                  <div style={{fontSize:22,marginBottom:6}}>{k.icon}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:26,fontWeight:800,color:k.color}}>{k.value}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#334155",marginTop:3}}>{k.label}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="g2" style={{marginBottom:16}}>
              <div className="card">
                <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.text,marginBottom:14}}>Heat Temperature Profile (24h)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={TEMP_TREND} margin={{top:4,right:16,bottom:4,left:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="hr" stroke="#e2e8f0" tick={{fill:"#94a3b8",fontSize:9}} interval={3}/>
                    <YAxis stroke="#e2e8f0" tick={{fill:"#94a3b8",fontSize:9}} width={42} domain={[1580,1680]} unit="C"/>
                    <Tooltip content={<CT/>}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <ReferenceLine y={1650} stroke={B.green} strokeDasharray="4 3" label={{value:"Target",fill:B.green,fontSize:9}}/>
                    <Line type="monotone" dataKey="eaf" stroke={B.red} strokeWidth={2} dot={false} name="EAF Tap Temp (C)"/>
                    <Line type="monotone" dataKey="ladle" stroke={B.orange} strokeWidth={2} dot={false} name="Ladle Temp (C)" strokeDasharray="5 3"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.text,marginBottom:14}}>AI EAF Optimisation Opportunities</div>
                {[
                  {icon:"⚡",title:"Transformer Tap Optimisation",saving:"Rs 1.2L/heat",detail:"AI identifies suboptimal tap position at 60% of heat. Switching from tap 8 to tap 9 reduces melt time by 4 min.",color:B.orange},
                  {icon:"🔋",title:"Electrode Length Management",saving:"Rs 0.8L/heat",detail:"Electrode slip event predicted in 3 heats. Proactive adjustment reduces breakage risk and electrode cost.",color:B.blue},
                  {icon:"💧",title:"Oxygen Lance Timing",saving:"Rs 0.6L/heat",detail:"Lance insertion 3 min early — AI predicts carbon content. Optimising reduces oxygen waste by 8%.",color:B.teal},
                  {icon:"🌡️",title:"Scrap Bucket Sequencing",saving:"Rs 0.4L/heat",detail:"AI recommends heavy scrap first for better bath formation. Reduces cold spots and energy variance.",color:B.purple},
                ].map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,padding:"8px 10px",background:"#f8fafc",borderRadius:8}}>
                    <span style={{fontSize:18,flexShrink:0}}>{f.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
                        <span style={{fontSize:12,fontWeight:700,color:B.text}}>{f.title}</span>
                        <span style={{fontSize:12,fontWeight:800,color:f.color}}>{f.saving}</span>
                      </div>
                      <div style={{fontSize:11,color:B.sub,marginTop:2}}>{f.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.text,marginBottom:14}}>Heat Sequence — EAF to Cast</div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                {[
                  {step:"Charge",icon:"📦",time:"0 min",status:"done",color:B.green},
                  {step:"Melt",icon:"🔥",time:"28 min",status:"done",color:B.green},
                  {step:"Refine",icon:"⚗️",time:"42 min",status:"done",color:B.green},
                  {step:"Tap",icon:"🌡️",time:"52 min",status:"active",color:B.red},
                  {step:"Ladle Treat",icon:"🪣",time:"~65 min",status:"pending",color:B.light},
                  {step:"Cast",icon:"🔩",time:"~90 min",status:"pending",color:B.light},
                  {step:"Roll",icon:"🏗️",time:"~180 min",status:"pending",color:B.light},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{textAlign:"center",padding:"8px 10px",background:s.status==="active"?B.red:s.status==="done"?"#f0fdf4":"#f8fafc",border:`1.5px solid ${s.status==="active"?B.red:s.status==="done"?B.green:B.border}`,borderRadius:8,minWidth:72}}>
                      <div style={{fontSize:18}}>{s.icon}</div>
                      <div style={{fontSize:10,fontWeight:700,color:s.status==="active"?"#fff":s.status==="done"?B.green:B.light}}>{s.step}</div>
                      <div style={{fontSize:9,color:s.status==="active"?"rgba(255,255,255,0.8)":B.light}}>{s.time}</div>
                    </div>
                    {i<6&&<div style={{color:B.border,fontSize:14}}>→</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ROLLING MILL ── */}
        {section==="rolling" && (
          <div>
            <div style={{fontFamily:"Inter,sans-serif",fontSize:18,fontWeight:800,color:B.text,marginBottom:4}}>Hot Strip Mill Intelligence — HSM-401</div>
            <div style={{fontSize:13,color:B.sub,marginBottom:20}}>Work roll condition · Chatter detection · Thickness control · Surface quality · Roll schedule AI</div>
            <div style={{background:"#fffbeb",border:"2px solid #fde68a",borderLeft:`4px solid ${B.orange}`,borderRadius:10,padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <span style={{fontSize:20}}>⚠️</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.orange}}>ROLL CHATTER WARNING — HSM-401</div>
                <div style={{fontSize:12,color:B.text,marginTop:2}}>Vibration 4.8 mm/s — above 4.5 mm/s warning threshold. Work roll wear index 0.74. AI recommends roll change within next 2 coils to prevent surface quality degradation.</div>
              </div>
            </div>
            <div className="g4" style={{marginBottom:20}}>
              {[
                {icon:"📏",label:"Strip Thickness",value:"6.5 mm",sub:"Target ±0.15mm",color:B.blue},
                {icon:"📐",label:"Strip Width",value:"1,250 mm",sub:"Target ±2mm",color:B.teal},
                {icon:"💪",label:"Roll Force",value:"2,840 t",sub:"Nominal range",color:B.steel},
                {icon:"🌡️",label:"Coil Exit Temp",value:"842°C",sub:"Target 840±20°C",color:B.orange},
              ].map((k,i)=>(
                <div key={i} style={{background:"#fff",border:`2px solid ${k.color}25`,borderRadius:12,padding:"16px 18px",borderTop:`4px solid ${k.color}`,boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                  <div style={{fontSize:22,marginBottom:6}}>{k.icon}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:24,fontWeight:800,color:k.color}}>{k.value}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#334155",marginTop:3}}>{k.label}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="g2">
              <div className="card">
                <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.text,marginBottom:3}}>Work Roll Vibration — 30 Samples</div>
                <div style={{fontSize:12,color:B.sub,marginBottom:14}}>Chatter frequency detected — trending toward warning threshold</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={VIB_TREND} margin={{top:4,right:16,bottom:4,left:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="sample" stroke="#e2e8f0" tick={{fill:"#94a3b8",fontSize:9}} interval={4}/>
                    <YAxis stroke="#e2e8f0" tick={{fill:"#94a3b8",fontSize:9}} width={38} unit=" mm/s"/>
                    <Tooltip content={<CT/>}/>
                    <ReferenceLine y={4.5} stroke={B.orange} strokeDasharray="4 3" label={{value:"Warning 4.5",fill:B.orange,fontSize:9}}/>
                    <ReferenceLine y={7.5} stroke={B.red} strokeDasharray="4 3" label={{value:"Critical 7.5",fill:B.red,fontSize:9}}/>
                    <Line type="monotone" dataKey="hsm" stroke={B.orange} strokeWidth={2.5} dot={false} name="HSM-401 Vibration (mm/s)"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.text,marginBottom:14}}>AI Roll Schedule Optimisation</div>
                {[
                  {title:"Current Roll Status",val:"Wear 0.74 / 0.80",note:"2 coils remaining before mandatory change",color:B.orange},
                  {title:"Recommended Action",val:"Change after Coil C-2841",note:"Next planned break in 47 min — minimise downtime impact",color:B.blue},
                  {title:"Surface Quality Risk",val:"Rising",note:"Chatter pattern indicates increasing risk of surface marks on next coil",color:B.red},
                  {title:"Thickness Deviation",val:"±0.08 mm",note:"Within ±0.15mm spec — AI auto-correcting via AGC",color:B.green},
                  {title:"Next Roll Campaign",val:"42 coils predicted",note:"Based on grade mix and entry temperature forecast",color:B.purple},
                ].map((r,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"7px 0",borderBottom:i<4?"1px solid #f1f5f9":"none",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:B.text}}>{r.title}</div>
                      <div style={{fontSize:10,color:B.sub,marginTop:1}}>{r.note}</div>
                    </div>
                    <div style={{fontSize:12,fontWeight:800,color:r.color,textAlign:"right",flexShrink:0}}>{r.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ENERGY OPTIMISATION ── */}
        {section==="energy" && (
          <div>
            <div style={{fontFamily:"Inter,sans-serif",fontSize:18,fontWeight:800,color:B.text,marginBottom:4}}>Energy Optimisation</div>
            <div style={{fontSize:13,color:B.sub,marginBottom:20}}>kWh/t tracking · Transformer optimisation · Reheat furnace · Power demand management</div>
            <div className="g4" style={{marginBottom:20}}>
              {[
                {icon:"⚡",label:"EAF Energy",value:"412 kWh/t",sub:"Target: 398 kWh/t",color:B.orange},
                {icon:"🔥",label:"Reheat Furnace",value:"1.42 GJ/t",sub:"Target: 1.35 GJ/t",color:B.red},
                {icon:"💰",label:"Daily Energy Cost",value:"Rs 48.2L",sub:"vs Rs 44.8L target",color:B.purple},
                {icon:"📉",label:"AI Saving Opportunity",value:"Rs 4.9L/day",sub:"Identified & actionable",color:B.green},
              ].map((k,i)=>(
                <div key={i} style={{background:"#fff",border:`2px solid ${k.color}25`,borderRadius:12,padding:"16px 18px",borderTop:`4px solid ${k.color}`,boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                  <div style={{fontSize:22,marginBottom:6}}>{k.icon}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:24,fontWeight:800,color:k.color}}>{k.value}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#334155",marginTop:3}}>{k.label}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="g2" style={{marginBottom:16}}>
              <div className="card">
                <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.text,marginBottom:14}}>EAF Energy Intensity — 30 Day Trend</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={ENERGY_TREND} margin={{top:4,right:16,bottom:4,left:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="day" stroke="#e2e8f0" tick={{fill:"#94a3b8",fontSize:10}} interval={4}/>
                    <YAxis stroke="#e2e8f0" tick={{fill:"#94a3b8",fontSize:9}} width={42} domain={[380,440]} unit=" kWh/t"/>
                    <Tooltip content={<CT/>}/>
                    <ReferenceLine y={398} stroke={B.green} strokeDasharray="4 3" label={{value:"Target 398",fill:B.green,fontSize:9}}/>
                    <Line type="monotone" dataKey="actual" stroke={B.orange} strokeWidth={2.5} dot={false} name="Actual kWh/t"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.text,marginBottom:14}}>Energy Saving Opportunities — Today</div>
                {ENERGY_ZONES.map((z,i)=>(
                  <div key={i} style={{marginBottom:10,padding:"10px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:12,fontWeight:700,color:B.text}}>{z.zone}</span>
                      <span style={{fontSize:12,fontWeight:800,color:B.green}}>{z.savings}</span>
                    </div>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:B.light}}>Actual</div><div style={{fontSize:13,fontWeight:700,color:B.red}}>{z.actual}</div><div style={{fontSize:9,color:B.light}}>{z.unit}</div></div>
                      <div style={{color:B.border,fontSize:14}}>→</div>
                      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:B.light}}>AI Target</div><div style={{fontSize:13,fontWeight:700,color:B.green}}>{z.target}</div><div style={{fontSize:9,color:B.light}}>{z.unit}</div></div>
                      <div style={{flex:1,background:"#e2e8f0",borderRadius:3,height:6,marginLeft:4}}>
                        <div style={{height:6,borderRadius:3,background:B.orange,width:`${(z.actual/z.target*100-100)*10+60}%`}}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── QUALITY & YIELD ── */}
        {section==="quality" && (
          <div>
            <div style={{fontFamily:"Inter,sans-serif",fontSize:18,fontWeight:800,color:B.text,marginBottom:4}}>Quality & Yield Intelligence</div>
            <div style={{fontSize:13,color:B.sub,marginBottom:20}}>Grade chemistry · Surface inspection · Dimensional control · Prime yield tracking</div>
            <div className="g4" style={{marginBottom:20}}>
              {[
                {icon:"✅",label:"Prime Yield",value:"97.2%",sub:"Target: 96.5%",color:B.green},
                {icon:"🔬",label:"Grades Running",value:"4",sub:"IS2062, SAE1018, SAE4140, SS304",color:B.blue},
                {icon:"❌",label:"Rejects Today",value:"28 t",sub:"vs 35 t last week",color:B.red},
                {icon:"🔄",label:"Rework Today",value:"44 t",sub:"Rolling surface marks",color:B.orange},
              ].map((k,i)=>(
                <div key={i} style={{background:"#fff",border:`2px solid ${k.color}25`,borderRadius:12,padding:"16px 18px",borderTop:`4px solid ${k.color}`,boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                  <div style={{fontSize:22,marginBottom:6}}>{k.icon}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:26,fontWeight:800,color:k.color}}>{k.value}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#334155",marginTop:3}}>{k.label}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="g2">
              <div className="card">
                <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.text,marginBottom:14}}>Grade Performance — Today</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr style={{background:"#f8fafc"}}>{["Grade","Heats","Quality","Prime Yield","Defects","Status"].map(h=>(<th key={h} style={{padding:"7px 10px",textAlign:"left",color:"#475569",fontWeight:700,borderBottom:"2px solid #e2e8f0",fontSize:11,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead>
                    <tbody>{STEEL_GRADES.map((g,i)=>(
                      <tr key={g.grade} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafafa"}}>
                        <td style={{padding:"7px 10px",fontWeight:700,color:B.text}}>{g.grade}</td>
                        <td style={{padding:"7px 10px",color:B.sub}}>{g.heats}</td>
                        <td style={{padding:"7px 10px"}}><span style={{background:g.quality==="Prime"?B.green+"20":B.orange+"20",color:g.quality==="Prime"?B.green:B.orange,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{g.quality}</span></td>
                        <td style={{padding:"7px 10px",fontWeight:700,color:g.color}}>{g.yield}</td>
                        <td style={{padding:"7px 10px",color:g.defects>8?B.red:g.defects>4?B.orange:B.green,fontWeight:700}}>{g.defects}</td>
                        <td style={{padding:"7px 10px",fontSize:10,color:g.defects>8?B.orange:B.green,fontWeight:600}}>{g.defects>8?"Review":"OK"}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.text,marginBottom:14}}>Prime Yield Trend — 30 Days</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={YIELD_TREND} margin={{top:4,right:16,bottom:4,left:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="day" stroke="#e2e8f0" tick={{fill:"#94a3b8",fontSize:10}} interval={4}/>
                    <YAxis stroke="#e2e8f0" tick={{fill:"#94a3b8",fontSize:9}} width={36} unit="%"/>
                    <Tooltip content={<CT/>}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <ReferenceLine y={96.5} stroke={B.steel} strokeDasharray="4 3" label={{value:"Target",fill:B.steel,fontSize:9}}/>
                    <Line type="monotone" dataKey="prime" stroke={B.green} strokeWidth={2.5} dot={false} name="Prime Yield (%)"/>
                    <Line type="monotone" dataKey="scrap" stroke={B.red} strokeWidth={1.5} dot={false} name="Scrap (%)" strokeDasharray="5 3"/>
                    <Line type="monotone" dataKey="rework" stroke={B.orange} strokeWidth={1.5} dot={false} name="Rework (%)" strokeDasharray="3 2"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── PREDICTIVE MAINTENANCE ── */}
        {section==="maint" && (
          <div>
            <div style={{fontFamily:"Inter,sans-serif",fontSize:18,fontWeight:800,color:B.text,marginBottom:4}}>Predictive Maintenance</div>
            <div style={{fontSize:13,color:B.sub,marginBottom:20}}>Roll wear · Bearing health · Electrode management · Refractory life · Motor diagnostics</div>
            <div className="g4" style={{marginBottom:20}}>
              {[
                {icon:"🔧",label:"Assets Monitored",value:"32",sub:"Vibration + temp sensors",color:STEEL},
                {icon:"⚠️",label:"Active Alerts",value:"3",sub:"Action within 7 days",color:B.orange},
                {icon:"📅",label:"Next Critical PM",value:"2 coils",sub:"HSM-401 roll change",color:B.red},
                {icon:"💰",label:"Failures Prevented",value:"Rs 18.4L",sub:"Last 90 days",color:B.green},
              ].map((k,i)=>(
                <div key={i} style={{background:"#fff",border:`2px solid ${k.color}25`,borderRadius:12,padding:"16px 18px",borderTop:`4px solid ${k.color}`,boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                  <div style={{fontSize:22,marginBottom:6}}>{k.icon}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:26,fontWeight:800,color:k.color}}>{k.value}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#334155",marginTop:3}}>{k.label}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{marginBottom:16}}>
              <div style={{fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:800,color:B.text,marginBottom:14}}>Asset Health — All Assets</div>
              {ASSETS.map(a=>{
                const col=a.health>=90?B.green:a.health>=75?B.orange:B.red;
                const rul=a.health>=90?"60+ days":a.health>=80?"21–30 days":a.health>=70?"7–14 days":"Under 7 days";
                return (
                  <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,padding:"9px 12px",background:"#f8fafc",borderRadius:8,border:`1px solid ${col}20`}}>
                    <span style={{fontSize:18}}>{a.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:4,marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:700,color:B.text}}>{a.id} — {a.name}</span>
                        <div style={{display:"flex",gap:10,alignItems:"center"}}>
                          <span style={{fontSize:10,color:B.light}}>Vib: {a.vibration.val} {a.vibration.unit}</span>
                          <span style={{fontSize:11,fontWeight:700,color:col}}>RUL: {rul}</span>
                        </div>
                      </div>
                      <div style={{background:"#e2e8f0",borderRadius:3,height:6}}><div style={{height:6,borderRadius:3,background:col,width:`${a.health}%`,transition:"width 1s"}}/></div>
                    </div>
                    <span style={{fontFamily:"Inter,sans-serif",fontSize:16,fontWeight:800,color:col,minWidth:32}}>{a.health}</span>
                  </div>
                );
              })}
            </div>
            <div className="g2">
              {[
                {icon:"🏗️",id:"HSM-401",title:"Hot Strip Mill — Work Roll Chatter",detail:"Vibration 4.8 mm/s above 4.5 mm/s warning. Roll wear index 0.74 — 0.06 from mandatory change threshold. Chatter frequency 42 Hz matches third octave resonance. AI prediction: surface defects will appear by coil 3 if no intervention.",severity:"HIGH",color:B.orange,action:"Change rolls at next scheduled gap — approx. 47 min. Pre-stage replacement rolls now. Do not run more than 2 coils."},
                {icon:"⚡",id:"EAF-101",title:"EAF Electrode — Slip Event Predicted",detail:"Electrode position telemetry showing 0.3mm/heat consumption above baseline on electrode 2. Phase current imbalance 4.2% — early sign of electrode damage. AI predicts slip event in 3–5 heats without adjustment.",severity:"MEDIUM",color:B.blue,action:"Inspect electrode clamp on electrode 2 after current heat. Adjust position. Risk of arc instability and energy loss."},
              ].map((a,i)=>(
                <div key={i} className="card">
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:20}}>{a.icon}</span>
                    <div>
                      <div style={{fontFamily:"Inter,sans-serif",fontSize:13,fontWeight:800,color:B.text}}>{a.id} — {a.title}</div>
                      <span style={{background:`${a.color}15`,color:a.color,border:`1px solid ${a.color}40`,borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:700}}>{a.severity}</span>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:B.text,lineHeight:1.7,background:"#f8fafc",borderRadius:8,padding:"10px 12px",marginBottom:8}}>{a.detail}</div>
                  <div style={{background:`${a.color}08`,border:`1px solid ${a.color}25`,borderRadius:7,padding:"8px 12px",fontSize:11,fontWeight:600,color:a.color}}>Action: {a.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fw">
        <div style={{fontSize:12,color:"#64748b"}}>AriLinc Steel & Metals Intelligence · EAF · LF · CC · HSM · Powered by AriPrus</div>
        <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
          <a href="mailto:info@ariprus.com" style={{fontSize:12,color:"#64748b",textDecoration:"none"}}>info@ariprus.com</a>
          <a href="https://arilinc.ariprus.com" target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#fbbf24",fontWeight:700,textDecoration:"none"}}>Explore AriLinc Platform</a>
        </div>
      </div>
    </div>
  );
}

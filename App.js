import { useState, useEffect, useRef } from "react";
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit
} from "firebase/firestore";
import { db } from "./firebase";
import { generatePlan, getCurrentWeek } from "./plan";
import {
  RACE_DATE, ATHLETES, ATHLETE_COLORS, ATHLETE_ICONS,
  SPORT_ICONS, SPORT_CATEGORY, TRACKING_FIELDS, MOTI_MESSAGES, BIRTHDAY
} from "./constants";

const PLAN = generatePlan();

function daysUntilRace() {
  return Math.ceil((RACE_DATE - new Date()) / (24 * 60 * 60 * 1000));
}
function formatDate(d) {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}
function showBirthday() {
  if (!BIRTHDAY) return false;
  return new Date() <= new Date(BIRTHDAY.until);
}

const S = (styles) => styles; // passthrough for readability

export default function App() {
  const [tab, setTab]               = useState("feed");
  const [entries, setEntries]       = useState([]);
  const [currentUser, setCurrentUser] = useState("Smitty");
  const [showLog, setShowLog]       = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [motiMsg, setMotiMsg]       = useState(null);
  const [motiLoading, setMotiLoading] = useState(false);
  const [form, setForm]             = useState(emptyForm("Laufen"));

  // Live feed from Firestore
  useEffect(() => {
    const q = query(collection(db, "entries"), orderBy("ts", "desc"), limit(100));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEntries(data);
      checkWeekMoti(data);
    });
    return unsub;
  }, []);

  function emptyForm(sport) {
    return { sport, duration:"", note:"", emoji:"💪", distanz:"", puls_avg:"", puls_max:"", pace:"", speed:"", schwimmbahnen:"" };
  }

  function checkWeekMoti(all) {
    const mon = new Date(); mon.setDate(mon.getDate()-((mon.getDay()+6)%7)); mon.setHours(0,0,0,0);
    const triSports = ["Schwimmen","Radfahren","Laufen","Brick"];
    const wkTri = all.filter(e => e.ts?.toDate?.() >= mon && triSports.includes(e.sport));
    if (new Date().getDay() >= 3 && wkTri.length < 2) {
      setMotiMsg(MOTI_MESSAGES[Math.floor(Math.random() * MOTI_MESSAGES.length)]);
    }
  }

  async function fetchAiMoti() {
    setMotiLoading(true);
    try {
      const mon = new Date(); mon.setDate(mon.getDate()-((mon.getDay()+6)%7)); mon.setHours(0,0,0,0);
      const triSports = ["Schwimmen","Radfahren","Laufen","Brick"];
      const wk = entries.filter(e => e.ts?.toDate?.() >= mon);
      const triCount = wk.filter(e => triSports.includes(e.sport)).length;
      const extraCount = wk.filter(e => !triSports.includes(e.sport)).length;
      const prompt = `Du bist Triathlon-Coach für Smitty und J-Smooth, die am 31. August 2026 ihren ersten Sprint-Triathlon machen (750m Schwimmen, 27km Rad, 5,4km Laufen). Noch ${daysUntilRace()} Tage bis zum Rennen. Diese Woche: ${triCount} Tri-Einheiten, ${extraCount} andere Einheiten. Schreib eine kurze, motivierende, ehrlich-humorvolle Nachricht auf Deutsch (2-3 Sätze). Direkt starten, kein "Liebe Athleten".`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:200, messages:[{role:"user",content:prompt}] }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text||"").join("") || "";
      if (text) setMotiMsg({ emoji:"🤖", text:text.trim(), ai:true });
    } catch(e) { setMotiMsg(MOTI_MESSAGES[0]); }
    setMotiLoading(false);
  }

  async function saveEntry() {
    if (!form.duration) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "entries"), {
        athlete: currentUser,
        sport: form.sport,
        duration: parseInt(form.duration),
        note: form.note,
        emoji: form.emoji,
        ts: serverTimestamp(),
        tracking: {
          distanz:      form.distanz      ? parseFloat(form.distanz)      : null,
          puls_avg:     form.puls_avg     ? parseInt(form.puls_avg)       : null,
          puls_max:     form.puls_max     ? parseInt(form.puls_max)       : null,
          pace:         form.pace         || null,
          speed:        form.speed        ? parseFloat(form.speed)        : null,
          schwimmbahnen:form.schwimmbahnen? parseInt(form.schwimmbahnen)  : null,
        },
      });
      showToastMsg(`${ATHLETE_ICONS[currentUser]} Einheit gespeichert!`);
      setForm(emptyForm("Laufen"));
      setShowLog(false);
      setTab("feed");
    } catch(e) { showToastMsg("❌ Fehler beim Speichern"); }
    setSaving(false);
  }

  function showToastMsg(msg) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const days = daysUntilRace();
  const week = PLAN[selectedWeek];
  const curWeekIdx = getCurrentWeek();
  const other = currentUser === "Smitty" ? "J-Smooth" : "Smitty";
  const trackFields = TRACKING_FIELDS[form.sport] || [];

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#0a0e1a", color:"#e8eaf0", fontFamily:"-apple-system,'DM Sans','Segoe UI',sans-serif", maxWidth:480, margin:"0 auto", paddingBottom:80 }}>

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(135deg,#0d1528,#111c35)", borderBottom:"1px solid #1e2d4a", padding:"env(safe-area-inset-top, 18px) 18px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:3, color:"#4a7ab5", textTransform:"uppercase", marginBottom:3 }}>Sprint Triathlon</div>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:-0.5 }}>🏁 {days} Tage</div>
            <div style={{ fontSize:12, color:"#6b8ab0", marginTop:1 }}>bis 31. August 2026</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10, color:"#4a7ab5", letterSpacing:2, marginBottom:5 }}>DU BIST</div>
            <div style={{ display:"flex", gap:5 }}>
              {ATHLETES.map(a => (
                <div key={a} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                  <button onClick={() => setCurrentUser(a)} style={{ padding:"5px 11px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background: currentUser===a ? ATHLETE_COLORS[a] : "#1a2540", color: currentUser===a ? "#0a0e1a" : "#6b8ab0" }}>
                    {ATHLETE_ICONS[a]} {a}
                  </button>
                  {showBirthday() && a === BIRTHDAY.athlete && (
                    <div style={{ fontSize:10, color:"#f9a8d4", fontWeight:700 }}>🎂 Happy Birthday!</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:7, marginTop:12 }}>
          {[["🏊","750m"],["🚴","27km"],["🏃","5,4km"]].map(([ic,d]) => (
            <div key={d} style={{ flex:1, background:"#0d1528", borderRadius:10, padding:"6px 0", border:"1px solid #1e2d4a", textAlign:"center" }}>
              <div style={{ fontSize:15 }}>{ic}</div>
              <div style={{ fontSize:11, fontWeight:700, color:"#00e5ff" }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", background:"#1e2d4a", color:"#e8eaf0", padding:"9px 20px", borderRadius:30, fontSize:13, fontWeight:600, zIndex:999, border:"1px solid #00e5ff40", whiteSpace:"nowrap" }}>{toast}</div>
      )}

      <div style={{ padding:15 }}>

        {/* ══════════ FEED ══════════ */}
        {tab === "feed" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize:17, fontWeight:800 }}>Activity Feed</div>
              <button onClick={() => setShowLog(!showLog)} style={{ background:ATHLETE_COLORS[currentUser], color:"#0a0e1a", border:"none", borderRadius:20, padding:"7px 15px", fontWeight:800, fontSize:12, cursor:"pointer" }}>
                {showLog ? "✕ Schließen" : "+ Einheit"}
              </button>
            </div>

            {/* LOG FORM */}
            {showLog && (
              <div style={{ background:"#111c35", borderRadius:16, padding:15, border:"1px solid #1e2d4a", marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:ATHLETE_COLORS[currentUser] }}>{ATHLETE_ICONS[currentUser]} {currentUser}s Einheit</div>
                  <button onClick={() => setShowLog(false)} style={{ background:"#1a2540", border:"none", color:"#6b8ab0", borderRadius:20, width:28, height:28, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                </div>

                <div style={{ fontSize:10, color:"#4a7ab5", fontWeight:700, letterSpacing:1, marginBottom:6 }}>TRIATHLON</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                  {["Schwimmen","Radfahren","Laufen","Brick"].map(s => (
                    <button key={s} onClick={() => setForm(f => ({...f, sport:s}))} style={{ padding:"5px 11px", borderRadius:16, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:form.sport===s?ATHLETE_COLORS[currentUser]:"#1a2540", color:form.sport===s?"#0a0e1a":"#6b8ab0" }}>{SPORT_ICONS[s]} {s}</button>
                  ))}
                </div>
                <div style={{ fontSize:10, color:"#4a7ab5", fontWeight:700, letterSpacing:1, marginBottom:6 }}>EXTRAS</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
                  {["Krafttraining","Basketball","Padel","Yoga","Wandern","Anderes"].map(s => (
                    <button key={s} onClick={() => setForm(f => ({...f, sport:s}))} style={{ padding:"5px 11px", borderRadius:16, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:form.sport===s?"#a855f7":"#1a2540", color:form.sport===s?"#fff":"#6b8ab0" }}>{SPORT_ICONS[s]} {s}</button>
                  ))}
                </div>

                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <input type="number" placeholder="Dauer (min)" value={form.duration} onChange={e => setForm(f => ({...f, duration:e.target.value}))}
                    style={{ flex:1, background:"#0d1528", border:"1px solid #1e2d4a", borderRadius:10, padding:"9px 12px", color:"#e8eaf0", fontSize:13, outline:"none" }} />
                  <select value={form.emoji} onChange={e => setForm(f => ({...f, emoji:e.target.value}))}
                    style={{ background:"#0d1528", border:"1px solid #1e2d4a", borderRadius:10, padding:"9px 8px", color:"#e8eaf0", fontSize:17, outline:"none" }}>
                    {["💪","🔥","😅","😎","🤩","😤","🥵","💯","🏆","😴"].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                {trackFields.length > 0 && (
                  <div style={{ background:"#0d1528", borderRadius:12, padding:"10px 12px", marginBottom:10, border:"1px solid #1e2d4a" }}>
                    <div style={{ fontSize:10, color:ATHLETE_COLORS[currentUser], fontWeight:700, letterSpacing:1, marginBottom:8 }}>📊 TRACKING</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {trackFields.includes("distanz") && (
                        <div>
                          <div style={{ fontSize:10, color:"#4a7ab5", marginBottom:3 }}>{form.sport==="Schwimmen"?"Distanz (m)":"Distanz (km)"}</div>
                          <input type="number" step="0.1" placeholder={form.sport==="Schwimmen"?"750":"5.4"} value={form.distanz} onChange={e => setForm(f => ({...f, distanz:e.target.value}))}
                            style={{ width:"100%", boxSizing:"border-box", background:"#111c35", border:"1px solid #1e2d4a", borderRadius:8, padding:"7px 10px", color:"#e8eaf0", fontSize:13, outline:"none" }} />
                        </div>
                      )}
                      {trackFields.includes("puls_avg") && (
                        <div>
                          <div style={{ fontSize:10, color:"#4a7ab5", marginBottom:3 }}>Ø Puls (bpm)</div>
                          <input type="number" placeholder="145" value={form.puls_avg} onChange={e => setForm(f => ({...f, puls_avg:e.target.value}))}
                            style={{ width:"100%", boxSizing:"border-box", background:"#111c35", border:"1px solid #1e2d4a", borderRadius:8, padding:"7px 10px", color:"#e8eaf0", fontSize:13, outline:"none" }} />
                        </div>
                      )}
                      {trackFields.includes("puls_max") && (
                        <div>
                          <div style={{ fontSize:10, color:"#4a7ab5", marginBottom:3 }}>Max Puls (bpm)</div>
                          <input type="number" placeholder="175" value={form.puls_max} onChange={e => setForm(f => ({...f, puls_max:e.target.value}))}
                            style={{ width:"100%", boxSizing:"border-box", background:"#111c35", border:"1px solid #1e2d4a", borderRadius:8, padding:"7px 10px", color:"#e8eaf0", fontSize:13, outline:"none" }} />
                        </div>
                      )}
                      {trackFields.includes("pace") && (
                        <div>
                          <div style={{ fontSize:10, color:"#4a7ab5", marginBottom:3 }}>Pace (min/km)</div>
                          <input type="text" placeholder="5:30" value={form.pace} onChange={e => setForm(f => ({...f, pace:e.target.value}))}
                            style={{ width:"100%", boxSizing:"border-box", background:"#111c35", border:"1px solid #1e2d4a", borderRadius:8, padding:"7px 10px", color:"#e8eaf0", fontSize:13, outline:"none" }} />
                        </div>
                      )}
                      {trackFields.includes("speed") && (
                        <div>
                          <div style={{ fontSize:10, color:"#4a7ab5", marginBottom:3 }}>Ø Speed (km/h)</div>
                          <input type="number" step="0.1" placeholder="27" value={form.speed} onChange={e => setForm(f => ({...f, speed:e.target.value}))}
                            style={{ width:"100%", boxSizing:"border-box", background:"#111c35", border:"1px solid #1e2d4a", borderRadius:8, padding:"7px 10px", color:"#e8eaf0", fontSize:13, outline:"none" }} />
                        </div>
                      )}
                      {trackFields.includes("schwimmbahnen") && (
                        <div>
                          <div style={{ fontSize:10, color:"#4a7ab5", marginBottom:3 }}>Bahnen (25m)</div>
                          <input type="number" placeholder="30" value={form.schwimmbahnen} onChange={e => setForm(f => ({...f, schwimmbahnen:e.target.value}))}
                            style={{ width:"100%", boxSizing:"border-box", background:"#111c35", border:"1px solid #1e2d4a", borderRadius:8, padding:"7px 10px", color:"#e8eaf0", fontSize:13, outline:"none" }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <input placeholder="Kommentar (optional)..." value={form.note} onChange={e => setForm(f => ({...f, note:e.target.value}))}
                  style={{ width:"100%", boxSizing:"border-box", background:"#0d1528", border:"1px solid #1e2d4a", borderRadius:10, padding:"9px 12px", color:"#e8eaf0", fontSize:13, outline:"none", marginBottom:10 }} />
                <button onClick={saveEntry} disabled={saving || !form.duration} style={{ width:"100%", background:ATHLETE_COLORS[currentUser], color:"#0a0e1a", border:"none", borderRadius:12, padding:11, fontWeight:800, fontSize:14, cursor:"pointer", opacity:saving?0.6:1 }}>
                  {saving ? "Speichern..." : "💾 Einheit speichern"}
                </button>
              </div>
            )}

            {/* MOTIVATION BANNER */}
            {motiMsg && (
              <div style={{ background:"linear-gradient(135deg,#1a1040,#0f1a35)", borderRadius:14, padding:"12px 14px", marginBottom:12, border:"1px solid #a855f730", borderLeft:"3px solid #a855f7" }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                  <div>
                    <div style={{ fontSize:10, color:"#a855f7", fontWeight:700, letterSpacing:1, marginBottom:5 }}>{motiMsg.ai?"🤖 KI-COACH":"💬 WOCHENCHECK"}</div>
                    <div style={{ fontSize:13, color:"#c4b5d4", lineHeight:1.5 }}>{motiMsg.emoji} {motiMsg.text}</div>
                  </div>
                  <button onClick={() => setMotiMsg(null)} style={{ background:"none", border:"none", color:"#4a7ab5", cursor:"pointer", fontSize:15, padding:2, flexShrink:0 }}>✕</button>
                </div>
                {!motiMsg.ai && (
                  <button onClick={fetchAiMoti} disabled={motiLoading} style={{ marginTop:9, background:"#a855f720", border:"1px solid #a855f740", color:"#a855f7", borderRadius:10, padding:"5px 13px", fontSize:11, fontWeight:700, cursor:"pointer", opacity:motiLoading?0.6:1 }}>
                    {motiLoading ? "⏳ Coach denkt..." : "🤖 KI-Coach fragen"}
                  </button>
                )}
              </div>
            )}

            {/* ENTRIES LIST */}
            {entries.length === 0 ? (
              <div style={{ textAlign:"center", padding:48, color:"#4a7ab5", border:"1px dashed #1e2d4a", borderRadius:16 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🏊🚴🏃</div>
                <div style={{ fontWeight:700 }}>Noch keine Einheiten</div>
                <div style={{ fontSize:12, marginTop:3 }}>Wer trainiert zuerst?</div>
              </div>
            ) : entries.map(e => {
              const isExtra = SPORT_CATEGORY[e.sport] === "extra";
              const bc = isExtra ? "#a855f7" : ATHLETE_COLORS[e.athlete];
              const t = e.tracking || {};
              const dateStr = e.ts?.toDate ? e.ts.toDate().toLocaleDateString("de-DE",{weekday:"short",day:"2-digit",month:"2-digit"}) : "";
              const timeStr = e.ts?.toDate ? e.ts.toDate().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}) : "";
              return (
                <div key={e.id} style={{ background:"#111c35", borderRadius:14, padding:"12px 14px", marginBottom:9, border:`1px solid ${bc}25`, borderLeft:`3px solid ${bc}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontSize:17 }}>{e.emoji}</span>
                        <span style={{ fontWeight:800, fontSize:14 }}>{SPORT_ICONS[e.sport]} {e.sport}</span>
                        <span style={{ fontSize:10, background:ATHLETE_COLORS[e.athlete]+"25", color:ATHLETE_COLORS[e.athlete], padding:"2px 7px", borderRadius:9, fontWeight:700 }}>{e.athlete}</span>
                        {isExtra && <span style={{ fontSize:10, background:"#a855f720", color:"#a855f7", padding:"2px 7px", borderRadius:8, fontWeight:700 }}>EXTRA</span>}
                      </div>
                      {(t.distanz||t.puls_avg||t.pace||t.speed||t.schwimmbahnen) && (
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:5 }}>
                          {t.distanz     && <span style={{ fontSize:11, background:"#0d1528", color:"#4ade80",  padding:"2px 8px", borderRadius:8, fontWeight:700 }}>📍 {t.distanz}{e.sport==="Schwimmen"?"m":"km"}</span>}
                          {t.puls_avg    && <span style={{ fontSize:11, background:"#0d1528", color:"#f87171",  padding:"2px 8px", borderRadius:8, fontWeight:700 }}>❤️ Ø{t.puls_avg}bpm</span>}
                          {t.puls_max    && <span style={{ fontSize:11, background:"#0d1528", color:"#fb923c",  padding:"2px 8px", borderRadius:8, fontWeight:700 }}>⬆️ {t.puls_max}bpm</span>}
                          {t.pace        && <span style={{ fontSize:11, background:"#0d1528", color:"#facc15",  padding:"2px 8px", borderRadius:8, fontWeight:700 }}>⏱ {t.pace}/km</span>}
                          {t.speed       && <span style={{ fontSize:11, background:"#0d1528", color:"#facc15",  padding:"2px 8px", borderRadius:8, fontWeight:700 }}>💨 {t.speed}km/h</span>}
                          {t.schwimmbahnen && <span style={{ fontSize:11, background:"#0d1528", color:"#00e5ff", padding:"2px 8px", borderRadius:8, fontWeight:700 }}>🏊 {t.schwimmbahnen} Bahnen</span>}
                        </div>
                      )}
                      {e.note && <div style={{ fontSize:12, color:"#8ba0c0", marginBottom:3 }}>„{e.note}"</div>}
                      <div style={{ fontSize:11, color:"#4a7ab5" }}>⏱ {e.duration} min · {dateStr} {timeStr}</div>
                    </div>
                    <div style={{ fontSize:24, opacity:0.5, marginLeft:8 }}>{SPORT_ICONS[e.sport]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════ PLAN ══════════ */}
        {tab === "plan" && (
          <div>
            <div style={{ fontSize:17, fontWeight:800, marginBottom:3 }}>Trainingsplan</div>
            <div style={{ fontSize:11, color:"#4a7ab5", marginBottom:12 }}>Inspiriert von Jan Frodeno · 3–4 Tage/Woche · 16 Wochen</div>
            <div style={{ display:"flex", gap:4, overflowX:"auto", marginBottom:14, paddingBottom:4 }}>
              {PLAN.map((w,i) => (
                <button key={i} onClick={() => setSelectedWeek(i)} style={{ minWidth:40, padding:"5px 9px", borderRadius:9, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, background:selectedWeek===i?w.phaseColor:"#111c35", color:selectedWeek===i?"#0a0e1a":i===curWeekIdx?w.phaseColor:"#4a7ab5", outline:i===curWeekIdx?`2px solid ${w.phaseColor}`:"none", outlineOffset:1 }}>W{w.weekNum}</button>
              ))}
            </div>
            <div style={{ background:"#111c35", borderRadius:16, padding:15, border:`1px solid ${week.phaseColor}30`, borderTop:`3px solid ${week.phaseColor}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:10, color:week.phaseColor, letterSpacing:2, fontWeight:700 }}>{week.phase.toUpperCase()}{week.isDeload?" · DELOAD":""}</div>
                  <div style={{ fontSize:16, fontWeight:800 }}>Woche {week.weekNum}</div>
                </div>
                <div style={{ textAlign:"right", fontSize:11, color:"#4a7ab5" }}>
                  ab {formatDate(week.startDate)}
                  {selectedWeek===curWeekIdx && <div style={{ background:week.phaseColor+"25", color:week.phaseColor, borderRadius:7, padding:"2px 7px", fontSize:10, fontWeight:700, marginTop:3 }}>← aktuelle Woche</div>}
                </div>
              </div>
              {week.sessions.map((s,i) => (
                <div key={i} style={{ background:"#0d1528", borderRadius:11, padding:"10px 13px", marginBottom:7, borderLeft:`3px solid ${week.phaseColor}50` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:15 }}>{SPORT_ICONS[s.sport]}</span>
                      <span style={{ fontWeight:700, fontSize:13 }}>{s.desc}</span>
                    </div>
                    <div style={{ display:"flex", gap:5 }}>
                      <span style={{ fontSize:10, background:"#1a2540", color:"#6b8ab0", padding:"2px 7px", borderRadius:7, fontWeight:700 }}>{s.day}</span>
                      {s.duration>0 && <span style={{ fontSize:10, color:week.phaseColor, fontWeight:700 }}>{s.duration}m</span>}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:"#6b8ab0" }}>📋 {s.detail}</div>
                </div>
              ))}
              <div style={{ marginTop:11, padding:"9px 11px", background:"#0d1528", borderRadius:9 }}>
                <div style={{ fontSize:10, color:"#4a7ab5", marginBottom:3 }}>Gesamt Woche</div>
                <div style={{ display:"flex", gap:12 }}>
                  <span style={{ fontSize:12, fontWeight:700 }}>⏱ {week.sessions.reduce((a,s)=>a+s.duration,0)} min</span>
                  <span style={{ fontSize:12, fontWeight:700 }}>📅 {week.sessions.length} Einheiten</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop:12, background:"#111c35", borderRadius:13, padding:"12px 14px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#6b8ab0", marginBottom:7 }}>PHASEN</div>
              {[{name:"Basis",col:"#4ade80",w:"1–4"},{name:"Aufbau",col:"#facc15",w:"5–8"},{name:"Intensität",col:"#fb923c",w:"9–12"},{name:"Peak & Taper",col:"#f87171",w:"13–16"}].map(p => (
                <div key={p.name} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                  <div style={{ width:9, height:9, borderRadius:3, background:p.col }} />
                  <span style={{ fontSize:12, fontWeight:600 }}>{p.name}</span>
                  <span style={{ fontSize:11, color:"#4a7ab5" }}>· Woche {p.w}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ STATS ══════════ */}
        {tab === "stats" && (
          <div>
            <div style={{ fontSize:17, fontWeight:800, marginBottom:12 }}>Euer Duell 🔥</div>
            {[currentUser, other].map(athlete => {
              const mine = entries.filter(e => e.athlete===athlete);
              const triMin   = mine.filter(e=>SPORT_CATEGORY[e.sport]==="tri").reduce((a,e)=>a+e.duration,0);
              const extraMin = mine.filter(e=>SPORT_CATEGORY[e.sport]==="extra").reduce((a,e)=>a+e.duration,0);
              const totalMin = triMin+extraMin;
              const bySport  = {};
              mine.forEach(e=>{ bySport[e.sport]=(bySport[e.sport]||0)+e.duration; });
              const maxMin   = Math.max(...ATHLETES.map(a=>entries.filter(e=>e.athlete===a).reduce((s,e)=>s+e.duration,0)),1);
              const runs     = mine.filter(e=>e.sport==="Laufen"&&e.tracking?.distanz);
              const rides    = mine.filter(e=>e.sport==="Radfahren"&&e.tracking?.distanz);
              const swims    = mine.filter(e=>e.sport==="Schwimmen"&&e.tracking?.distanz);
              const bestRun  = runs.length  ? Math.max(...runs.map(e=>e.tracking.distanz))  : null;
              const bestRide = rides.length ? Math.max(...rides.map(e=>e.tracking.distanz)) : null;
              const bestSwim = swims.length ? Math.max(...swims.map(e=>e.tracking.distanz)) : null;
              const paceRuns = mine.filter(e=>e.sport==="Laufen"&&e.tracking?.pace).sort((a,b)=>a.tracking.pace.localeCompare(b.tracking.pace));
              const bestPace = paceRuns[0]?.tracking?.pace || null;
              return (
                <div key={athlete} style={{ background:"#111c35", borderRadius:16, padding:15, marginBottom:11, borderTop:`3px solid ${ATHLETE_COLORS[athlete]}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:11 }}>
                    <div style={{ fontSize:15, fontWeight:800 }}>{ATHLETE_ICONS[athlete]} {athlete}</div>
                    <div style={{ fontSize:12, color:ATHLETE_COLORS[athlete], fontWeight:700 }}>{mine.length} Einheiten</div>
                  </div>
                  <div style={{ marginBottom:11 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b8ab0", marginBottom:3 }}>
                      <span>Gesamtzeit</span>
                      <span style={{ color:ATHLETE_COLORS[athlete], fontWeight:700 }}>{Math.floor(totalMin/60)}h {totalMin%60}m</span>
                    </div>
                    <div style={{ height:7, background:"#0d1528", borderRadius:7, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:`linear-gradient(90deg,${ATHLETE_COLORS[athlete]}88,${ATHLETE_COLORS[athlete]})`, width:`${(totalMin/maxMin)*100}%`, transition:"width 0.5s" }} />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:7, marginBottom:10 }}>
                    <div style={{ flex:1, background:"#0d1528", borderRadius:9, padding:"7px 9px", border:`1px solid ${ATHLETE_COLORS[athlete]}20` }}>
                      <div style={{ fontSize:9, color:ATHLETE_COLORS[athlete], fontWeight:700, letterSpacing:1, marginBottom:2 }}>TRIATHLON</div>
                      <div style={{ fontSize:13, fontWeight:800 }}>{triMin} min</div>
                    </div>
                    <div style={{ flex:1, background:"#0d1528", borderRadius:9, padding:"7px 9px", border:"1px solid #a855f720" }}>
                      <div style={{ fontSize:9, color:"#a855f7", fontWeight:700, letterSpacing:1, marginBottom:2 }}>EXTRAS</div>
                      <div style={{ fontSize:13, fontWeight:800 }}>{extraMin} min</div>
                    </div>
                  </div>
                  {(bestRun||bestRide||bestSwim||bestPace) && (
                    <div style={{ background:"#0d1528", borderRadius:9, padding:"8px 10px", marginBottom:9 }}>
                      <div style={{ fontSize:9, color:"#facc15", fontWeight:700, letterSpacing:1, marginBottom:6 }}>🏅 BESTLEISTUNGEN</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {bestRun  && <span style={{ fontSize:11, background:"#111c35", color:"#4ade80", padding:"3px 8px", borderRadius:8, fontWeight:700 }}>🏃 {bestRun}km</span>}
                        {bestPace && <span style={{ fontSize:11, background:"#111c35", color:"#facc15", padding:"3px 8px", borderRadius:8, fontWeight:700 }}>⚡ {bestPace}/km</span>}
                        {bestRide && <span style={{ fontSize:11, background:"#111c35", color:"#00e5ff", padding:"3px 8px", borderRadius:8, fontWeight:700 }}>🚴 {bestRide}km</span>}
                        {bestSwim && <span style={{ fontSize:11, background:"#111c35", color:"#818cf8", padding:"3px 8px", borderRadius:8, fontWeight:700 }}>🏊 {bestSwim}m</span>}
                      </div>
                    </div>
                  )}
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {Object.entries(bySport).map(([sport,min]) => (
                      <div key={sport} style={{ background:"#0d1528", borderRadius:9, padding:"5px 8px", border:`1px solid ${SPORT_CATEGORY[sport]==="extra"?"#a855f730":ATHLETE_COLORS[athlete]+"20"}` }}>
                        <div style={{ fontSize:13 }}>{SPORT_ICONS[sport]}</div>
                        <div style={{ fontSize:10, fontWeight:700, color:SPORT_CATEGORY[sport]==="extra"?"#a855f7":ATHLETE_COLORS[athlete] }}>{min}m</div>
                      </div>
                    ))}
                    {Object.keys(bySport).length===0 && <div style={{ fontSize:12, color:"#4a7ab5" }}>Noch keine Einheiten</div>}
                  </div>
                </div>
              );
            })}
            {entries.length>0 && (() => {
              const stats = ATHLETES.map(a=>({ athlete:a, min:entries.filter(e=>e.athlete===a).reduce((s,e)=>s+e.duration,0), triMin:entries.filter(e=>e.athlete===a&&SPORT_CATEGORY[e.sport]==="tri").reduce((s,e)=>s+e.duration,0) }));
              const leader    = stats[0].min>=stats[1].min?stats[0]:stats[1];
              const triLeader = stats[0].triMin>=stats[1].triMin?stats[0]:stats[1];
              return (
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <div style={{ flex:1, background:"#111c35", borderRadius:14, padding:13, border:"1px solid #facc1530", textAlign:"center" }}>
                    <div style={{ fontSize:20 }}>🏆</div>
                    <div style={{ fontSize:13, fontWeight:800, marginTop:3 }}>{leader.athlete}</div>
                    <div style={{ fontSize:10, color:"#6b8ab0", marginTop:2 }}>Gesamt-Lead</div>
                  </div>
                  <div style={{ flex:1, background:"#111c35", borderRadius:14, padding:13, border:"1px solid #00e5ff20", textAlign:"center" }}>
                    <div style={{ fontSize:20 }}>🏊🚴🏃</div>
                    <div style={{ fontSize:13, fontWeight:800, marginTop:3 }}>{triLeader.athlete}</div>
                    <div style={{ fontSize:10, color:"#6b8ab0", marginTop:2 }}>Tri-Lead</div>
                  </div>
                </div>
              );
            })()}
            <button onClick={fetchAiMoti} disabled={motiLoading} style={{ width:"100%", background:"#1a1040", color:"#a855f7", border:"1px solid #a855f730", borderRadius:12, padding:10, fontWeight:700, fontSize:12, cursor:"pointer", opacity:motiLoading?0.6:1 }}>
              {motiLoading?"⏳ Coach denkt...":"🤖 KI-Coach Motivation holen"}
            </button>
          </div>
        )}

        {/* ══════════ CHAT ══════════ */}
        {tab === "chat" && <ChatTab currentUser={currentUser} />}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"#0d1528", borderTop:"1px solid #1e2d4a", display:"flex", paddingBottom:"env(safe-area-inset-bottom, 0px)" }}>
        {[{id:"feed",icon:"📡",label:"Feed"},{id:"plan",icon:"📋",label:"Plan"},{id:"stats",icon:"⚡",label:"Duell"},{id:"chat",icon:"💬",label:"Chat"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"11px 0 9px", border:"none", background:"transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, borderTop:`2px solid ${tab===t.id?ATHLETE_COLORS[currentUser]:"transparent"}` }}>
            <span style={{ fontSize:19 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:700, color:tab===t.id?ATHLETE_COLORS[currentUser]:"#4a7ab5" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── CHAT COMPONENT ───────────────────────────────────────────────────────────
function ChatTab({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("ts", "asc"), limit(200));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
    });
    return unsub;
  }, []);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setSending(true);
    try {
      await addDoc(collection(db, "messages"), { author:currentUser, text, ts:serverTimestamp() });
      setInput("");
    } catch(e) {}
    setSending(false);
  }

  const other = currentUser === "Smitty" ? "J-Smooth" : "Smitty";

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:17, fontWeight:800 }}>💬 Chat</div>
          <div style={{ fontSize:11, color:"#4a7ab5", marginTop:1 }}>{ATHLETE_ICONS[currentUser]} Du · {ATHLETE_ICONS[other]} {other}</div>
        </div>
      </div>

      <div style={{ background:"#0d1528", borderRadius:16, padding:11, height:360, overflowY:"auto", border:"1px solid #1e2d4a", marginBottom:11, display:"flex", flexDirection:"column", gap:7 }}>
        {messages.length === 0 ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#4a7ab5" }}>
            <div style={{ fontSize:30, marginBottom:7 }}>💬</div>
            <div style={{ fontWeight:700 }}>Noch keine Nachrichten</div>
            <div style={{ fontSize:12, marginTop:3 }}>Wer trainiert heute?</div>
          </div>
        ) : messages.map(msg => {
          const isMe = msg.author === currentUser;
          const timeStr = msg.ts?.toDate ? msg.ts.toDate().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}) : "";
          return (
            <div key={msg.id} style={{ display:"flex", flexDirection:"column", alignItems:isMe?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"80%", padding:"8px 12px", borderRadius:isMe?"15px 15px 3px 15px":"15px 15px 15px 3px", background:isMe?ATHLETE_COLORS[currentUser]+"22":"#1a2540", border:`1px solid ${isMe?ATHLETE_COLORS[currentUser]+"45":"#2a3a5a"}` }}>
                <div style={{ fontSize:13, color:"#e8eaf0", lineHeight:1.45 }}>{msg.text}</div>
              </div>
              <div style={{ fontSize:10, color:"#3a5070", marginTop:2 }}>
                <span style={{ color:ATHLETE_COLORS[msg.author], fontWeight:700 }}>{ATHLETE_ICONS[msg.author]} {msg.author}</span> · {timeStr}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ display:"flex", gap:7 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder={`Schreib ${other} was...`}
          style={{ flex:1, background:"#111c35", border:"1px solid #1e2d4a", borderRadius:12, padding:"10px 13px", color:"#e8eaf0", fontSize:13, outline:"none" }} />
        <button onClick={send} disabled={sending||!input.trim()} style={{ background:ATHLETE_COLORS[currentUser], color:"#0a0e1a", border:"none", borderRadius:12, padding:"10px 17px", fontWeight:800, fontSize:15, cursor:"pointer", opacity:sending||!input.trim()?0.45:1 }}>➤</button>
      </div>

      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:9 }}>
        {["💪 War heute im Training!","😅 Heute wird nix mehr...","🔥 Wann trainierst du?","🏊 Pool morgen?","🚴 Fahrt am Wochenende?","😎 Keine Ausreden!","🏃 5km heute?","🎾 Padel später?"].map(q => (
          <button key={q} onClick={()=>setInput(q)} style={{ background:"#111c35", border:"1px solid #1e2d4a", color:"#6b8ab0", borderRadius:18, padding:"4px 10px", fontSize:10, cursor:"pointer", fontWeight:600 }}>{q}</button>
        ))}
      </div>
    </div>
  );
}

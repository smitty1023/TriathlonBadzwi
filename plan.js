export function generatePlan() {
  const planStart = new Date("2026-05-25");
  const phases = [
    { name: "Basis",       weeks: [1,2,3,4],   color: "#4ade80" },
    { name: "Aufbau",      weeks: [5,6,7,8],   color: "#facc15" },
    { name: "Intensität",  weeks: [9,10,11,12], color: "#fb923c" },
    { name: "Peak & Taper",weeks: [13,14,15,16],color: "#f87171" },
  ];
  const sessions = [
    [{ day:"Di",sport:"Schwimmen",desc:"Technik-Schwimmen",duration:30,detail:"4×100m Pause 30s, Fokus Gleiten" },{ day:"Do",sport:"Laufen",desc:"Lockerer Dauerlauf",duration:35,detail:"Puls 130-140, Grundlage aufbauen" },{ day:"Sa",sport:"Radfahren",desc:"Grundlagenfahrt",duration:60,detail:"Zone 2, flache Strecke, Tritt ≥85 rpm" },{ day:"So",sport:"Laufen",desc:"Langer Lauf",duration:45,detail:"Sehr locker, Puls <140" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Ausdauer-Schwimmen",duration:35,detail:"600m kontinuierlich, danach 4×50m Sprints" },{ day:"Do",sport:"Radfahren",desc:"Intervallfahrt",duration:45,detail:"5×3 min Zone 3, Pause 2 min" },{ day:"Sa",sport:"Laufen",desc:"Tempodauerlauf",duration:40,detail:"Mittelstrecke, Puls 145-155" },{ day:"So",sport:"Schwimmen",desc:"Regeneration",duration:30,detail:"Ruhiges Schwimmen, Technikfokus" }],
    [{ day:"Di",sport:"Laufen",desc:"Fahrtspiel",duration:40,detail:"10 min warm up, 5×2 min flott / 2 min traben" },{ day:"Do",sport:"Schwimmen",desc:"Streckenausdauer",duration:35,detail:"750m non-stop, Rennpace" },{ day:"Sa",sport:"Radfahren",desc:"Lange Fahrt",duration:75,detail:"Zone 2, Verpflegung üben" },{ day:"So",sport:"Laufen",desc:"Easy Run",duration:30,detail:"Sehr locker, frisch bleiben" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Deload – Technik",duration:25,detail:"Nur Technik, kein Druck" },{ day:"Do",sport:"Laufen",desc:"Deload – locker",duration:30,detail:"Puls <130, Regeneration" },{ day:"Sa",sport:"Radfahren",desc:"Deload – Fahrt",duration:45,detail:"Zone 1-2, locker rollen" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Intervall-Schwimmen",duration:40,detail:"8×100m mit 20s Pause, Rennpace" },{ day:"Do",sport:"Radfahren",desc:"Schwelle",duration:50,detail:"3×8 min an der Schwelle, Pause 4 min" },{ day:"Sa",sport:"Brick",desc:"Brick-Training",duration:60,detail:"45 min Rad + sofort 15 min Laufen" },{ day:"So",sport:"Laufen",desc:"Langer Lauf",duration:50,detail:"Zone 2, konstantes Tempo" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Rennsimulation",duration:35,detail:"750m Rennpace, dann 4×50m Speed" },{ day:"Do",sport:"Laufen",desc:"Tempointervalle",duration:45,detail:"3×1 km Renntempo, Pause 2 min" },{ day:"Sa",sport:"Radfahren",desc:"Hügel",duration:60,detail:"Hügel suchen, Kraft und Technik" },{ day:"So",sport:"Schwimmen",desc:"Aerob",duration:35,detail:"1200m locker, Technikfokus" }],
    [{ day:"Di",sport:"Brick",desc:"Kurz-Brick",duration:55,detail:"30 min Rad + 20 min Laufen, Wettkampfpace" },{ day:"Do",sport:"Schwimmen",desc:"Sprint-Intervalle",duration:35,detail:"10×50m Sprint, Pause 30s" },{ day:"Sa",sport:"Radfahren",desc:"Lange Fahrt",duration:90,detail:"Zone 2, Ernährung üben, 27km+ Strecke" },{ day:"So",sport:"Laufen",desc:"Mittellanger Lauf",duration:50,detail:"Gleichmäßiges Tempo, Puls 145" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Deload",duration:25,detail:"Locker, Technik" },{ day:"Do",sport:"Laufen",desc:"Deload",duration:30,detail:"Sehr locker" },{ day:"Sa",sport:"Radfahren",desc:"Deload",duration:45,detail:"Zone 1, Regeneration" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Race-Pace-Schwimmen",duration:40,detail:"2×750m Rennpace, Pause 3 min" },{ day:"Do",sport:"Radfahren",desc:"VO2max Intervalle",duration:55,detail:"6×4 min VO2max, Pause 3 min" },{ day:"Sa",sport:"Brick",desc:"Rennsimulation Brick",duration:70,detail:"27 km Rad + 5,4 km Laufen – Rennpace!" },{ day:"So",sport:"Laufen",desc:"Easy Recovery",duration:30,detail:"Sehr locker, Puls <130" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Strecke + Speed",duration:40,detail:"500m Rennpace, 10×50m Max" },{ day:"Do",sport:"Laufen",desc:"5km-Test",duration:35,detail:"5 km so schnell wie möglich – Zeitnahme!" },{ day:"Sa",sport:"Radfahren",desc:"Rennstrecke",duration:75,detail:"27 km Rennstrecke, Zeitnahme" },{ day:"So",sport:"Schwimmen",desc:"Regeneration",duration:30,detail:"Locker, Dehnen im Wasser" }],
    [{ day:"Di",sport:"Brick",desc:"Wettkampf-Brick",duration:75,detail:"Komplette Sprint-Distanz simulieren" },{ day:"Do",sport:"Schwimmen",desc:"Technik & Speed",duration:35,detail:"Fokus Wende, Startsprung" },{ day:"Sa",sport:"Radfahren",desc:"Intervallfahrt",duration:60,detail:"5×5 min Schwelle, Pause 3 min" },{ day:"So",sport:"Laufen",desc:"Tempodauerlauf",duration:40,detail:"Puls 150-160, Rennpace Feeling" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Deload",duration:25,detail:"Locker" },{ day:"Do",sport:"Laufen",desc:"Deload",duration:25,detail:"Locker" },{ day:"Sa",sport:"Radfahren",desc:"Deload",duration:40,detail:"Locker rollen" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Kurze Schwelle",duration:30,detail:"4×100m Rennpace, dann locker" },{ day:"Do",sport:"Radfahren",desc:"Kurze Intervalle",duration:40,detail:"3×5 min Zone 4, Beine frisch halten" },{ day:"Sa",sport:"Brick",desc:"Kurz-Brick",duration:50,detail:"20 min Rad Rennpace + 15 min Laufen" },{ day:"So",sport:"Laufen",desc:"Locker",duration:25,detail:"Sehr entspannt" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Renngefühl",duration:25,detail:"750m Rennpace – ein letztes Mal" },{ day:"Do",sport:"Laufen",desc:"Lockerheit",duration:25,detail:"Kurze Steigerungen, Beine wach" },{ day:"Sa",sport:"Radfahren",desc:"Activation",duration:35,detail:"Locker mit 3×2 min flottes Treten" }],
    [{ day:"Di",sport:"Schwimmen",desc:"Super kurz",duration:20,detail:"400m locker, Technik genießen" },{ day:"Do",sport:"Laufen",desc:"Joggen",duration:15,detail:"15 min locker, Beine ausschütteln" }],
    [{ day:"Mo",sport:"Schwimmen",desc:"Mini-Aktivierung",duration:15,detail:"300m locker, lächeln" },{ day:"Di",sport:"Laufen",desc:"Mini-Aktivierung",duration:10,detail:"10 min lockeres Traben" },{ day:"So",sport:"Radfahren",desc:"🏁 RENNTAG!",duration:0,detail:"Sprint-Triathlon – alles geben!" }],
  ];
  return Array.from({ length: 16 }, (_, w) => {
    const weekStart = new Date(planStart);
    weekStart.setDate(planStart.getDate() + w * 7);
    const phase = phases.find(p => p.weeks.includes(w + 1));
    return { weekNum: w+1, phase: phase.name, phaseColor: phase.color, startDate: weekStart, sessions: sessions[w], isDeload: [4,8,12].includes(w+1) };
  });
}

export function getCurrentWeek() {
  const diff = Math.floor((new Date() - new Date("2026-05-25")) / (7*24*60*60*1000));
  return Math.max(0, Math.min(diff, 15));
}

export const RACE_DATE = new Date("2026-08-31");
export const ATHLETES = ["Smitty", "J-Smooth"];
export const ATHLETE_COLORS = { Smitty: "#00e5ff", "J-Smooth": "#ff6b35" };
export const ATHLETE_ICONS  = { Smitty: "🔵", "J-Smooth": "🟠" };

export const SPORT_ICONS = {
  Schwimmen: "🏊", Radfahren: "🚴", Laufen: "🏃", Brick: "🔥",
  Krafttraining: "🏋️", Basketball: "🏀", Padel: "🎾",
  Yoga: "🧘", Wandern: "🥾", Anderes: "⚡",
};

export const SPORT_CATEGORY = {
  Schwimmen: "tri", Radfahren: "tri", Laufen: "tri", Brick: "tri",
  Krafttraining: "extra", Basketball: "extra", Padel: "extra",
  Yoga: "extra", Wandern: "extra", Anderes: "extra",
};

export const TRACKING_FIELDS = {
  Laufen:    ["distanz", "puls_avg", "puls_max", "pace"],
  Radfahren: ["distanz", "puls_avg", "puls_max", "speed"],
  Schwimmen: ["distanz", "schwimmbahnen"],
  Brick:     ["distanz", "puls_avg"],
  Wandern:   ["distanz"],
};

export const MOTI_MESSAGES = [
  { emoji: "🔥", text: "Diese Woche war ruhig – aber der 31. August wartet nicht! Nächste Woche gebt ihr Gas, oder?" },
  { emoji: "😤", text: "Hey, auch eine leichte Woche bringt euch näher ans Ziel. Jetzt wieder anziehen – gemeinsam!" },
  { emoji: "💪", text: "Jan Frodeno hatte auch Wochen wo er lieber auf dem Sofa saß. Dann hat er trotzdem trainiert. Ihr schafft das!" },
  { emoji: "🏁", text: "Noch ein paar Wochen bis zum Rennen. Jede Einheit zählt – auch die kleine. Macht euch warm!" },
  { emoji: "🤜🤛", text: "Einer von euch muss anfangen. Und dann zieht der andere nach. Wer macht heute den ersten Schritt?" },
  { emoji: "😎", text: "Padel und Basketball zählen auch – aber der Triathlon trainiert sich nicht von selbst!" },
];

// 🎂 Birthday banner – set to null to hide
// Format: { athlete: "J-Smooth", until: "2026-05-25" }  ← removes itself after this date
export const BIRTHDAY = { athlete: "J-Smooth", until: "2026-05-25" };

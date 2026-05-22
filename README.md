# 🏁 Tri-Duell – Smitty & J-Smooth

Sprint Triathlon App für zwei. Firebase-Backend, läuft als PWA auf dem iPhone.

---

## 🚀 Setup in ~15 Minuten

### Schritt 1 – Firebase Projekt einrichten

1. Geh zu https://console.firebase.google.com
2. **"Projekt erstellen"** → Name z.B. `tri-duell`
3. Google Analytics: egal, kannst du überspringen

**Firestore aktivieren:**
- Links im Menü → **Firestore Database**
- **"Datenbank erstellen"**
- Modus: **Testmodus** (reicht für euch zwei, läuft 30 Tage offen – kannst du später sichern)
- Standort: `europe-west1` (Frankfurt)

**Web App registrieren:**
- Oben links ⚙️ → **Projekteinstellungen**
- Runterscrollen zu **"Deine Apps"** → `</>`  (Web-Icon)
- App-Name: `tri-duell`, **kein** Firebase Hosting anhaken
- Du siehst jetzt einen `firebaseConfig` Block – den brauchst du gleich

---

### Schritt 2 – Firebase Config eintragen

Öffne die Datei `src/firebase.js` und ersetze die Platzhalter mit deinen echten Werten:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",        // ← dein Wert
  authDomain:        "tri-duell.firebaseapp.com",
  projectId:         "tri-duell",
  storageBucket:     "tri-duell.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
};
```

---

### Schritt 3 – Auf GitHub pushen

```bash
# Im Projektordner:
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/tri-duell.git
git push -u origin main
```

---

### Schritt 4 – GitHub Pages deployen

1. In `package.json` diese Zeile ergänzen (ganz oben, nach `"name"`):
   ```json
   "homepage": "https://DEIN-USERNAME.github.io/tri-duell",
   ```
   Und unter `"scripts"`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```

2. `gh-pages` installieren:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Deployen:
   ```bash
   npm run deploy
   ```

4. Auf GitHub → Repo → **Settings → Pages** → Source: `gh-pages` Branch

Deine App läuft dann unter:
**`https://DEIN-USERNAME.github.io/tri-duell`**

---

### Schritt 5 – Als iPhone App installieren

1. URL in **Safari** (nicht Chrome!) öffnen
2. Teilen-Symbol (□↑) antippen
3. **"Zum Home-Bildschirm"** → Fertig 🎉

Sieht aus wie eine echte App, öffnet sich ohne Browser-UI.

---

## 🎂 Birthday Banner entfernen

Nach Samstag einfach in `src/constants.js`:
```js
export const BIRTHDAY = null;  // ← einfach null setzen
```
Dann `npm run deploy` – fertig.

---

## 🔒 Firestore absichern (optional, nach 30 Tagen)

In Firebase Console → Firestore → **Regeln**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // nur ihr beide nutzt es, reicht so
    }
  }
}
```

---

## 📁 Projektstruktur

```
src/
  App.js          ← Haupt-App
  firebase.js     ← Firebase Config (← hier deine Keys eintragen)
  constants.js    ← Namen, Farben, Birthday
  plan.js         ← Trainingsplan
public/
  index.html      ← PWA Meta-Tags
  manifest.json   ← App-Icon & Name
```

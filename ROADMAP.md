# Solo Companion — Full Roadmap

## What you're building
A guitar theory app where you build a chord progression (by typing chord names or selecting notes),
hit analyze, and get a full breakdown: key, chord functions, what scales to solo with, and a
visual fretboard diagram of where to play those notes.

---

## Getting started right now

```bash
# 1. Clone / init your project
cd solo-companion
git init
git add .
git commit -m "feat: initial scaffold"

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env
# Open .env and paste your Anthropic API key as VITE_ANTHROPIC_API_KEY

# 4. Run it
npm run dev
# Open http://localhost:5173
```

Get your free Anthropic API key at: https://console.anthropic.com

---

## Project structure

```
solo-companion/
├── src/
│   ├── types/
│   │   └── index.ts          ← all TypeScript types (Chord, Analysis, etc.)
│   ├── lib/
│   │   ├── chords.ts         ← chord logic: build, parse, identify, scale positions
│   │   └── claude.ts         ← Claude API call + prompt
│   ├── components/
│   │   ├── ChordPill.tsx     ← a single chord tag in the progression builder
│   │   ├── NoteSelector.tsx  ← click notes to identify a chord
│   │   ├── Fretboard.tsx     ← SVG fretboard diagram
│   │   └── AnalysisPanel.tsx ← full analysis output (key, functions, tips, scales)
│   ├── App.tsx               ← main app shell, state management
│   └── main.tsx              ← entry point
├── .env.example              ← copy to .env, add your key
├── ROADMAP.md                ← this file
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Day-by-day build plan

### Day 1 — Get it running, understand the code
- Run `npm install && npm run dev`
- Read through `chords.ts` — understand how chord notes are built from intervals
- Read through `claude.ts` — understand the prompt structure
- Try adding a chord by name (Am, G, Cmaj7) and clicking analyze
- **Git habit**: commit after each thing you get working

### Day 2 — Fix and extend chord logic
- Test the note selector — click notes, see if chords are identified correctly
- Add more chord qualities to `CHORD_INTERVALS` if you find gaps (e.g. m9, 9, 13)
- Improve the chord name parser in `parseChordName()` to handle more variations
- Tweak the Claude prompt in `claude.ts` if the explanations aren't at the right level

### Day 3 — Fretboard improvements
- The fretboard currently shows frets 4-8 (box 1 area). Add a way to shift the position up/down
- Add a "whole neck" view that shows all occurrences of scale notes, not just one box
- Try rendering open strings (fret 0) for common open-position scales

### Day 4 — Saved progressions
- Use localStorage to save progressions the user likes
- Build a simple sidebar or list of saved progressions with a name/label
- Load a saved progression back into the builder

### Day 5 — Polish the UI
- Make it look exactly how you want it
- Add transitions when analysis appears
- Test on mobile — make sure the fretboard is readable on a small screen
- Add a loading skeleton while Claude is thinking

### Day 6-7 — Stretch features (pick what excites you)
See "Future features" section below.

---

## How the Claude prompt works

The core of the app is in `src/lib/claude.ts`. The prompt tells Claude:
1. You are a guitar teacher for a beginner-intermediate player
2. Here is the progression and the notes in each chord
3. Return JSON in exactly this shape

**Tweaking the prompt** is how you customize the app for yourself. If the explanations
are too technical, add: "Explain everything as if the player has never studied theory formally."
If you want more specific fretboard advice, add: "Always mention specific fret numbers and strings."

The prompt returns structured JSON so the app can render it in a nice UI rather than
just showing a wall of text.

---

## Future features (after the basics work)

### Music-focused
- **Capo support** — "I'm using a capo on fret 2, here's the progression I'm fingering"
- **Mode explainer** — "Why does this sound Dorian vs Aeolian?"
- **Tension/resolution map** — visual indicator of which chords create tension and which resolve
- **Common song examples** — "Other songs that use this exact progression"
- **Scale comparison** — show two scales side by side on the fretboard, highlighted differently
- **Chord substitutions** — suggest chords that could replace one in your progression

### App-focused
- **Session history** — every analysis you've done, browsable
- **Export as image** — screenshot the fretboard diagram to share
- **Tempo + play along** — metronome that cycles through the chords at a set BPM
- **Dark/light mode toggle**
- **Mobile app** — wrap it in Capacitor or React Native if you want it on your phone

---

## Key concepts to understand as you build

**tonal.js** (imported as `@tonaljs/tonal`) is a music theory library you can use for
more complex analysis — it knows about keys, modes, chord detection, and more. You're
currently doing chord logic by hand (in `chords.ts`) which is good for learning,
but tonal.js can fill in gaps.

**The fretboard SVG** in `Fretboard.tsx` is hand-drawn using SVG coordinates. The strings
are horizontal lines, frets are vertical lines, and notes are circles. The math is:
- x = 70 + (fretIndex * 54) + 27 (centered between fret lines)
- y = 20 + (stringIndex * 26)

**State lives in App.tsx**: chords array, analysis result, loading state.
Components are "dumb" — they receive data via props and call callbacks.
This is standard React architecture.

---

## Git workflow to practice

```bash
# Start a new feature
git checkout -b feat/saved-progressions

# Work on it, commit as you go
git add src/components/SavedProgressions.tsx
git commit -m "feat: add saved progressions sidebar"

git add src/App.tsx
git commit -m "feat: wire up save/load to App state"

# Merge back when done
git checkout main
git merge feat/saved-progressions

# Push to GitHub (good habit)
git push origin main
```

Treat every feature as its own branch. This is exactly the workflow you'll use at Palantir.

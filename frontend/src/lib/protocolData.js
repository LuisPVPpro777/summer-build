// Static configuration of the Protocole Summer Build

export const DAILY_CHECKLIST = [
  {
    id: "wakeup",
    time: "09:30",
    timeMinutes: 9 * 60 + 30,
    title: "Réveil & Douche",
    detail: "Terminer obligatoirement par 30 secondes d'eau très froide.",
    category: "matin",
  },
  {
    id: "skin",
    time: "09:40",
    timeMinutes: 9 * 60 + 40,
    title: "Peau",
    detail: "Appliquer la crème hydratante (CeraVe / Deliplus) sur visage, bras et torse.",
    category: "matin",
  },
  {
    id: "smile",
    time: "09:45",
    timeMinutes: 9 * 60 + 45,
    title: "Attitude",
    detail: "10 répétitions du « sourire séducteur » devant le miroir (lèvres étirées, pas de dents).",
    category: "matin",
  },
  {
    id: "breakfast",
    time: "10:00",
    timeMinutes: 10 * 60,
    title: "Carburant",
    detail: "3 œufs, 1 tranche de pain, 1 fruit, 1 grand verre d'eau.",
    category: "nutrition",
  },
  {
    id: "tan",
    time: "14:00",
    timeMinutes: 14 * 60,
    title: "Bronzage (1h max)",
    detail: "30 min face au soleil, 30 min dos au soleil.",
    category: "exterieur",
  },
  {
    id: "physical",
    time: "18:00",
    timeMinutes: 18 * 60,
    title: "Système Physique",
    detail: "CrossFit • OU Séance Maison (15 min) • OU Repos complet.",
    category: "sport",
  },
  {
    id: "shutdown",
    time: "00:30",
    timeMinutes: 24 * 60 + 30, // late night
    title: "Extinction",
    detail: "Dans le lit, lumière éteinte.",
    category: "sommeil",
  },
];

export const INVARIANT_RULES = [
  {
    id: "sleep",
    code: "01",
    title: "Sommeil",
    spec: "9h / 6 cycles",
    detail: "Coucher 00:30 → Réveil 09:30. Aucune dérive.",
  },
  {
    id: "food",
    code: "02",
    title: "Alimentation",
    spec: "Ordre strict — Midi & Soir",
    detail: "1. Viande / Poisson  →  2. Légumes  →  3. Féculents. STOP dès la satiété.",
  },
  {
    id: "sport",
    code: "03",
    title: "Sport — Enchaînement",
    spec: "Séance Maison • 18:00",
    detail: "Toujours le lendemain d'un CrossFit. Si 2 CrossFit consécutifs, la Maison se décale au 1er jour sans sport.",
  },
  {
    id: "hair",
    code: "04",
    title: "Cheveux",
    spec: "Zéro entretien",
    detail: "Après la douche : serviette → vers l'arrière à la main → séchage à l'air libre.",
  },
  {
    id: "posture",
    code: "05",
    title: "Posture",
    spec: "À chaque passage de porte",
    detail: "Épaules basses • Poitrine sortie • Menton parallèle au sol.",
  },
];

export const HOME_WORKOUT = {
  title: "Séance Maison",
  duration: "15 minutes",
  focus: "V-SHAPE",
  blocks: [
    {
      id: "warmup",
      label: "Chauffe",
      duration: "1 min",
      detail: "Rotations bras + poignets.",
    },
    {
      id: "pushups",
      label: "Pompes",
      duration: "7 min",
      detail: "4 séries jusqu'à l'échec • 1 min repos strict entre séries.",
    },
    {
      id: "plank",
      label: "Gainage",
      duration: "7 min",
      detail: "4 × 1 min planche (avant-bras, dos droit, abdos serrés) • 45 sec repos.",
    },
  ],
};

// Helper - current time in minutes since midnight
export const minutesNow = (date = new Date()) =>
  date.getHours() * 60 + date.getMinutes();

// Parse "HH:MM" into minutes since midnight
export const parseTimeToMinutes = (str) => {
  if (!str) return 0;
  const [h, m] = str.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Merge default tasks + custom tasks, sort by timeMinutes
export const mergeAndSortTasks = (customTasks = []) => {
  const customNormalized = customTasks.map((t) => ({
    ...t,
    timeMinutes: parseTimeToMinutes(t.time),
    isCustom: true,
  }));
  return [...DAILY_CHECKLIST, ...customNormalized].sort(
    (a, b) => a.timeMinutes - b.timeMinutes
  );
};

// Determine active task index based on now (last task whose time <= now)
export const computeActiveTaskId = (tasks = DAILY_CHECKLIST, date = new Date()) => {
  const now = minutesNow(date);
  // Late-night shutdown window (00:00 - 02:00) — keep "shutdown" active if present
  if (now >= 0 && now < 2 * 60) {
    const sd = tasks.find((t) => t.id === "shutdown");
    if (sd) return "shutdown";
  }
  let active = null;
  for (const t of tasks) {
    if (t.id === "shutdown") continue;
    if (now >= t.timeMinutes) active = t.id;
  }
  return active;
};

import { useCallback, useEffect, useMemo, useState } from "react";
import { SESSION_PHASES as DEFAULT_PHASES } from "@/lib/workoutSession";

const STORAGE_KEY = "protocole-summer-build:workout:v1";

// We persist a snapshot (data URLs for images can be heavy → resize before storing).
// Validate that loaded data has the expected shape; fall back to defaults on any issue.
const isValidPhase = (p) =>
  p &&
  typeof p === "object" &&
  typeof p.id === "string" &&
  (p.type === "work" || p.type === "rest") &&
  typeof p.label === "string";

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isValidPhase)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const save = (phases) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(phases));
  } catch (e) {
    if (e?.name === "QuotaExceededError") {
      // Try to drop oversized image data URLs from oldest phases to fit
      const trimmed = phases.map((p) =>
        p.image && p.image.length > 80_000 ? { ...p, image: "" } : p
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {}
    }
  }
};

const newId = () =>
  `phase-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const blankWork = () => ({
  id: newId(),
  type: "work",
  label: "Nouvel exercice",
  target: 60,
  tutorial: "",
  image: "",
  sub: "",
});

const blankRest = () => ({
  id: newId(),
  type: "rest",
  label: "Repos",
  duration: 45,
});

export const useWorkoutPhases = () => {
  const [phases, setPhases] = useState(DEFAULT_PHASES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = load();
    setPhases(loaded || DEFAULT_PHASES);
    setHydrated(true);
  }, []);

  const commit = useCallback((updater) => {
    setPhases((prev) => {
      const next =
        typeof updater === "function" ? updater(prev) : updater;
      save(next);
      return next;
    });
  }, []);

  const updatePhase = useCallback(
    (id, patch) => {
      commit((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    },
    [commit]
  );

  const removePhase = useCallback(
    (id) => {
      commit((prev) => prev.filter((p) => p.id !== id));
    },
    [commit]
  );

  const movePhase = useCallback(
    (id, direction) => {
      commit((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx < 0) return prev;
        const swap = direction === "up" ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= prev.length) return prev;
        const next = [...prev];
        [next[idx], next[swap]] = [next[swap], next[idx]];
        return next;
      });
    },
    [commit]
  );

  const addPhase = useCallback(
    (type, position) => {
      commit((prev) => {
        const item = type === "rest" ? blankRest() : blankWork();
        if (typeof position === "number" && position >= 0 && position <= prev.length) {
          const next = [...prev];
          next.splice(position, 0, item);
          return next;
        }
        return [...prev, item];
      });
    },
    [commit]
  );

  const resetToDefault = useCallback(() => {
    commit(() => DEFAULT_PHASES);
  }, [commit]);

  // Computed: enrich rest phases with the next work phase's label/image for runtime display
  const enrichedPhases = useMemo(() => {
    return phases.map((p, i) => {
      if (p.type !== "rest") return p;
      const nextWork = phases.slice(i + 1).find((x) => x.type === "work");
      return {
        ...p,
        nextLabel: nextWork?.label || "Suite",
        nextImage: nextWork?.image || "",
        nextDetail: nextWork?.tutorial || "",
      };
    });
  }, [phases]);

  return {
    hydrated,
    phases,             // raw user-edited phases
    enrichedPhases,     // ready for WorkoutSession runtime
    addPhase,
    removePhase,
    updatePhase,
    movePhase,
    resetToDefault,
  };
};

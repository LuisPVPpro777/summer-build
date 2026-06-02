import { useCallback, useEffect, useState, useMemo } from "react";
import { DAILY_CHECKLIST, mergeAndSortTasks } from "@/lib/protocolData";

const STORAGE_KEY = "protocole-summer-build:v1";
const CUSTOM_TASKS_KEY = "protocole-summer-build:custom-tasks:v1";

const todayStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const yesterdayStr = (d = new Date()) => {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return todayStr(y);
};

const defaultState = () => ({
  date: todayStr(),
  checks: {},
  streak: 0,
  bestStreak: 0,
  history: {},
});

const computeCompletion = (checks, totalCount) => {
  const done = Object.values(checks).filter(Boolean).length;
  return totalCount === 0 ? 0 : Math.min(done / totalCount, 1);
};

const loadStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      checks: parsed.checks || {},
      history: parsed.history || {},
    };
  } catch {
    return defaultState();
  }
};

const saveStore = (s) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
};

const loadCustomTasks = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCustomTasks = (tasks) => {
  try {
    localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(tasks));
  } catch {}
};

const applyDayReset = (state, totalCount) => {
  const today = todayStr();
  if (state.date === today) return state;
  const prevCompletion = computeCompletion(state.checks, totalCount);
  const newHistory = {
    ...state.history,
    [state.date]: {
      completion: prevCompletion,
      checks: state.checks,
    },
  };
  const wasYesterday = state.date === yesterdayStr();
  let newStreak = 0;
  if (wasYesterday && prevCompletion >= 1) {
    newStreak = (state.streak || 0) + 1;
  }
  return {
    ...state,
    date: today,
    checks: {},
    streak: newStreak,
    bestStreak: Math.max(state.bestStreak || 0, newStreak),
    history: newHistory,
  };
};

export const useProtocolStore = () => {
  const [store, setStore] = useState(defaultState);
  const [customTasks, setCustomTasks] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Initial load
  useEffect(() => {
    const customs = loadCustomTasks();
    setCustomTasks(customs);
    const totalCount = DAILY_CHECKLIST.length + customs.length;
    const initial = loadStore();
    const reset = applyDayReset(initial, totalCount);
    saveStore(reset);
    setStore(reset);
    setHydrated(true);
  }, []);

  const tasks = useMemo(() => mergeAndSortTasks(customTasks), [customTasks]);
  const total = tasks.length;
  const completion = computeCompletion(store.checks, total);
  const completedCount = Object.values(store.checks).filter(Boolean).length;

  const toggle = useCallback((id) => {
    setStore((prev) => {
      const next = {
        ...prev,
        checks: { ...prev.checks, [id]: !prev.checks[id] },
      };
      saveStore(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStore((prev) => {
      const next = { ...prev, checks: {} };
      saveStore(next);
      return next;
    });
  }, []);

  const addCustomTask = useCallback((task) => {
    const newTask = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: task.time,
      title: task.title,
      detail: task.detail || "",
      category: "custom",
    };
    setCustomTasks((prev) => {
      const next = [...prev, newTask];
      saveCustomTasks(next);
      return next;
    });
    return newTask;
  }, []);

  const removeCustomTask = useCallback((id) => {
    setCustomTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveCustomTasks(next);
      return next;
    });
    // also clean up its check entry so it doesn't skew completion
    setStore((prev) => {
      if (!(id in prev.checks)) return prev;
      const nextChecks = { ...prev.checks };
      delete nextChecks[id];
      const next = { ...prev, checks: nextChecks };
      saveStore(next);
      return next;
    });
  }, []);

  const last7 = useMemo(() => {
    const out = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(d);
      dd.setDate(dd.getDate() - i);
      const key = todayStr(dd);
      const isToday = key === store.date;
      const val = isToday ? completion : store.history?.[key]?.completion ?? 0;
      out.push({ date: key, value: val, isToday });
    }
    return out;
  }, [store.date, store.history, completion]);

  const weeklyAvg =
    last7.reduce((acc, d) => acc + d.value, 0) / last7.length;

  return {
    hydrated,
    date: store.date,
    checks: store.checks,
    streak: store.streak,
    bestStreak: store.bestStreak,
    completion,
    completedCount,
    total,
    last7,
    weeklyAvg,
    toggle,
    reset,
    tasks,
    customTasks,
    addCustomTask,
    removeCustomTask,
  };
};

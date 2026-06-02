import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Check, Clock, RotateCcw, Plus, X as XIcon, Camera } from "lucide-react";
import { computeActiveTaskId } from "@/lib/protocolData";

const fireConfetti = () => {
  const duration = 1200;
  const end = Date.now() + duration;
  const colors = ["#CCFF00", "#F4F4F5", "#FF3B30"];
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      shapes: ["square"],
      scalar: 0.9,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      shapes: ["square"],
      scalar: 0.9,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

export const DailyChecklist = ({
  checks,
  completion,
  toggle,
  reset,
  tasks,
  onRemoveCustom,
  onAddCustom,
  onBreakfastCheck,
  hasBreakfastPhotoToday,
}) => {
  const [activeId, setActiveId] = useState(() => computeActiveTaskId(tasks));
  const [celebrated, setCelebrated] = useState(false);

  // recompute active task every 30 sec (and when tasks list changes)
  useEffect(() => {
    setActiveId(computeActiveTaskId(tasks));
    const id = setInterval(() => setActiveId(computeActiveTaskId(tasks)), 30 * 1000);
    return () => clearInterval(id);
  }, [tasks]);

  // celebrate at 100%
  useEffect(() => {
    if (completion >= 1 && !celebrated) {
      fireConfetti();
      toast.success("Mission accomplie. Discipline = 100%.", {
        description: "Le streak monte. Reste affûté pour demain.",
      });
      setCelebrated(true);
    }
    if (completion < 1 && celebrated) setCelebrated(false);
  }, [completion, celebrated]);

  const handleToggle = (task) => {
    const wasChecked = !!checks[task.id];
    toggle(task.id);
    // when newly checking "breakfast", trigger photo capture
    if (
      !wasChecked &&
      task.id === "breakfast" &&
      onBreakfastCheck &&
      !hasBreakfastPhotoToday
    ) {
      onBreakfastCheck();
    }
  };

  return (
    <section
      className="surface surface-corner relative"
      data-testid="daily-checklist"
    >
      <div className="flex items-center justify-between gap-2 px-4 sm:px-6 pt-5 sm:pt-6">
        <div className="min-w-0">
          <div className="overline">SECTION / 01</div>
          <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-tight mt-1">
            Checklist Quotidienne
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onAddCustom && (
            <button
              type="button"
              onClick={onAddCustom}
              data-testid="add-task-open-btn"
              className="group flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border border-[#27272a] hover:border-[#CCFF00] hover:text-[#CCFF00] text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Objectif</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              reset();
              toast("Checklist réinitialisée.", { description: "Repars à zéro." });
            }}
            data-testid="reset-checklist-btn"
            className="group flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border border-[#27272a] hover:border-[#CCFF00] hover:text-[#CCFF00] text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 transition-transform group-hover:-rotate-180" />
            Reset
          </button>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-[#1f1f22] border-t border-[#1f1f22]">
        {tasks.map((task, idx) => {
          const done = !!checks[task.id];
          const isActive = activeId === task.id && !done;
          const isCustom = !!task.isCustom;
          return (
            <li
              key={task.id}
              data-testid={`task-row-${task.id}`}
              className={`relative group transition-colors ${
                isActive
                  ? "bg-[rgba(204,255,0,0.06)]"
                  : "hover:bg-[#141417]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#CCFF00] pulse-volt" />
              )}
              <button
                type="button"
                onClick={() => handleToggle(task)}
                data-testid={`task-toggle-${task.id}`}
                className="w-full flex items-stretch gap-3 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 text-left"
              >
                {/* Index + time column */}
                <div className="flex flex-col items-start min-w-[60px] sm:min-w-[72px]">
                  <span className="overline text-[10px]">
                    {String(idx + 1).padStart(2, "0")}
                    {isCustom && <span className="ml-1 text-[#CCFF00]">+</span>}
                  </span>
                  <span
                    className={`font-display tabular text-lg sm:text-xl mt-1 ${
                      isActive ? "text-[#CCFF00]" : "text-zinc-200"
                    }`}
                  >
                    {task.time}
                  </span>
                  {isActive && (
                    <span className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#CCFF00]">
                      <Clock className="w-3 h-3" />
                      En cours
                    </span>
                  )}
                </div>

                {/* Title + detail */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-display uppercase tracking-tight text-base sm:text-xl transition-all flex items-center gap-2 flex-wrap ${
                      done
                        ? "text-zinc-500 line-through decoration-[#CCFF00] decoration-2"
                        : "text-white"
                    }`}
                  >
                    <span>{task.title}</span>
                    {task.id === "breakfast" && hasBreakfastPhotoToday && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] text-[9px] tracking-widest"
                        data-testid="breakfast-photo-badge"
                      >
                        <Camera className="w-2.5 h-2.5" />
                        PHOTO OK
                      </span>
                    )}
                    {isCustom && (
                      <span className="inline-flex items-center px-1.5 py-0.5 border border-[#CCFF00]/40 text-[#CCFF00] text-[9px] tracking-widest">
                        CUSTOM
                      </span>
                    )}
                  </div>
                  {task.detail && (
                    <p
                      className={`mt-1 text-xs sm:text-sm leading-snug ${
                        done ? "text-zinc-600" : "text-zinc-400"
                      }`}
                    >
                      {task.detail}
                    </p>
                  )}
                </div>

                {/* Custom delete (custom tasks only) */}
                {isCustom && onRemoveCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onRemoveCustom(task.id);
                      toast("Objectif retiré.", { description: task.title });
                    }}
                    data-testid={`task-remove-${task.id}`}
                    aria-label="Supprimer cet objectif"
                    className="self-start w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-[#FF3B30] hover:border-[#FF3B30] border border-transparent transition-colors"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Checkbox */}
                <div className="flex items-center">
                  <motion.span
                    whileTap={{ scale: 0.85 }}
                    className={`relative w-9 h-9 border-2 flex items-center justify-center transition-colors ${
                      done
                        ? "bg-[#CCFF00] border-[#CCFF00]"
                        : isActive
                        ? "border-[#CCFF00]"
                        : "border-[#3f3f46] group-hover:border-zinc-300"
                    }`}
                    data-testid={`task-checkbox-${task.id}`}
                  >
                    <AnimatePresence>
                      {done && (
                        <motion.span
                          key="check"
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 18 }}
                          className="flex"
                        >
                          <Check className="w-5 h-5 text-black" strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default DailyChecklist;

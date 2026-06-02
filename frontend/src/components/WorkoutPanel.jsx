import { useState } from "react";
import { HOME_WORKOUT } from "@/lib/protocolData";
import { Dumbbell, Play, Sparkles, Settings, Coffee } from "lucide-react";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutEditor from "@/components/WorkoutEditor";
import { useWorkoutPhases } from "@/hooks/useWorkoutPhases";

const fmtDuration = (totalSec) => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const WorkoutPanel = () => {
  const [sessionOpen, setSessionOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const phasesHook = useWorkoutPhases();

  const phases = phasesHook.phases;
  const totalSec = phases.reduce(
    (acc, p) => acc + (p.type === "work" ? Number(p.target) || 0 : Number(p.duration) || 0),
    0
  );
  const workCount = phases.filter((p) => p.type === "work").length;
  const restCount = phases.filter((p) => p.type === "rest").length;

  return (
    <section
      className="surface surface-corner relative overflow-hidden"
      data-testid="workout-panel"
    >
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "url('https://static.prod-images.emergentagent.com/jobs/b743beb1-6172-456d-8a5a-b3a22ce19b13/images/eac8e77e32ba12a2dfc1f05cfd3551de17f747093ecfc2aa15217315abae063b.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative">
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Dumbbell className="w-5 h-5 text-[#CCFF00] mt-1 shrink-0" />
            <div className="min-w-0">
              <div className="overline">SECTION / 03</div>
              <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-tight mt-1">
                {HOME_WORKOUT.title}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500">
                <span className="tabular">{fmtDuration(totalSec)}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span className="text-[#CCFF00]">FOCUS · {HOME_WORKOUT.focus}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            data-testid="open-workout-editor-btn"
            aria-label="Personnaliser la séance"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border border-[#27272a] hover:border-[#CCFF00] hover:text-[#CCFF00] text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 transition-colors shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Éditer</span>
          </button>
        </div>

        {/* phases summary */}
        <div className="px-4 sm:px-6 pt-4 grid grid-cols-2 gap-2 text-[10px] sm:text-xs uppercase tracking-widest">
          <div className="flex items-center gap-1.5 px-2 py-1.5 border border-[#CCFF00]/20 text-[#CCFF00]">
            <Dumbbell className="w-3 h-3" />
            <span className="tabular">{workCount}</span>
            <span>exercices</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 border border-white/10 text-zinc-300">
            <Coffee className="w-3 h-3" />
            <span className="tabular">{restCount}</span>
            <span>repos</span>
          </div>
        </div>

        {/* phases preview list (first 5) */}
        <ol className="mt-4 border-t border-[#1f1f22] divide-y divide-[#1f1f22] max-h-[260px] overflow-y-auto">
          {phases.slice(0, 8).map((p, i) => {
            const isWork = p.type === "work";
            const dur = isWork ? p.target : p.duration;
            return (
              <li
                key={p.id}
                data-testid={`workout-block-${p.id}`}
                className="px-4 sm:px-6 py-3 grid grid-cols-[28px_1fr_auto] items-center gap-3"
              >
                <span className="font-display tabular text-base sm:text-xl text-zinc-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className={`font-display uppercase tracking-tight text-sm sm:text-base ${
                    isWork ? "text-white" : "text-zinc-400"
                  }`}>
                    {p.label}
                  </div>
                  {isWork && p.tutorial && (
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {p.tutorial}
                    </p>
                  )}
                </div>
                <span className={`text-[10px] uppercase tracking-[0.2em] tabular ${
                  isWork ? "text-[#CCFF00]" : "text-zinc-400"
                }`}>
                  {fmtDuration(dur)}
                </span>
              </li>
            );
          })}
          {phases.length > 8 && (
            <li className="px-4 sm:px-6 py-2 text-center text-[10px] uppercase tracking-widest text-zinc-600">
              + {phases.length - 8} phases supplémentaires
            </li>
          )}
        </ol>

        {/* launch focus mode */}
        <div className="px-4 sm:px-6 py-5 sm:py-6 border-t border-[#1f1f22]">
          <button
            type="button"
            onClick={() => setSessionOpen(true)}
            disabled={phases.length === 0}
            data-testid="launch-session-btn"
            className="group w-full flex items-center justify-between gap-4 px-5 py-4 bg-[#CCFF00] hover:bg-white text-black font-display uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-3">
              <Play className="w-5 h-5" />
              <span className="text-base sm:text-lg">Démarrer la séance</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs tracking-[0.25em] opacity-70 group-hover:opacity-100">
              <Sparkles className="w-3.5 h-3.5" />
              FOCUS MODE
            </span>
          </button>
          <p className="mt-2 text-[11px] text-zinc-500 tracking-wide">
            Plein écran · chrono ascendant · tuto image · alerte rouge si dépassement.
          </p>
        </div>
      </div>

      <WorkoutSession
        open={sessionOpen}
        onClose={() => setSessionOpen(false)}
        phases={phasesHook.enrichedPhases}
      />
      <WorkoutEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        phases={phasesHook.phases}
        addPhase={phasesHook.addPhase}
        removePhase={phasesHook.removePhase}
        updatePhase={phasesHook.updatePhase}
        movePhase={phasesHook.movePhase}
        resetToDefault={phasesHook.resetToDefault}
      />
    </section>
  );
};

export default WorkoutPanel;

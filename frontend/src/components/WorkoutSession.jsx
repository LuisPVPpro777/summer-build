import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight, Pause, Play, Trophy, Volume2, VolumeX, Image as ImageIcon } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { SESSION_PHASES as DEFAULT_PHASES, formatTime } from "@/lib/workoutSession";

// Simple Web Audio API beep
const playBeep = (freq = 880, duration = 0.18, type = "sine") => {
  try {
    const ctx = window.__protocoleAudio || new (window.AudioContext || window.webkitAudioContext)();
    window.__protocoleAudio = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // audio not available
  }
};

export const WorkoutSession = ({ open, onClose, phases }) => {
  const SESSION_PHASES = useMemo(
    () => (Array.isArray(phases) && phases.length > 0 ? phases : DEFAULT_PHASES),
    [phases]
  );
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(false);
  const [reachedTarget, setReachedTarget] = useState(false);
  const ref = useRef(null);

  const phase = SESSION_PHASES[phaseIdx];
  const isWork = phase?.type === "work";

  // reset when opening
  useEffect(() => {
    if (!open) return;
    setPhaseIdx(0);
    setSeconds(0);
    setPaused(false);
    setFinished(false);
    setReachedTarget(false);
  }, [open]);

  // Body scroll lock + escape key while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // tick
  useEffect(() => {
    if (!open || paused || finished) return;
    ref.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(ref.current);
  }, [open, paused, finished, phaseIdx]);

  // reset target-reached flag on phase change
  useEffect(() => {
    setReachedTarget(false);
  }, [phaseIdx]);

  // audio cues: beep when work-target reached + double beep on rest end
  useEffect(() => {
    if (!open || finished || muted) return;
    if (isWork && !reachedTarget && seconds === phase.target) {
      playBeep(880, 0.18, "sine");
      setReachedTarget(true);
    }
    if (!isWork && phase && seconds === Math.max(phase.duration - 3, 0) && phase.duration > 3) {
      playBeep(660, 0.1, "square");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, open, finished, muted, isWork, phaseIdx]);

  // rest auto-advance
  useEffect(() => {
    if (!open || finished) return;
    if (phase?.type === "rest" && seconds >= (phase.duration || 0)) {
      if (!muted) playBeep(1040, 0.2, "sine");
      advance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, phaseIdx, open]);

  const advance = () => {
    if (phaseIdx < SESSION_PHASES.length - 1) {
      setPhaseIdx((i) => i + 1);
      setSeconds(0);
    } else {
      setFinished(true);
      // celebrate
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#CCFF00", "#F4F4F5", "#FF3B30"],
      });
      toast.success("Séance Maison terminée. Discipline = 100%.", {
        description: "V-Shape engagée. À demain.",
      });
    }
  };

  const target = phase?.target ?? phase?.duration ?? 0;
  const overshoot = isWork && seconds > target;
  const remaining = !isWork ? Math.max((phase?.duration || 0) - seconds, 0) : 0;
  const progressPct = isWork
    ? Math.min((seconds / Math.max(target, 1)) * 100, 100)
    : ((phase?.duration - remaining) / Math.max(phase?.duration || 1, 1)) * 100;

  const completedCount = phaseIdx + (finished ? 1 : 0);

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-black overflow-y-auto"
      data-testid="workout-session-modal"
      role="dialog"
      aria-modal="true"
    >
      {/* full-bleed background image with low opacity */}
      {phase?.image && !finished && (
        <div
          className="fixed inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage: `url('${phase.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(0.4) contrast(1.1)",
          }}
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black pointer-events-none" />

      {/* header bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/40 backdrop-blur-sm">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
            FOCUS MODE · SÉANCE MAISON
          </div>
          <div className="font-display tabular text-sm text-zinc-300 mt-0.5">
            {completedCount} / {SESSION_PHASES.length} · {Math.round((phaseIdx / SESSION_PHASES.length) * 100)}%
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            data-testid="session-mute-btn"
            aria-label={muted ? "Activer le son" : "Couper le son"}
            className="flex items-center justify-center w-10 h-10 text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            data-testid="session-close-btn"
            className="flex items-center gap-2 px-3 py-2 text-xs tracking-widest uppercase text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
          >
            Quitter
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* overall progress strip */}
      <div className="relative z-10 h-[2px] bg-white/5">
        <div
          className="h-full bg-[#CCFF00] transition-all"
          style={{ width: `${(phaseIdx / SESSION_PHASES.length) * 100}%` }}
        />
      </div>

      {/* content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 sm:py-16 flex flex-col items-center text-center min-h-[calc(100vh-80px)] justify-center">
        <AnimatePresence mode="wait">
          {finished ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
              data-testid="session-finished"
            >
              <Trophy className="w-14 h-14 text-[#CCFF00] mb-4" />
              <div className="overline">SÉANCE TERMINÉE</div>
              <h2 className="font-display uppercase text-5xl sm:text-7xl tracking-tighter mt-3 text-white">
                V-SHAPE<br />
                <span className="text-[#CCFF00]">ENGAGÉE</span>
              </h2>
              <p className="text-zinc-400 mt-4 max-w-md">
                Tu as enchaîné chauffe + 4 pompes + 4 gainage. Reste hydraté. À demain.
              </p>
              <button
                type="button"
                onClick={onClose}
                data-testid="session-finish-close-btn"
                className="mt-8 px-6 py-3 bg-[#CCFF00] text-black font-display uppercase tracking-wider hover:bg-white transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col items-center"
              data-testid={`session-phase-${phase.id}`}
            >
              {/* phase type pill */}
              <div
                className={`text-[10px] tracking-[0.3em] uppercase px-2 py-1 border ${
                  isWork
                    ? "border-[#CCFF00] text-[#CCFF00]"
                    : "border-zinc-500 text-zinc-300"
                }`}
              >
                {isWork ? "EXERCICE" : "REPOS"}
              </div>

              {/* tutorial image */}
              <div className="mt-6 w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] border border-white/15 overflow-hidden relative bg-[#141417] flex items-center justify-center">
                {(isWork ? phase.image : phase.nextImage) ? (
                  <img
                    src={isWork ? phase.image : phase.nextImage}
                    alt={phase.label}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-zinc-700" />
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
              </div>

              {/* label */}
              <h2 className="font-display uppercase text-3xl sm:text-5xl tracking-tighter mt-6 text-white">
                {isWork ? phase.label : `Prochain : ${phase.nextLabel}`}
              </h2>
              <p className="text-sm text-zinc-400 mt-2 max-w-md">
                {isWork ? phase.tutorial : phase.nextDetail}
              </p>

              {/* chrono / countdown */}
              {isWork ? (
                <div className="mt-8 flex flex-col items-center">
                  <div className="overline">CHRONO</div>
                  <div
                    className={`font-display tabular text-7xl sm:text-9xl tracking-tighter leading-none mt-2 transition-colors ${
                      overshoot ? "text-[#FF3B30]" : "text-white"
                    }`}
                    data-testid="session-chrono"
                  >
                    {formatTime(seconds)}
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-widest text-zinc-500">
                    Cible : {formatTime(target)}
                    {overshoot && <span className="text-[#FF3B30] ml-3">DÉPASSEMENT</span>}
                  </div>
                  <div className="mt-3 w-72 h-[2px] bg-white/10">
                    <div
                      className={`h-full transition-all ${
                        overshoot ? "bg-[#FF3B30]" : "bg-[#CCFF00]"
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex flex-col items-center">
                  <div className="overline">PAUSE RESTANTE</div>
                  <div
                    className="font-display tabular text-7xl sm:text-9xl tracking-tighter leading-none mt-2 text-zinc-200"
                    data-testid="session-rest-countdown"
                  >
                    {formatTime(remaining)}
                  </div>
                  <div className="mt-3 w-72 h-[2px] bg-white/10">
                    <div
                      className="h-full bg-zinc-300 transition-all"
                      style={{ width: `${100 - progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* actions */}
              <div className="mt-10 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  data-testid="session-pause-btn"
                  className="flex items-center gap-2 px-4 py-3 border border-white/15 hover:border-white/40 text-zinc-200 text-sm uppercase tracking-widest transition-colors"
                >
                  {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {paused ? "Reprendre" : "Pause"}
                </button>
                {isWork ? (
                  <button
                    type="button"
                    onClick={advance}
                    data-testid="session-done-btn"
                    className={`flex items-center gap-2 px-6 py-3 font-display uppercase tracking-wider text-sm transition-colors ${
                      overshoot
                        ? "bg-[#FF3B30] text-white hover:bg-[#ff5347]"
                        : "bg-[#CCFF00] text-black hover:bg-white"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    {overshoot ? "Continuer" : "Fini"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={advance}
                    data-testid="session-skip-rest-btn"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-display uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors"
                  >
                    Passer le repos
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WorkoutSession;

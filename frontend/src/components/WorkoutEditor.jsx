import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Dumbbell,
  Coffee,
  ImagePlus,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { resizeImageFile } from "@/hooks/useGallery";

export const WorkoutEditor = ({
  open,
  onClose,
  phases,
  addPhase,
  removePhase,
  updatePhase,
  movePhase,
  resetToDefault,
}) => {
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

  const handleReset = () => {
    if (!confirm("Réinitialiser la séance au protocole V-Shape par défaut ? Tes phases personnalisées seront perdues.")) return;
    resetToDefault();
    toast.success("Séance réinitialisée au protocole V-Shape.");
  };

  if (!open) return null;

  const totalSec = phases.reduce(
    (acc, p) => acc + (p.type === "work" ? Number(p.target) || 0 : Number(p.duration) || 0),
    0
  );
  const totalMin = Math.floor(totalSec / 60);
  const totalRem = totalSec % 60;
  const workCount = phases.filter((p) => p.type === "work").length;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm overflow-y-auto"
      data-testid="workout-editor"
      role="dialog"
      aria-modal="true"
    >
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/95 border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="overline">PERSONNALISATION</div>
              <h2 className="font-display uppercase text-xl sm:text-2xl tracking-tight text-white leading-none mt-0.5">
                Séance Maison
              </h2>
              <div
                className="mt-1 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 tabular"
                data-testid="editor-total"
              >
                {workCount} exercice{workCount === 1 ? "" : "s"} ·{" "}
                {String(totalMin).padStart(2, "0")}:
                {String(totalRem).padStart(2, "0")} total
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                data-testid="editor-reset-btn"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border border-white/10 hover:border-[#FF3B30] hover:text-[#FF3B30] text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Défaut</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                data-testid="editor-close-btn"
                className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white text-[10px] sm:text-xs uppercase tracking-widest transition-colors"
              >
                Terminé
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Phases list */}
        <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-5 space-y-2">
          {phases.length === 0 && (
            <div className="text-center py-10 text-zinc-500 text-sm">
              Aucune phase. Ajoute un exercice ou un repos ci-dessous.
            </div>
          )}
          {phases.map((p, idx) => (
            <PhaseCard
              key={p.id}
              index={idx}
              total={phases.length}
              phase={p}
              onChange={(patch) => updatePhase(p.id, patch)}
              onRemove={() => removePhase(p.id)}
              onMove={(dir) => movePhase(p.id, dir)}
              onInsertAfter={(type) => addPhase(type, idx + 1)}
            />
          ))}
        </div>

        {/* Footer add buttons */}
        <div className="sticky bottom-0 bg-black/95 border-t border-white/10 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => addPhase("work")}
              data-testid="add-work-btn"
              className="flex items-center justify-center gap-2 px-3 py-3 bg-[#CCFF00] hover:bg-white text-black font-display uppercase tracking-wider text-xs sm:text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Exercice
            </button>
            <button
              type="button"
              onClick={() => addPhase("rest")}
              data-testid="add-rest-btn"
              className="flex items-center justify-center gap-2 px-3 py-3 bg-white hover:bg-zinc-200 text-black font-display uppercase tracking-wider text-xs sm:text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Repos
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const PhaseCard = ({ index, total, phase, onChange, onRemove, onMove, onInsertAfter }) => {
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const isWork = phase.type === "work";
  const TypeIcon = isWork ? Dumbbell : Coffee;

  const handleImage = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast.error("Format image uniquement.");
      return;
    }
    setImporting(true);
    try {
      const dataUrl = await resizeImageFile(file);
      onChange({ image: dataUrl });
      toast.success("Image attachée.");
    } catch (e) {
      toast.error("Échec d'import.", { description: String(e?.message || e) });
    } finally {
      setImporting(false);
    }
  };

  const duration = isWork ? phase.target : phase.duration;

  return (
    <div
      data-testid={`phase-card-${phase.id}`}
      className={`border ${
        isWork ? "border-[#CCFF00]/30" : "border-white/15"
      } bg-[#0d0d10]`}
    >
      {/* Header strip */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-display tabular text-base text-zinc-500 shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <TypeIcon
            className={`w-3.5 h-3.5 shrink-0 ${
              isWork ? "text-[#CCFF00]" : "text-zinc-400"
            }`}
          />
          <span
            className={`text-[10px] tracking-[0.25em] uppercase ${
              isWork ? "text-[#CCFF00]" : "text-zinc-400"
            }`}
          >
            {isWork ? "EXERCICE" : "REPOS"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove("up")}
            disabled={index === 0}
            data-testid={`phase-up-${phase.id}`}
            aria-label="Monter"
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove("down")}
            disabled={index === total - 1}
            data-testid={`phase-down-${phase.id}`}
            aria-label="Descendre"
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Supprimer cette phase ?")) onRemove();
            }}
            data-testid={`phase-remove-${phase.id}`}
            aria-label="Supprimer"
            className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-[#FF3B30] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {/* Label + duration */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
          <div>
            <label className="overline block mb-1">NOM</label>
            <input
              type="text"
              value={phase.label}
              onChange={(e) => onChange({ label: e.target.value })}
              data-testid={`phase-label-${phase.id}`}
              maxLength={60}
              placeholder={isWork ? "Ex. Pompes — Série 1" : "Repos"}
              className="w-full px-3 py-2 bg-[#141417] border border-[#27272a] text-zinc-200 focus:outline-none focus:border-[#CCFF00] transition-colors"
            />
          </div>
          <div>
            <label className="overline block mb-1">DURÉE (s)</label>
            <input
              type="number"
              min="5"
              max="3600"
              step="5"
              value={duration}
              onChange={(e) => {
                const v = Math.max(5, Math.min(3600, Number(e.target.value) || 0));
                if (isWork) onChange({ target: v });
                else onChange({ duration: v });
              }}
              data-testid={`phase-duration-${phase.id}`}
              className="w-full px-3 py-2 bg-[#141417] border border-[#27272a] text-zinc-200 tabular focus:outline-none focus:border-[#CCFF00] transition-colors"
            />
          </div>
        </div>

        {/* Work-only fields */}
        {isWork && (
          <>
            <div>
              <label className="overline block mb-1">DESCRIPTION / TUTO</label>
              <textarea
                value={phase.tutorial || ""}
                onChange={(e) => onChange({ tutorial: e.target.value })}
                data-testid={`phase-tutorial-${phase.id}`}
                rows={2}
                maxLength={300}
                placeholder="Consigne d'exécution, points techniques…"
                className="w-full px-3 py-2 bg-[#141417] border border-[#27272a] text-zinc-200 focus:outline-none focus:border-[#CCFF00] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="overline block mb-1">IMAGE (galerie du téléphone)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImage(e.target.files?.[0])}
                data-testid={`phase-image-input-${phase.id}`}
              />
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#141417] border border-[#27272a] flex items-center justify-center overflow-hidden shrink-0">
                  {phase.image ? (
                    <img
                      src={phase.image}
                      alt={phase.label}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-zinc-700" />
                  )}
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={importing}
                    data-testid={`phase-image-pick-${phase.id}`}
                    className="flex items-center gap-2 px-3 py-2 bg-[#CCFF00] hover:bg-white text-black font-display uppercase tracking-wider text-xs transition-colors disabled:opacity-60"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    {importing
                      ? "Import…"
                      : phase.image
                      ? "Changer"
                      : "Choisir"}
                  </button>
                  {phase.image && (
                    <button
                      type="button"
                      onClick={() => onChange({ image: "" })}
                      data-testid={`phase-image-clear-${phase.id}`}
                      className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-[#FF3B30] transition-colors text-left"
                    >
                      Retirer l'image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick insert below */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-600 mr-1">
            Insérer après :
          </span>
          <button
            type="button"
            onClick={() => onInsertAfter("rest")}
            data-testid={`insert-rest-after-${phase.id}`}
            className="flex items-center gap-1 px-2 py-1 border border-white/10 hover:border-white/40 text-zinc-400 hover:text-white text-[10px] uppercase tracking-widest transition-colors"
          >
            <Plus className="w-3 h-3" />
            Repos
          </button>
          <button
            type="button"
            onClick={() => onInsertAfter("work")}
            data-testid={`insert-work-after-${phase.id}`}
            className="flex items-center gap-1 px-2 py-1 border border-[#CCFF00]/30 hover:border-[#CCFF00] text-[#CCFF00] text-[10px] uppercase tracking-widest transition-colors"
          >
            <Plus className="w-3 h-3" />
            Exercice
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutEditor;

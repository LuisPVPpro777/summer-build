import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Clock as ClockIcon } from "lucide-react";
import { toast } from "sonner";

export const AddCustomTaskModal = ({ open, onClose, onAdd }) => {
  const [time, setTime] = useState("12:00");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    setTitle("");
    setDetail("");
    setTime("12:00");
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      toast.error("Le nom de l'objectif est requis.");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      toast.error("Heure invalide.");
      return;
    }
    onAdd({ time, title: title.trim(), detail: detail.trim() });
    toast.success("Objectif ajouté", {
      description: `Positionné automatiquement à ${time}.`,
    });
    onClose?.();
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center px-4"
      data-testid="add-task-modal"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-[#0a0a0c] border-2 border-[#CCFF00] p-6 surface-corner"
      >
        <div className="absolute -top-3 left-6 px-2 py-0.5 bg-[#CCFF00] text-black text-[10px] tracking-[0.3em] uppercase font-bold">
          NOUVEL OBJECTIF
        </div>
        <button
          type="button"
          onClick={onClose}
          data-testid="add-task-close-btn"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <Plus className="w-10 h-10 text-[#CCFF00]" />
        <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-tighter mt-3 text-white leading-[0.95]">
          AJOUTER UN<br />
          <span className="text-[#CCFF00]">OBJECTIF</span>
        </h2>
        <p className="mt-3 text-sm text-zinc-400">
          Sera positionné automatiquement dans la checklist selon l'heure choisie.
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="overline block mb-1.5">HEURE</label>
            <div className="relative">
              <ClockIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                data-testid="add-task-time"
                step="60"
                className="w-full pl-10 pr-3 py-2.5 bg-[#141417] border border-[#27272a] text-zinc-200 tabular focus:outline-none focus:border-[#CCFF00] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="overline block mb-1.5">NOM</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="add-task-title"
              placeholder="Ex. Lecture, Méditation, Hydratation…"
              maxLength={48}
              className="w-full px-3 py-2.5 bg-[#141417] border border-[#27272a] text-zinc-200 focus:outline-none focus:border-[#CCFF00] transition-colors placeholder:text-zinc-600"
              autoFocus
            />
          </div>
          <div>
            <label className="overline block mb-1.5">DESCRIPTION (optionnelle)</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              data-testid="add-task-detail"
              rows={2}
              maxLength={200}
              placeholder="Détail bref ou condition de réussite"
              className="w-full px-3 py-2.5 bg-[#141417] border border-[#27272a] text-zinc-200 focus:outline-none focus:border-[#CCFF00] transition-colors placeholder:text-zinc-600 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          data-testid="add-task-submit"
          className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#CCFF00] hover:bg-white text-black font-display uppercase tracking-wider text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter à la checklist
        </button>
      </form>
    </div>,
    document.body
  );
};

export default AddCustomTaskModal;

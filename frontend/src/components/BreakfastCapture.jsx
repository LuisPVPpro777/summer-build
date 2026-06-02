import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Camera, X, Upload, Check } from "lucide-react";
import { toast } from "sonner";

export const BreakfastCapture = ({ open, onClose, onCapture }) => {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [busy, setBusy] = useState(false);

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

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format non supporté", { description: "Image uniquement." });
      return;
    }
    setBusy(true);
    try {
      await onCapture(file);
      toast.success("Photo enregistrée.", {
        description: "Petit-déj du jour ajouté à la galerie.",
      });
      onClose?.();
    } catch (e) {
      toast.error("Échec de l'enregistrement", { description: String(e?.message || e) });
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center px-4"
      data-testid="breakfast-capture"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[#0a0a0c] border-2 border-[#CCFF00] p-6 surface-corner">
        <div className="absolute -top-3 left-6 px-2 py-0.5 bg-[#CCFF00] text-black text-[10px] tracking-[0.3em] uppercase font-bold">
          CARBURANT · CAPTURE
        </div>
        <button
          type="button"
          onClick={onClose}
          data-testid="capture-close-btn"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <Camera className="w-10 h-10 text-[#CCFF00]" />
        <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-tighter mt-3 text-white leading-[0.95]">
          PHOTO DU<br />
          <span className="text-[#CCFF00]">PETIT-DÉJEUNER</span>
        </h2>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          Capture ton assiette : 3 œufs, pain, fruit, eau. Stockée localement, visible dans la <span className="text-zinc-200">Galerie</span>.
        </p>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          data-testid="capture-camera-input"
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          data-testid="capture-gallery-input"
        />

        <div className="mt-6 grid gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={busy}
            data-testid="capture-take-photo-btn"
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#CCFF00] hover:bg-white text-black font-display uppercase tracking-wider text-sm transition-colors disabled:opacity-60"
          >
            <Camera className="w-4 h-4" />
            {busy ? "Enregistrement…" : "Prendre une photo"}
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={busy}
            data-testid="capture-import-btn"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/15 hover:border-white/40 text-zinc-200 font-display uppercase tracking-wider text-sm transition-colors disabled:opacity-60"
          >
            <Upload className="w-4 h-4" />
            Importer depuis la galerie
          </button>
          <button
            type="button"
            onClick={onClose}
            data-testid="capture-skip-btn"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-zinc-500 hover:text-zinc-300 text-[11px] uppercase tracking-widest transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Valider sans photo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BreakfastCapture;

import { useMemo, useState } from "react";
import { useGallery } from "@/hooks/useGallery";
import { useAutoTheme } from "@/hooks/useAutoTheme";
import TopBar from "@/components/TopBar";
import SideMenu from "@/components/SideMenu";
import { Images, Trash2, Calendar, ArrowDownAZ, ArrowUpAZ, X } from "lucide-react";
import { toast } from "sonner";

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function Gallery() {
  useAutoTheme();
  const { photos, deletePhoto, clearAll } = useGallery();
  const [menuOpen, setMenuOpen] = useState(false);
  const [order, setOrder] = useState("desc"); // desc = newest first
  const [groupBy, setGroupBy] = useState("none"); // none | day
  const [viewer, setViewer] = useState(null);

  const sorted = useMemo(() => {
    const arr = [...photos];
    arr.sort((a, b) => {
      const ka = a.createdAt || a.date || "";
      const kb = b.createdAt || b.date || "";
      return order === "desc" ? kb.localeCompare(ka) : ka.localeCompare(kb);
    });
    return arr;
  }, [photos, order]);

  const grouped = useMemo(() => {
    if (groupBy !== "day") return [{ key: "all", label: null, photos: sorted }];
    const map = new Map();
    for (const p of sorted) {
      const k = p.date;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(p);
    }
    return Array.from(map.entries()).map(([k, list]) => {
      const d = new Date(k + "T12:00:00");
      const label = d
        .toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })
        .toUpperCase();
      return { key: k, label, photos: list };
    });
  }, [sorted, groupBy]);

  const handleClear = () => {
    if (photos.length === 0) return;
    if (!confirm(`Supprimer les ${photos.length} photos ?`)) return;
    clearAll();
    toast.success("Galerie vidée.");
  };

  return (
    <>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main
        className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10"
        data-testid="gallery-root"
      >
        <TopBar onOpenMenu={() => setMenuOpen(true)} />

        {/* Header */}
        <section className="surface surface-corner relative">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <Images className="w-5 h-5 text-[#CCFF00] mt-1 shrink-0" />
              <div>
                <div className="overline">SECTION / GALERIE</div>
                <h1 className="font-display uppercase text-3xl sm:text-4xl tracking-tighter mt-1 leading-[0.95]">
                  Petits-déjeuners
                </h1>
                <div
                  className="mt-1 text-[11px] sm:text-xs uppercase tracking-widest text-zinc-500 tabular"
                  data-testid="gallery-count"
                >
                  {photos.length} photo{photos.length === 1 ? "" : "s"} · 100% local
                </div>
              </div>
            </div>
            {photos.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                data-testid="gallery-clear-btn"
                className="self-start flex items-center gap-2 px-3 py-2 border border-[#27272a] hover:border-[#FF3B30] hover:text-[#FF3B30] text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Tout supprimer
              </button>
            )}
          </div>

          {/* Sort + group controls */}
          <div className="px-5 sm:px-6 pb-5 flex flex-wrap items-center gap-2 border-t border-[#1f1f22] pt-4">
            <button
              type="button"
              onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
              data-testid="gallery-sort-btn"
              className="flex items-center gap-1.5 px-3 py-2 border border-[#27272a] hover:border-zinc-500 text-zinc-300 text-[10px] sm:text-xs uppercase tracking-widest transition-colors"
            >
              {order === "desc" ? (
                <ArrowDownAZ className="w-3.5 h-3.5" />
              ) : (
                <ArrowUpAZ className="w-3.5 h-3.5" />
              )}
              {order === "desc" ? "Plus récent d'abord" : "Plus ancien d'abord"}
            </button>
            <button
              type="button"
              onClick={() => setGroupBy(groupBy === "day" ? "none" : "day")}
              data-testid="gallery-group-btn"
              className={`flex items-center gap-1.5 px-3 py-2 border text-[10px] sm:text-xs uppercase tracking-widest transition-colors ${
                groupBy === "day"
                  ? "bg-[#CCFF00] text-black border-[#CCFF00]"
                  : "border-[#27272a] hover:border-zinc-500 text-zinc-300"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {groupBy === "day" ? "Groupé par jour" : "Grouper par jour"}
            </button>
          </div>
        </section>

        {/* Grid */}
        <section className="mt-6">
          {photos.length === 0 ? (
            <div
              className="surface surface-corner p-10 text-center"
              data-testid="gallery-empty"
            >
              <Images className="w-10 h-10 text-zinc-700 mx-auto" />
              <h2 className="font-display uppercase text-xl tracking-tight mt-3 text-zinc-300">
                Aucune photo pour l'instant
              </h2>
              <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto">
                Valide ton objectif <span className="text-[#CCFF00]">Carburant</span> dans la checklist pour ajouter une photo de ton petit-déjeuner.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map((group) => (
                <div key={group.key}>
                  {group.label && (
                    <div className="overline mb-2 px-1">{group.label}</div>
                  )}
                  <div
                    className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2"
                    data-testid="gallery-grid"
                  >
                    {group.photos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setViewer(p)}
                        data-testid={`gallery-photo-${p.id}`}
                        className="group relative aspect-square overflow-hidden border border-[#1f1f22] hover:border-[#CCFF00] transition-colors"
                      >
                        <img
                          src={p.dataUrl}
                          alt={`Petit-déj ${p.date}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                          draggable={false}
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-0.5">
                          <span className="text-[8px] sm:text-[9px] tabular text-zinc-300 tracking-wider">
                            {p.date.slice(5)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Lightbox viewer */}
      {viewer && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 flex flex-col items-center justify-center px-4 py-6"
          onClick={() => setViewer(null)}
          data-testid="gallery-viewer"
        >
          <button
            type="button"
            onClick={() => setViewer(null)}
            data-testid="viewer-close-btn"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-white border border-white/15 hover:border-white/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={viewer.dataUrl}
            alt="aperçu"
            className="max-w-full max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-4 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] uppercase tracking-widest text-zinc-400">
              {fmtDate(viewer.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => {
                if (confirm("Supprimer cette photo ?")) {
                  deletePhoto(viewer.id);
                  setViewer(null);
                  toast.success("Photo supprimée.");
                }
              }}
              data-testid="viewer-delete-btn"
              className="flex items-center gap-2 px-3 py-2 border border-[#FF3B30]/30 hover:border-[#FF3B30] text-[#FF3B30] text-[10px] uppercase tracking-widest transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

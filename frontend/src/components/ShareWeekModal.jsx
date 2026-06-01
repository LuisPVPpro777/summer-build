import { useMemo, useRef, useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import { Download, X, Share2, Dumbbell, Home, Flame, Check } from "lucide-react";
import { toast } from "sonner";
import {
  WEEK_DAYS,
  mondayOf,
  isoDate,
  slotToMinutes,
} from "@/lib/agendaLogic";

export const PALETTES = [
  {
    id: "volt",
    name: "VOLT",
    bg: "#0A0A0A",
    surface: "#141414",
    text: "#F4F4F5",
    muted: "#71717a",
    accent: "#CCFF00",
    accent2: "#FFFFFF",
    onAccent: "#0A0A0A",
    description: "Signature obsidian + volt",
  },
  {
    id: "sunset",
    name: "SUNSET",
    bg: "linear-gradient(135deg,#1E0A2E 0%,#5B1A6F 50%,#FF4E50 100%)",
    surface: "rgba(0,0,0,0.35)",
    text: "#FFF8F0",
    muted: "#FFCBB0",
    accent: "#FFD166",
    accent2: "#FF6B9D",
    onAccent: "#1E0A2E",
    description: "Magenta → orange chaud",
  },
  {
    id: "ocean",
    name: "OCEAN",
    bg: "linear-gradient(160deg,#001628 0%,#003554 50%,#00A5CF 100%)",
    surface: "rgba(0,20,40,0.45)",
    text: "#E8F4F8",
    muted: "#7FB8D0",
    accent: "#00F0FF",
    accent2: "#FFFFFF",
    onAccent: "#001628",
    description: "Navy profond + cyan",
  },
  {
    id: "mono",
    name: "MONO",
    bg: "#F4F4F0",
    surface: "#FFFFFF",
    text: "#0A0A0A",
    muted: "#71717a",
    accent: "#0A0A0A",
    accent2: "#27272a",
    onAccent: "#F4F4F0",
    description: "Pur N&B éditorial",
  },
  {
    id: "sand",
    name: "TERRA",
    bg: "linear-gradient(135deg,#EFE4D2 0%,#D4A373 100%)",
    surface: "rgba(255,255,255,0.55)",
    text: "#3A2A1A",
    muted: "#7C5A3E",
    accent: "#9C2B12",
    accent2: "#3A2A1A",
    onAccent: "#FFF8EE",
    description: "Crème + terracotta",
  },
];

const fmtMin = (m) => {
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${h}:${mm}`;
};

const DAY_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export const ShareWeekModal = ({
  open,
  onClose,
  sessions,
  crossfitDays,
  maisonDays,
  streak,
  weeklyAvg,
  completion,
}) => {
  const [paletteId, setPaletteId] = useState("volt");
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const palette = PALETTES.find((p) => p.id === paletteId) || PALETTES[0];

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

  const weekRange = useMemo(() => {
    const monday = mondayOf();
    const sun = new Date(monday);
    sun.setDate(sun.getDate() + 6);
    const fmt = (d) =>
      d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).replace(".", "");
    return `${fmt(monday)} → ${fmt(sun)} ${sun.getFullYear()}`;
  }, []);

  const totalCrossfitHours = useMemo(() => {
    let h = 0;
    for (let d = 0; d < 7; d++) h += (sessions?.[d] || []).length;
    return h;
  }, [sessions]);

  const totalMaison = maisonDays.filter(Boolean).length;
  const weeklyPct = Math.round(weeklyAvg * 100);
  const todayPct = Math.round(completion * 100);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "transparent",
      });
      const link = document.createElement("a");
      link.download = `summer-build-${isoDate(mondayOf())}-${palette.id}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image téléchargée.", { description: `Palette ${palette.name}.` });
    } catch (err) {
      toast.error("Échec du téléchargement.", { description: String(err?.message || err) });
    } finally {
      setDownloading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm overflow-y-auto"
      data-testid="share-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="min-h-full flex flex-col items-center px-3 sm:px-4 py-4 sm:py-6">
        {/* top bar */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-zinc-300">
            <Share2 className="w-4 h-4" />
            <span className="text-[10px] tracking-[0.3em] uppercase">
              Exporter la semaine
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="share-close-btn"
            className="flex items-center gap-2 px-3 py-2 text-xs tracking-widest uppercase text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
          >
            Fermer <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* palette picker */}
        <div className="w-full max-w-5xl mb-4 sm:mb-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 mb-2">
            PALETTE · {palette.name}
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaletteId(p.id)}
                data-testid={`palette-${p.id}`}
                className={`group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border transition-colors ${
                  paletteId === p.id
                    ? "border-white text-white"
                    : "border-white/15 text-zinc-400 hover:border-white/40 hover:text-white"
                }`}
              >
                <span
                  className="block w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white/30"
                  style={{ background: p.bg }}
                />
                <span
                  className="block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                  style={{ background: p.accent }}
                />
                <span className="text-[10px] sm:text-[11px] font-display tracking-widest">
                  {p.name}
                </span>
                {paletteId === p.id && <Check className="w-3 h-3 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Card preview — scaled to fit viewport on mobile, no horizontal scroll */}
        <ScaledCardWrapper
          paletteId={paletteId}
          cardProps={{
            palette,
            weekRange,
            crossfitDays,
            maisonDays,
            sessions,
            totalCrossfitHours,
            totalMaison,
            streak,
            weeklyPct,
            todayPct,
          }}
          cardRef={cardRef}
          downloading={downloading}
          onDownload={handleDownload}
        />
      </div>
    </div>,
    document.body
  );
};

// Render the actual shareable card. ref'd to the outer div so toPng captures it.
import { forwardRef } from "react";

// Scales the 540×675 share card down to fit any viewport (no horizontal scroll on mobile).
// The card itself remains 540×675 internally so the PNG export stays high-quality.
const CARD_W = 540;
const CARD_H = 675;

const ScaledCardWrapper = ({ cardProps, cardRef, downloading, onDownload }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const update = () => {
      const node = containerRef.current;
      if (!node) return;
      const available = Math.min(node.clientWidth, CARD_W);
      const next = available / CARD_W;
      setScale(next > 0 ? next : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[540px] flex flex-col items-center"
    >
      {/* scaled preview wrapper — keeps the card pixel-accurate while fitting any width */}
      <div
        className="relative w-full"
        style={{ height: CARD_H * scale }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CARD_W,
            height: CARD_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <ShareCard ref={cardRef} {...cardProps} />
        </div>
      </div>

      <button
        type="button"
        onClick={onDownload}
        disabled={downloading}
        data-testid="share-download-btn"
        className="mt-5 sm:mt-6 w-full flex items-center justify-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#CCFF00] hover:bg-white text-black font-display uppercase tracking-wider text-sm sm:text-base transition-colors disabled:opacity-60"
      >
        <Download className="w-4 h-4" />
        {downloading ? "Génération…" : "Télécharger l'image"}
      </button>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-zinc-500 text-center">
        Format 4:5 · 1080×1350 · optimisé Instagram
      </p>
    </div>
  );
};

const ShareCard = forwardRef(function ShareCard(
  {
    palette,
    weekRange,
    crossfitDays,
    maisonDays,
    sessions,
    totalCrossfitHours,
    totalMaison,
    streak,
    weeklyPct,
    todayPct,
  },
  ref
) {
  // Display card at 1080×1350 logical → scaled visually via CSS transform on small screens.
  return (
    <div
      ref={ref}
      data-testid="share-card"
      className="relative origin-top"
      style={{
        width: 540,
        height: 675,
        background: palette.bg,
        color: palette.text,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
      }}
    >
      {/* subtle grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            palette.id === "mono"
              ? "linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)"
              : "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 24,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                color: palette.muted,
                textTransform: "uppercase",
              }}
            >
              PROTOCOLE / SUMMER BUILD
            </div>
            <div
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: 44,
                lineHeight: 0.95,
                fontWeight: 700,
                marginTop: 4,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              MA SEMAINE
              <br />
              <span style={{ color: palette.accent }}>V-SHAPE</span>
            </div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.25em",
                color: palette.muted,
                marginTop: 6,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {weekRange}
            </div>
          </div>
          <div
            style={{
              padding: "6px 10px",
              background: palette.accent,
              color: palette.onAccent,
              fontFamily: "Oswald, sans-serif",
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            DISCIPLINE
          </div>
        </div>

        {/* week chips */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 6,
            padding: 10,
            background: palette.surface,
            borderRadius: 2,
          }}
        >
          {WEEK_DAYS.map((d, i) => {
            const c = crossfitDays[i];
            const m = maisonDays[i];
            const todaySessions = (sessions?.[i] || []).slice().sort((a, b) => a - b);
            return (
              <div
                key={d}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: 8,
                  background: c
                    ? palette.accent
                    : m
                    ? palette.accent2
                    : "transparent",
                  color: c || m ? palette.onAccent : palette.text,
                  border: c || m ? "none" : `1px dashed ${palette.muted}`,
                  borderRadius: 2,
                  minHeight: 96,
                }}
              >
                <div
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    opacity: c || m ? 0.8 : 0.7,
                  }}
                >
                  {d}
                </div>
                {c && (
                  <>
                    <Dumbbell size={18} />
                    <div
                      style={{
                        fontFamily: "Oswald, sans-serif",
                        fontSize: 11,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {todaySessions.map((s) => fmtMin(slotToMinutes(s))).join(" / ")}
                    </div>
                    <div style={{ fontSize: 8, letterSpacing: "0.2em", opacity: 0.7 }}>
                      CROSSFIT
                    </div>
                  </>
                )}
                {!c && m && (
                  <>
                    <Home size={18} />
                    <div
                      style={{
                        fontFamily: "Oswald, sans-serif",
                        fontSize: 11,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      18:00
                    </div>
                    <div style={{ fontSize: 8, letterSpacing: "0.2em", opacity: 0.7 }}>
                      MAISON
                    </div>
                  </>
                )}
                {!c && !m && (
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      opacity: 0.5,
                      marginTop: 18,
                    }}
                  >
                    REPOS
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6,
          }}
        >
          <StatBlock
            label="STREAK"
            value={streak}
            suffix=" J"
            palette={palette}
            icon={<Flame size={14} />}
          />
          <StatBlock
            label="AUJOURD'HUI"
            value={todayPct}
            suffix="%"
            palette={palette}
          />
          <StatBlock
            label="MOY 7J"
            value={weeklyPct}
            suffix="%"
            palette={palette}
          />
          <StatBlock
            label="VOLUME"
            value={`${totalCrossfitHours}+${totalMaison}`}
            suffix=""
            palette={palette}
            small
          />
        </div>

        {/* footer */}
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: 16,
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
                textTransform: "uppercase",
              }}
            >
              Discipline militaire.
              <br />
              Précision quotidienne.
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.25em",
                color: palette.muted,
                marginTop: 6,
                textTransform: "uppercase",
              }}
            >
              0 dérive · 6 cycles · 9h sommeil
            </div>
          </div>
          <div
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 12,
              letterSpacing: "0.3em",
              color: palette.muted,
              textTransform: "uppercase",
            }}
          >
            #SUMMERBUILD
          </div>
        </div>
      </div>
    </div>
  );
});

const StatBlock = ({ label, value, suffix, palette, icon, small }) => (
  <div
    style={{
      padding: 10,
      background: palette.surface,
      borderRadius: 2,
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 9,
        letterSpacing: "0.25em",
        color: palette.muted,
        textTransform: "uppercase",
      }}
    >
      {icon && <span style={{ color: palette.accent }}>{icon}</span>}
      {label}
    </div>
    <div
      style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: small ? 26 : 30,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
      <span style={{ fontSize: 16, color: palette.muted, marginLeft: 2 }}>
        {suffix}
      </span>
    </div>
  </div>
);

export default ShareWeekModal;

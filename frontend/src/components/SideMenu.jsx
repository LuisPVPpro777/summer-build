import { useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { X, Home, Images, Sparkles } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/gallery", label: "Galerie", icon: Images },
];

export const SideMenu = ({ open, onClose }) => {
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

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[105]"
      data-testid="side-menu"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer le menu"
        data-testid="side-menu-backdrop"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      {/* drawer */}
      <aside
        className="absolute top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-[#0a0a0c] border-r border-[#27272a] flex flex-col animate-[slide-in_220ms_ease-out]"
        style={{ animationName: "slide-in" }}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#1f1f22]">
          <div>
            <div className="overline">MENU</div>
            <div className="font-display uppercase text-xl tracking-tight mt-0.5 text-white leading-none">
              Summer Build
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="side-menu-close-btn"
            aria-label="Fermer"
            className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-2">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                data-testid={`side-menu-link-${item.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-5 py-3.5 border-l-2 transition-colors ${
                    isActive
                      ? "border-[#CCFF00] bg-[rgba(204,255,0,0.08)] text-white"
                      : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="font-display uppercase tracking-widest text-sm">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-[#1f1f22] text-[10px] uppercase tracking-[0.25em] text-zinc-600 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-[#CCFF00]" />
          PROTOCOLE / V-SHAPE
        </div>
      </aside>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0.6; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default SideMenu;

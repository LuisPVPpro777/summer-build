import { Menu, Sparkles, Clock as ClockIcon } from "lucide-react";

export const TopBar = ({ onOpenMenu }) => {
  const handleHorloge = () => {
    // Best-effort deeplink to the phone's clock/alarm app.
    // Android Chrome: SHOW_ALARMS intent opens the system Clock alarm screen.
    // iOS: no public scheme exists — link silently no-ops; user can swipe to Clock manually.
    const ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) {
      window.location.href =
        "intent://#Intent;action=android.intent.action.SHOW_ALARMS;end";
    } else {
      // iOS / desktop: try generic scheme then fallback to opening a clock site
      const start = Date.now();
      const win = window.open("clock-iphone://", "_blank");
      setTimeout(() => {
        // if nothing happened (still on same page after 800ms), fallback
        if (Date.now() - start < 1500 && !win) {
          window.open("https://www.google.com/search?q=horloge", "_blank", "noopener");
        }
      }, 800);
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-2 mb-4 sm:mb-6"
      data-testid="top-bar"
    >
      <button
        type="button"
        onClick={onOpenMenu}
        data-testid="open-menu-btn"
        aria-label="Ouvrir le menu"
        className="group flex items-center justify-center w-11 h-11 border border-[#27272a] hover:border-[#CCFF00] bg-[#0d0d10] hover:bg-[rgba(204,255,0,0.06)] text-zinc-300 hover:text-[#CCFF00] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <a
          href="https://gemini.google.com/app/a74ba39fda4fe33f"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="gemini-btn"
          className="group flex items-center gap-2 px-3 sm:px-4 h-11 border border-[#27272a] hover:border-[#CCFF00] bg-[#0d0d10] hover:bg-[rgba(204,255,0,0.06)] text-zinc-200 hover:text-[#CCFF00] font-display uppercase tracking-widest text-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini</span>
        </a>
        <button
          type="button"
          onClick={handleHorloge}
          data-testid="clock-btn"
          className="group flex items-center gap-2 px-3 sm:px-4 h-11 border border-[#27272a] hover:border-[#CCFF00] bg-[#0d0d10] hover:bg-[rgba(204,255,0,0.06)] text-zinc-200 hover:text-[#CCFF00] font-display uppercase tracking-widest text-xs transition-colors"
        >
          <ClockIcon className="w-3.5 h-3.5" />
          <span>Horloge</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;

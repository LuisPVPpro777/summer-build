import { useMemo, useState } from "react";
import {
  WEEK_DAYS,
  MAISON_HOUR,
  mondayOf,
  dayIndex,
} from "@/lib/agendaLogic";
import {
  CalendarDays,
  Dumbbell,
  Trash2,
  Home,
  Plus,
  Share2,
} from "lucide-react";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06h - 22h

const slotFromHourMinute = (h, m) => (h - 6) * 2 + (m >= 30 ? 1 : 0);

const PRESET_HOURS = ["07:00", "12:00", "17:00", "17:30", "18:00", "19:00", "20:00"];

export const Agenda = ({
  sessions,
  crossfitDays,
  maisonDays,
  toggleSession,
  clearWeek,
  onShare,
}) => {
  const todayIdx = dayIndex();
  const monday = mondayOf();
  const [formDay, setFormDay] = useState(todayIdx);
  const [formTime, setFormTime] = useState("18:00");

  const totalHours = useMemo(() => {
    let h = 0;
    for (let d = 0; d < 7; d++) h += (sessions[d] || []).length;
    return h;
  }, [sessions]);

  const weekRange = useMemo(() => {
    const sun = new Date(monday);
    sun.setDate(sun.getDate() + 6);
    const fmt = (d) =>
      d
        .toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
        .replace(".", "");
    return `${fmt(monday)} → ${fmt(sun)}`;
  }, [monday]);

  const handleAdd = () => {
    const [hh, mm] = formTime.split(":").map(Number);
    const slot = slotFromHourMinute(hh, mm);
    toggleSession(formDay, slot);
  };

  const dayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <section
      className="surface surface-corner relative overflow-hidden"
      data-testid="agenda-panel"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 pt-5 sm:pt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div className="flex items-start gap-3">
          <CalendarDays className="w-5 h-5 text-[#CCFF00] mt-1 shrink-0" />
          <div className="min-w-0">
            <div className="overline">SECTION / 04</div>
            <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-tight mt-1">
              Agenda Sport
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500">
              <span className="tabular">{weekRange}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span className="text-[#CCFF00] tabular">
                <Dumbbell className="w-3 h-3 inline mr-1 -mt-0.5" />
                {totalHours}h
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span className="tabular">
                <Home className="w-3 h-3 inline mr-1 -mt-0.5" />
                {maisonDays.filter(Boolean).length}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={clearWeek}
          data-testid="agenda-clear-btn"
          className="self-start lg:self-end flex items-center gap-2 px-3 py-2 border border-[#27272a] hover:border-[#FF3B30] hover:text-[#FF3B30] text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Vider la semaine
        </button>
      </div>

      {/* Share button */}
      <div className="px-4 sm:px-6 mt-3">
        <button
          type="button"
          onClick={onShare}
          data-testid="agenda-share-btn"
          className="inline-flex items-center gap-2 px-3 py-2 border border-[#CCFF00]/30 bg-[rgba(204,255,0,0.05)] hover:bg-[rgba(204,255,0,0.1)] hover:border-[#CCFF00] text-[#CCFF00] text-[10px] sm:text-xs uppercase tracking-widest transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Exporter pour les réseaux
        </button>
      </div>

      {/* Quick add form */}
      <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 bg-[#0d0d10] border border-[#1f1f22]" data-testid="agenda-quick-add">
        <div className="flex flex-col gap-3">
          <div>
            <label className="overline block mb-1.5">JOUR</label>
            <div className="grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormDay(i)}
                  data-testid={`add-day-${i}`}
                  className={`py-1.5 text-[10px] sm:text-[11px] tracking-widest font-display uppercase border transition-colors ${
                    formDay === i
                      ? "bg-[#CCFF00] text-black border-[#CCFF00]"
                      : "border-[#27272a] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="overline block mb-1.5">DÉBUT</label>
            <div className="flex flex-wrap gap-1">
              {PRESET_HOURS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormTime(t)}
                  data-testid={`add-time-${t}`}
                  className={`px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] tracking-widest font-display tabular border transition-colors ${
                    formTime === t
                      ? "bg-zinc-200 text-black border-zinc-200"
                      : "border-[#27272a] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {t}
                </button>
              ))}
              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                data-testid="add-time-input"
                className="px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] tabular bg-[#141417] border border-[#27272a] text-zinc-200 focus:outline-none focus:border-[#CCFF00]"
                step="1800"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            data-testid="agenda-add-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#CCFF00] hover:bg-white text-black font-display uppercase tracking-wider text-xs sm:text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter CrossFit (1h)
          </button>
        </div>
      </div>

      {/* Week grid — RESPONSIVE, no horizontal scroll */}
      <div className="px-2 sm:px-6 pt-5 pb-2">
        {/* Day headers */}
        <div className="grid grid-cols-[28px_repeat(7,minmax(0,1fr))] sm:grid-cols-[44px_repeat(7,minmax(0,1fr))] gap-0.5 sm:gap-1 mb-2">
          <div />
          {WEEK_DAYS.map((d, i) => {
            const isToday = i === todayIdx;
            return (
              <div
                key={d}
                data-testid={`agenda-day-header-${i}`}
                className={`text-center py-1.5 border-b-2 transition-colors ${
                  isToday ? "border-[#CCFF00]" : "border-transparent"
                }`}
              >
                <div
                  className={`text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.25em] ${
                    isToday ? "text-[#CCFF00]" : "text-zinc-500"
                  }`}
                >
                  {d}
                </div>
                <div
                  className={`font-display tabular text-sm sm:text-lg mt-0.5 ${
                    isToday ? "text-white" : "text-zinc-300"
                  }`}
                >
                  {String(dayDates[i].getDate()).padStart(2, "0")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hour rows */}
        <div className="relative">
          {HOURS.map((hour) => {
            const isMaisonHour = hour === MAISON_HOUR;
            return (
              <div
                key={hour}
                className="grid grid-cols-[28px_repeat(7,minmax(0,1fr))] sm:grid-cols-[44px_repeat(7,minmax(0,1fr))] gap-0.5 sm:gap-1"
              >
                <div className="flex items-start justify-end pr-1 sm:pr-2 pt-1">
                  <span className="text-[8px] sm:text-[10px] tabular tracking-widest text-zinc-600">
                    {String(hour).padStart(2, "0")}h
                  </span>
                </div>
                {Array.from({ length: 7 }).map((_, day) => {
                  const slotStart = (hour - 6) * 2;
                  const slotMid = slotStart + 1;
                  const dayList = sessions[day] || [];
                  const startsAtTop = dayList.includes(slotStart);
                  const startsAtMid = dayList.includes(slotMid);
                  const isContinuation =
                    dayList.includes(slotStart - 1) && !startsAtTop;
                  const isCrossfit = startsAtTop || startsAtMid || isContinuation;
                  const isMaisonSlot = isMaisonHour && maisonDays[day];
                  const isToday = day === todayIdx;

                  return (
                    <div
                      key={day}
                      className={`relative h-9 sm:h-12 border ${
                        isToday ? "border-[#CCFF00]/20" : "border-[#1a1a1d]"
                      } ${
                        isToday && !isCrossfit && !isMaisonSlot
                          ? "bg-[rgba(204,255,0,0.025)]"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSession(day, slotStart)}
                        data-testid={`agenda-slot-${day}-${slotStart}`}
                        className={`absolute inset-x-0 top-0 h-1/2 transition-colors ${
                          !isCrossfit && !isMaisonSlot
                            ? "hover:bg-[#CCFF00]/10 active:bg-[#CCFF00]/20"
                            : ""
                        }`}
                        aria-label={`Jour ${day} ${String(hour).padStart(2, "0")}:00`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSession(day, slotMid)}
                        data-testid={`agenda-slot-${day}-${slotMid}`}
                        className={`absolute inset-x-0 bottom-0 h-1/2 transition-colors ${
                          !isCrossfit && !isMaisonSlot
                            ? "hover:bg-[#CCFF00]/10 active:bg-[#CCFF00]/20"
                            : ""
                        }`}
                        aria-label={`Jour ${day} ${String(hour).padStart(2, "0")}:30`}
                      />

                      {startsAtTop && (
                        <div
                          className="absolute inset-0.5 bg-gradient-to-br from-[#CCFF00] to-[#A8D900] flex items-center justify-center sm:justify-between px-1 sm:px-2 cursor-pointer"
                          onClick={() => toggleSession(day, slotStart)}
                          data-testid={`crossfit-block-${day}-${slotStart}`}
                        >
                          <Dumbbell className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black shrink-0 sm:hidden" />
                          <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                            <Dumbbell className="w-3 h-3 text-black shrink-0" />
                            <div className="min-w-0">
                              <div className="font-display text-[10px] tabular text-black leading-none">
                                {String(hour).padStart(2, "0")}:00
                              </div>
                              <div className="text-[8px] uppercase tracking-widest text-black/70 leading-none mt-0.5">
                                CROSSFIT 1H
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {startsAtMid && (
                        <div
                          className="absolute left-0.5 right-0.5 top-1/2 bottom-[-18px] sm:bottom-[-24px] bg-gradient-to-br from-[#CCFF00] to-[#A8D900] flex items-center justify-center sm:justify-between px-1 sm:px-2 cursor-pointer z-10"
                          onClick={() => toggleSession(day, slotMid)}
                          data-testid={`crossfit-block-${day}-${slotMid}`}
                        >
                          <Dumbbell className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black shrink-0 sm:hidden" />
                          <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                            <Dumbbell className="w-3 h-3 text-black shrink-0" />
                            <div className="min-w-0">
                              <div className="font-display text-[10px] tabular text-black leading-none">
                                {String(hour).padStart(2, "0")}:30
                              </div>
                              <div className="text-[8px] uppercase tracking-widest text-black/70 leading-none mt-0.5">
                                CROSSFIT 1H
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isMaisonSlot && !isCrossfit && (
                        <div
                          className="absolute inset-0.5 bg-white flex items-center justify-center gap-1 sm:gap-1.5"
                          data-testid={`maison-block-${day}`}
                        >
                          <Home className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black" />
                          <span className="hidden sm:inline font-display text-[10px] uppercase tracking-widest text-black">
                            MAISON
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <p className="px-4 sm:px-6 pb-5 pt-3 text-[10px] sm:text-[11px] text-zinc-500 leading-relaxed">
        <span className="text-zinc-300">Astuce :</span> utilise le formulaire ou tape directement dans la grille. Les blocs <span className="text-[#CCFF00]">CrossFit</span> font 1h, les <span className="text-white">séances Maison</span> à 18:00 sont calculées automatiquement. Reset chaque lundi.
      </p>
    </section>
  );
};

export default Agenda;

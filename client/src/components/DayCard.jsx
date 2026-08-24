function DayCard({ day }) {
  const timeColors = {
    morning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    afternoon: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    evening: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    full_day: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  };
  const routeLabel = [...new Set(day.activities.map((act) => act.location))]
    .filter(Boolean)
    .join(' + ') || day.day_summary || day.stay.location;
  const stayLabel = day.stay?.name ? `${day.stay.name}, ${day.stay.location}` : day.stay?.location;

  return (
    <article className="overflow-hidden rounded-2xl border border-white/6 bg-[#141414]/50 backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-white/5 bg-white/[0.02] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 border border-white/10 text-sm font-black text-white">
            {day.day}
          </span>
          <div>
            <p className="text-base font-black text-white">Day {day.day}</p>
            <p className="text-sm font-semibold text-white/30">{routeLabel}</p>
            {stayLabel && (
              <p className="mt-1 text-[11px] font-black uppercase tracking-wider text-emerald-400/70">
                Stay: {stayLabel}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm font-bold text-white/30">
          {day.activities.length} planned stop{day.activities.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="divide-y divide-white/5">
        {day.activities.map((act, i) => (
          <div key={i} className="grid gap-4 px-6 py-5 md:grid-cols-[140px_1fr_180px] md:items-start">
            <span
              className={`w-fit rounded-full border px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider ${timeColors[act.time] || 'bg-white/5 text-white/50 border-white/10'}`}
            >
              {act.time.replace('_', ' ')}
            </span>
            <div>
              <p className="text-lg font-black text-white">{act.name}</p>
              <p className="mt-1 text-sm font-semibold text-white/30">
                {act.location} · {act.duration}h
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{act.reasoning}</p>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
              {typeof act.distance_from_base_km === 'number' && (
                <span className="rounded-lg bg-white/5 border border-white/5 px-3 py-2 text-sm font-black text-white/60">
                  {act.distance_from_base_km} km
                  {act.distance_from_stay_km !== undefined ? ' from stay' : ''}
                </span>
              )}
              <span className="rounded-lg bg-white/5 border border-white/5 px-3 py-2 text-sm font-black text-white/60">
                ₹{act.price.toLocaleString()}
              </span>
              {act.map_url && (
                <a
                  href={act.map_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-emerald-600/20 border border-emerald-500/20 px-3 py-2 text-sm font-black text-emerald-300 transition hover:bg-emerald-600/30"
                >
                  Map
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default DayCard;
function DayCard({ day }) {
  const timeColors = {
    morning: 'bg-amber-100 text-amber-900',
    afternoon: 'bg-cyan-100 text-cyan-900',
    evening: 'bg-indigo-100 text-indigo-900',
    full_day: 'bg-emerald-100 text-emerald-900',
  };
  const routeLabel = [...new Set(day.activities.map((act) => act.location))]
    .filter(Boolean)
    .join(' + ') || day.day_summary || day.stay.location;
  const stayLabel = day.stay?.name ? `${day.stay.name}, ${day.stay.location}` : day.stay?.location;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">{day.day}</span>
          <div>
            <p className="text-base font-black text-slate-950">Day {day.day}</p>
            <p className="text-sm font-semibold text-slate-500">{routeLabel}</p>
            {stayLabel && (
              <p className="mt-1 text-xs font-black uppercase text-emerald-700">Stay: {stayLabel}</p>
            )}
          </div>
        </div>
        <p className="text-sm font-bold text-slate-500">
          {day.activities.length} planned stop{day.activities.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {day.activities.map((act, i) => (
          <div key={i} className="grid gap-4 px-5 py-4 md:grid-cols-[140px_1fr_180px] md:items-start">
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${timeColors[act.time] || 'bg-slate-100 text-slate-800'}`}>
              {act.time.replace('_', ' ')}
            </span>
            <div>
              <p className="text-lg font-black text-slate-950">{act.name}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {act.location} &middot; {act.duration}h
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-800">{act.reasoning}</p>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
              {typeof act.distance_from_base_km === 'number' && (
                <span className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-black text-slate-800">
                  {act.distance_from_base_km} km
                  {act.distance_from_stay_km !== undefined ? ' from stay' : ''}
                </span>
              )}
              <span className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-black text-slate-800">
                Rs.{act.price}
              </span>
              {act.map_url && (
                <a
                  href={act.map_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-[#007a5a] px-3 py-2 text-sm font-black text-white transition hover:bg-[#00684d]"
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

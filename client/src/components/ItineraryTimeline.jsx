import DayCard from './DayCard';

function ItineraryTimeline({ itinerary }) {
  const nights = itinerary.nights ?? Math.max(0, itinerary.daily_breakdown.length - 1);
  const activityCount = itinerary.daily_breakdown.reduce((sum, day) => sum + day.activities.length, 0);
  const stayBudget = itinerary.stay_budget_total_inr ?? itinerary.base_stay.price_per_night * nights;
  const activityBudget = itinerary.activity_budget_total_inr ?? itinerary.planned_activity_cost_inr ?? 0;
  const plannedActivityCost = itinerary.planned_activity_cost_inr ?? activityBudget;
  const plannedAccommodationCost = itinerary.planned_accommodation_cost_inr;
  const nightlyBudget = nights > 0 ? Math.round(stayBudget / nights) : itinerary.base_stay.price_per_night;
  const staySegments = itinerary.stay_segments || [];

  return (
    <div className="rounded-3xl border border-white/6 bg-[#141414]/40 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:p-10">
      <div className="grid gap-8 border-b border-white/5 pb-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-400/70">Your Itinerary</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">
            {itinerary.trip_summary}
          </h2>
          <p className="mt-3 text-base font-semibold text-white/30">
            {staySegments.length > 1 ? `${staySegments.length} stay bases` : 'Single stay base'} across the route
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center">
            <p className="text-3xl font-black text-white">{itinerary.daily_breakdown.length}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/30">Days</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/10 p-4 text-center">
            <p className="text-3xl font-black text-emerald-300">{nights}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400/40">Nights</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/10 p-4 text-center">
            <p className="text-3xl font-black text-amber-300">{activityCount}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-amber-400/40">Stops</p>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <p className="text-xs font-black uppercase tracking-widest text-white/30">Total Trip Budget</p>
          <p className="mt-3 text-4xl font-black text-emerald-300">
            ₹{itinerary.total_estimated_cost_inr.toLocaleString()}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/30">
            Accommodation budget plus activity budget.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <p className="text-xs font-black uppercase tracking-widest text-white/30">Cost Split</p>
          <div className="mt-5 divide-y divide-white/5">
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-base font-black text-white">Accommodation</p>
                <p className="mt-1 text-sm font-semibold text-white/25">
                  {nights} nights × ₹{nightlyBudget.toLocaleString()} budget/night
                </p>
                {typeof plannedAccommodationCost === 'number' && (
                  <p className="mt-1 text-sm font-semibold text-emerald-400/60">
                    Planned stays total ₹{plannedAccommodationCost.toLocaleString()}
                  </p>
                )}
              </div>
              <p className="text-xl font-black text-white/80">₹{stayBudget.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-base font-black text-white">Activities Budget</p>
                <p className="mt-1 text-sm font-semibold text-white/25">Amount you entered for experiences</p>
              </div>
              <p className="text-xl font-black text-white/80">₹{activityBudget.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-base font-black text-emerald-300">Planned Activity Spend</p>
                <p className="mt-1 text-sm font-semibold text-white/25">Selected stops total inside the activity budget</p>
              </div>
              <p className="text-xl font-black text-emerald-300">₹{plannedActivityCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {staySegments.length > 0 && (
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-xl font-black text-white">Stay Route</h3>
            <span className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs font-black text-white/50">
              {staySegments.length} base{staySegments.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {staySegments.map((segment) => (
              <div
                key={`${segment.start_day}-${segment.stay.stay_name}`}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5 transition hover:bg-white/[0.04] hover:border-white/10"
              >
                <p className="text-xs font-black uppercase tracking-widest text-emerald-400/60">
                  Days {segment.start_day}-{segment.end_day} · {segment.nights} night{segment.nights === 1 ? '' : 's'}
                </p>
                <p className="mt-2 text-lg font-black text-white">{segment.stay.stay_name}</p>
                <p className="mt-1 text-sm font-semibold text-white/25">
                  {segment.area} · ₹{segment.stay.price_per_night.toLocaleString()}/night
                </p>
                {segment.stay.map_url && (
                  <a
                    href={segment.stay.map_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-lg bg-emerald-600/20 border border-emerald-500/20 px-4 py-2 text-xs font-black text-emerald-300 transition hover:bg-emerald-600/30"
                  >
                    Open Stay Map
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-xl font-black text-white">Daily Route</h3>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-300">
            {activityCount} experiences
          </span>
        </div>

        <div className="grid gap-5">
          {itinerary.daily_breakdown.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ItineraryTimeline;
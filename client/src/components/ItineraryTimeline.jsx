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
    <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:p-7">
      <div className="grid gap-6 border-b border-slate-100 pb-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-emerald-700">Your itinerary</p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 md:text-4xl">{itinerary.trip_summary}</h2>
          <p className="mt-3 text-lg font-semibold text-slate-600">
            {staySegments.length > 1 ? `${staySegments.length} stay bases` : 'Single stay base'} across the route
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <p className="text-2xl font-black">{itinerary.daily_breakdown.length}</p>
            <p className="mt-1 text-xs font-bold uppercase text-white/60">days</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-4 text-emerald-950">
            <p className="text-2xl font-black">{nights}</p>
            <p className="mt-1 text-xs font-bold uppercase text-emerald-700">nights</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 text-amber-950">
            <p className="text-2xl font-black">{activityCount}</p>
            <p className="mt-1 text-xs font-bold uppercase text-amber-700">stops</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-100 bg-[#f7fbf7] p-5">
          <p className="text-sm font-black uppercase tracking-normal text-slate-500">Total trip budget</p>
          <p className="mt-2 text-3xl font-black text-emerald-800">Rs.{itinerary.total_estimated_cost_inr.toLocaleString()}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Accommodation budget plus activity budget.
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-5">
          <p className="text-sm font-black uppercase tracking-normal text-slate-500">Cost split</p>
          <div className="mt-4 divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-base font-black text-slate-950">Accommodation</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{nights} nights x Rs.{nightlyBudget.toLocaleString()} budget/night</p>
                {typeof plannedAccommodationCost === 'number' && (
                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    Planned stays total Rs.{plannedAccommodationCost.toLocaleString()}
                  </p>
                )}
              </div>
              <p className="text-xl font-black text-slate-950">Rs.{stayBudget.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-base font-black text-slate-950">Activities budget</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Amount you entered for experiences</p>
              </div>
              <p className="text-xl font-black text-slate-950">Rs.{activityBudget.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-base font-black text-emerald-800">Planned activity spend</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Selected stops total inside the activity budget</p>
              </div>
              <p className="text-xl font-black text-emerald-800">Rs.{plannedActivityCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {staySegments.length > 0 && (
        <div className="mt-7">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-xl font-black text-slate-950">Stay route</h3>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
              {staySegments.length} base{staySegments.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {staySegments.map((segment) => (
              <div key={`${segment.start_day}-${segment.stay.stay_name}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black uppercase text-emerald-700">
                  Days {segment.start_day}-{segment.end_day} · {segment.nights} night{segment.nights === 1 ? '' : 's'}
                </p>
                <p className="mt-2 text-lg font-black text-slate-950">{segment.stay.stay_name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{segment.area} · Rs.{segment.stay.price_per_night.toLocaleString()}/night</p>
                {segment.stay.map_url && (
                  <a
                    href={segment.stay.map_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex rounded-lg bg-[#007a5a] px-3 py-2 text-sm font-black text-white transition hover:bg-[#00684d]"
                  >
                    Open stay map
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-black text-slate-950">Daily route</h3>
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
            {activityCount} experiences
          </span>
        </div>

        <div className="grid gap-4">
          {itinerary.daily_breakdown.map((day) => <DayCard key={day.day} day={day} />)}
        </div>
      </div>
    </div>
  );
}

export default ItineraryTimeline;

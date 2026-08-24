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
    <div className="itinerary-shell">
      <div className="itinerary-header">
        <div>
          <p className="itinerary-kicker">Your itinerary</p>
          <h2 className="itinerary-title display-face">{itinerary.trip_summary}</h2>
          <p className="itinerary-subtitle">
            {staySegments.length > 1 ? `${staySegments.length} stay bases` : 'Single stay base'} across the route
          </p>
        </div>

        <div className="itinerary-stats" aria-label="Trip summary">
          <div className="stat-card">
            <p className="stat-value">{itinerary.daily_breakdown.length}</p>
            <p className="stat-label">Days</p>
          </div>
          <div className="stat-card accent">
            <p className="stat-value">{nights}</p>
            <p className="stat-label">Nights</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{activityCount}</p>
            <p className="stat-label">Stops</p>
          </div>
        </div>
      </div>

      <div className="budget-grid">
        <div className="budget-card">
          <p className="itinerary-label">Total trip budget</p>
          <p className="budget-total">₹{itinerary.total_estimated_cost_inr.toLocaleString()}</p>
          <p className="itinerary-description">Accommodation budget plus activity budget.</p>
        </div>

        <div className="budget-card">
          <p className="itinerary-label">Cost split</p>
          <div className="budget-list">
            <div className="budget-row">
              <div>
                <p className="budget-name">Accommodation</p>
                <p className="budget-detail">{nights} nights × ₹{nightlyBudget.toLocaleString()} budget/night</p>
                {typeof plannedAccommodationCost === 'number' && (
                  <p className="budget-detail">Planned stays total ₹{plannedAccommodationCost.toLocaleString()}</p>
                )}
              </div>
              <p className="budget-amount">₹{stayBudget.toLocaleString()}</p>
            </div>
            <div className="budget-row">
              <div>
                <p className="budget-name">Activities budget</p>
                <p className="budget-detail">Amount you entered for experiences</p>
              </div>
              <p className="budget-amount">₹{activityBudget.toLocaleString()}</p>
            </div>
            <div className="budget-row">
              <div>
                <p className="budget-name">Planned activity spend</p>
                <p className="budget-detail">Selected stops total inside the activity budget</p>
              </div>
              <p className="budget-amount accent">₹{plannedActivityCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {staySegments.length > 0 && (
        <section className="itinerary-section" aria-labelledby="stay-route-title">
          <div className="subsection-heading">
            <h3 id="stay-route-title" className="subsection-title">Stay route</h3>
            <span className="subsection-pill">
              {staySegments.length} base{staySegments.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="stay-grid">
            {staySegments.map((segment) => (
              <article key={`${segment.start_day}-${segment.stay.stay_name}`} className="stay-card">
                <p className="stay-meta">
                  Days {segment.start_day}-{segment.end_day} · {segment.nights} night{segment.nights === 1 ? '' : 's'}
                </p>
                <p className="stay-name">{segment.stay.stay_name}</p>
                <p className="stay-detail">{segment.area} · ₹{segment.stay.price_per_night.toLocaleString()}/night</p>
                {segment.stay.map_url && (
                  <a href={segment.stay.map_url} target="_blank" rel="noreferrer" className="text-link">
                    Open stay map ↗
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="itinerary-section" aria-labelledby="daily-route-title">
        <div className="subsection-heading">
          <h3 id="daily-route-title" className="subsection-title">Daily route</h3>
          <span className="subsection-pill">{activityCount} experiences</span>
        </div>
        <div className="day-list">
          {itinerary.daily_breakdown.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ItineraryTimeline;

function DayCard({ day }) {
  const routeLabel = [...new Set(day.activities.map((act) => act.location))]
    .filter(Boolean)
    .join(' + ') || day.day_summary || day.stay.location;
  const stayLabel = day.stay?.name ? `${day.stay.name}, ${day.stay.location}` : day.stay?.location;

  return (
    <article className="day-card">
      <div className="day-header">
        <div className="day-heading">
          <span className="day-number" aria-hidden="true">{day.day}</span>
          <div>
            <p className="day-name">Day {day.day}</p>
            <p className="day-route" title={routeLabel}>{routeLabel}</p>
            {stayLabel && <p className="day-stay">Stay: {stayLabel}</p>}
          </div>
        </div>
        <p className="day-count">{day.activities.length} planned stop{day.activities.length === 1 ? '' : 's'}</p>
      </div>

      <div className="activity-list">
        {day.activities.map((act, i) => (
          <div key={i} className="activity-row">
            <span className="time-chip">{act.time.replace('_', ' ')}</span>
            <div>
              <p className="activity-name">{act.name}</p>
              <p className="activity-meta">{act.location} · {act.duration}h</p>
              <p className="activity-reasoning">{act.reasoning}</p>
            </div>
            <div className="activity-actions">
              {typeof act.distance_from_base_km === 'number' && (
                <span className="data-pill">
                  {act.distance_from_base_km} km{act.distance_from_stay_km !== undefined ? ' from stay' : ''}
                </span>
              )}
              <span className="data-pill">₹{act.price.toLocaleString()}</span>
              {act.map_url && (
                <a href={act.map_url} target="_blank" rel="noreferrer" className="data-pill link">
                  Map ↗
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

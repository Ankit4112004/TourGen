import { useState } from 'react';

function TripForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    budget_per_night: 5000,
    vibe: 'relaxed',
    travelers: 'couple',
    activity_budget: 5000,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form id="trip-form" onSubmit={handleSubmit} className="planner-card">
      <div className="planner-heading">
        <div>
          <p className="planner-kicker">Build your route</p>
          <h2 className="planner-title">Trip preferences</h2>
        </div>
        <p className="planner-note">Bihar only</p>
      </div>

      <div className="trip-form-grid">
        <div className="form-field">
          <label className="form-label" htmlFor="start-date">Start date</label>
          <input
            id="start-date"
            type="date"
            required
            className="form-control"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="end-date">End date</label>
          <input
            id="end-date"
            type="date"
            required
            className="form-control"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="nightly-budget">Budget / night (₹)</label>
          <input
            id="nightly-budget"
            type="number"
            min="1000"
            step="500"
            required
            className="form-control"
            value={form.budget_per_night}
            onChange={(e) => setForm({ ...form, budget_per_night: Number(e.target.value) })}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="activity-budget">Activity budget (₹)</label>
          <input
            id="activity-budget"
            type="number"
            min="1000"
            step="500"
            required
            className="form-control"
            value={form.activity_budget}
            onChange={(e) => setForm({ ...form, activity_budget: Number(e.target.value) })}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="vibe">Vibe</label>
          <select
            id="vibe"
            className="form-control"
            value={form.vibe}
            onChange={(e) => setForm({ ...form, vibe: e.target.value })}
          >
            <option value="relaxed">Relaxed</option>
            <option value="adventure">Adventure</option>
            <option value="cultural">Cultural</option>
            <option value="nature">Nature</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="travelers">Travelers</label>
          <select
            id="travelers"
            className="form-control"
            value={form.travelers}
            onChange={(e) => setForm({ ...form, travelers: e.target.value })}
          >
            <option value="solo">Solo</option>
            <option value="couple">Couple</option>
            <option value="family">Family</option>
            <option value="group">Group</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={loading} className="form-submit">
        {loading ? 'Planning your trip...' : 'Plan my trip'}
      </button>
    </form>
  );
}

export default TripForm;

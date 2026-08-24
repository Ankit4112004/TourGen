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

  const fieldClass = 'h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100';
  const labelClass = 'mb-2 block text-sm font-bold text-slate-800';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-lg border border-white/45 bg-white/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur md:p-7">
      <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-emerald-700">Build your route</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Trip preferences</h2>
        </div>
        <p className="text-sm font-semibold text-slate-500">Bihar only</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            required
            className={fieldClass}
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input
            type="date"
            required
            className={fieldClass}
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Budget/Night (Rs)</label>
          <input
            type="number"
            min="1000"
            step="500"
            required
            className={fieldClass}
            value={form.budget_per_night}
            onChange={(e) => setForm({ ...form, budget_per_night: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={labelClass}>Activity Budget (Rs)</label>
          <input
            type="number"
            min="1000"
            step="500"
            required
            className={fieldClass}
            value={form.activity_budget}
            onChange={(e) => setForm({ ...form, activity_budget: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={labelClass}>Vibe</label>
          <select className={fieldClass} value={form.vibe} onChange={(e) => setForm({ ...form, vibe: e.target.value })}>
            <option value="relaxed">Relaxed</option>
            <option value="adventure">Adventure</option>
            <option value="cultural">Cultural</option>
            <option value="nature">Nature</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Travelers</label>
          <select className={fieldClass} value={form.travelers} onChange={(e) => setForm({ ...form, travelers: e.target.value })}>
            <option value="solo">Solo</option>
            <option value="couple">Couple</option>
            <option value="family">Family</option>
            <option value="group">Group</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 h-[52px] w-full rounded-lg bg-[#007a5a] px-5 text-base font-black text-white shadow-[0_14px_30px_rgba(0,122,90,0.28)] transition hover:bg-[#00684d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Planning your trip...' : 'Plan My Trip'}
      </button>
    </form>
  );
}

export default TripForm;

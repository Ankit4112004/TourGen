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

  const fieldClass =
    'h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-base font-semibold text-white placeholder-white/20 outline-none transition focus:border-amber-500/50 focus:bg-white/10 focus:ring-2 focus:ring-amber-500/20';
  const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-widest text-white/40';

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#141414]/60 p-7 shadow-2xl backdrop-blur-2xl md:p-8 relative overflow-hidden"
    >
      {/* Water drop highlight */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mb-8 flex flex-col gap-2 border-b border-white/5 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Build your route</p>
          <h2 className="mt-2 text-2xl font-black text-white">Trip Preferences</h2>
        </div>
        <p className="text-xs font-bold text-white/25">Bihar Only</p>
      </div>

      <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2">
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
          <label className={labelClass}>Budget / Night (₹)</label>
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
          <label className={labelClass}>Activity Budget (₹)</label>
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
          <select
            className={fieldClass}
            value={form.vibe}
            onChange={(e) => setForm({ ...form, vibe: e.target.value })}
          >
            <option value="relaxed" className="bg-[#1a1a1a] text-white">Relaxed</option>
            <option value="adventure" className="bg-[#1a1a1a] text-white">Adventure</option>
            <option value="cultural" className="bg-[#1a1a1a] text-white">Cultural</option>
            <option value="nature" className="bg-[#1a1a1a] text-white">Nature</option>
            <option value="luxury" className="bg-[#1a1a1a] text-white">Luxury</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Travelers</label>
          <select
            className={fieldClass}
            value={form.travelers}
            onChange={(e) => setForm({ ...form, travelers: e.target.value })}
          >
            <option value="solo" className="bg-[#1a1a1a] text-white">Solo</option>
            <option value="couple" className="bg-[#1a1a1a] text-white">Couple</option>
            <option value="family" className="bg-[#1a1a1a] text-white">Family</option>
            <option value="group" className="bg-[#1a1a1a] text-white">Group</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="relative mt-8 h-14 w-full overflow-hidden rounded-xl bg-amber-600 px-5 text-base font-black text-white shadow-[0_14px_40px_rgba(217,119,6,0.25)] transition-all hover:bg-amber-500 hover:shadow-[0_14px_50px_rgba(217,119,6,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="relative z-10">{loading ? 'Planning your trip...' : 'Plan My Trip'}</span>
        <div className="absolute inset-0 bg-white/10 opacity-0 transition hover:opacity-100" />
      </button>
    </form>
  );
}

export default TripForm;
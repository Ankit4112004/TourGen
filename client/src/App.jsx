import { useState } from 'react';
import TripForm from './components/TripForm';
import ItineraryTimeline from './components/ItineraryTimeline';
import axios from 'axios';
import biharHero from './assets/bihar-hero.jpg';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function App() {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlan = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/plan-trip`, formData);
      setItinerary(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] text-slate-950">
      <section
        className="relative min-h-[620px] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${biharHero})` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,15,10,0.95)_0%,rgba(25,15,10,0.7)_42%,rgba(25,15,10,0.1)_100%)]" />
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl grid-cols-1 items-center gap-8 px-5 py-10 md:grid-cols-[0.9fr_1.1fr] md:px-8 lg:px-10">
          <header className="max-w-xl text-white">
            <p className="mb-4 w-fit rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              Bihar itinerary studio
            </p>
            <h1 className="text-5xl font-black leading-[1.02] tracking-normal md:text-7xl">
              BiharChale
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-white/85">
              Discover Bihar. Experience Bihar.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              <div className="border-l border-white/25 pl-4">
                <p className="text-2xl font-black">15+</p>
                <p className="mt-1 text-xs font-semibold uppercase text-white/65">stays</p>
              </div>
              <div className="border-l border-white/25 pl-4">
                <p className="text-2xl font-black">25+</p>
                <p className="mt-1 text-xs font-semibold uppercase text-white/65">activities</p>
              </div>
              <div className="border-l border-white/25 pl-4">
                <p className="text-2xl font-black">1</p>
                <p className="mt-1 text-xs font-semibold uppercase text-white/65">clear plan</p>
              </div>
            </div>
          </header>

          <div className="md:justify-self-end">
            <TripForm onSubmit={handlePlan} loading={loading} />

            {loading && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm backdrop-blur-md">
                <span className="h-4 w-4 rounded-full border-2 border-amber-700 border-t-transparent animate-spin" />
                Planning your perfect trip...
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 shadow-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative -mt-14 px-5 pb-16 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {itinerary ? (
            <ItineraryTimeline itinerary={itinerary} />
          ) : (
            <div className="grid gap-4 rounded-xl border border-white/40 bg-white/60 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:grid-cols-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-amber-800">Bodh Gaya</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">Ancient temples, the Bodhi tree, peace, and spiritual calm.</p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-amber-800">Rajgir</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">Lush hills, hot springs, glass bridge, and deep history.</p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-amber-800">Patna</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">Rich heritage, grand museums, and the banks of the Ganges.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;

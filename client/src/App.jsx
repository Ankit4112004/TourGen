import { useState, useEffect } from 'react';
import axios from 'axios';
import TripForm from './components/TripForm';
import ItineraryTimeline from './components/ItineraryTimeline';
import HeritageStory from './components/HeritageStory';
import BiharOutlineBackground from './components/BiharOutlineBackground';
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

  useEffect(() => {
    if (itinerary) {
      document.getElementById('itinerary-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [itinerary]);
  return (
    <main className="app-shell">
      <div className="page-container">
        <nav className="topbar" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="BiharChale home">
            <span className="brand-mark" aria-hidden="true">B</span>
            <span>BiharChale</span>
          </a>
          <div className="topbar-nav">
            <a href="#inspiration">Explore Bihar</a>
            <a href="#planner">Build a route</a>
          </div>
          <span className="topbar-note">A quieter way to travel</span>
        </nav>
      </div>

      <section id="top" className="hero-wrap" aria-labelledby="hero-title">
        <div className="page-container hero-grid">
          <div className="hero-copy">
            <BiharOutlineBackground />
            <p className="eyebrow">Bihar itinerary studio</p>
            <h1 id="hero-title" className="hero-title display-face">
              Go beyond the <em>usual route.</em>
            </h1>
            <p className="hero-description">
              Thoughtful Bihar itineraries, shaped around your pace, budget, and the places you want to remember.
            </p>

            <div className="hero-meta" aria-label="BiharChale highlights">
              <div className="meta-item">
                <p className="meta-value">15+</p>
                <p className="meta-label">Curated stays</p>
              </div>
              <div className="meta-item">
                <p className="meta-value">25+</p>
                <p className="meta-label">Local experiences</p>
              </div>
              <div className="meta-item">
                <p className="meta-value">1</p>
                <p className="meta-label">Clear plan</p>
              </div>
            </div>
          </div>

          <div id="planner" className="planner-column">
            <div className="hero-image" aria-hidden="true">
              <img src={biharHero} alt="Mahabodhi Temple at sunset" />
            </div>
            <TripForm onSubmit={handlePlan} loading={loading} />

            {loading && (
              <div className="status-message loading" role="status">
                <span className="status-spinner" aria-hidden="true" />
                Planning your perfect trip...
              </div>
            )}

            {error && (
              <div className="status-message error" role="alert">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {itinerary && (
        <section id="itinerary-result" className="content-section" aria-labelledby="itinerary-heading">
          <div className="page-container">
            <ItineraryTimeline itinerary={itinerary} />
          </div>
        </section>
      )}

      <HeritageStory />

      <section id="inspiration" className="content-section" aria-labelledby="inspiration-title">
        <div className="page-container">
          {!itinerary && (
            <>
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">Start with a feeling</p>
                  <h2 id="inspiration-title" className="section-title display-face">Three places to begin.</h2>
                </div>
                <p className="section-caption">
                  A little inspiration before you choose your dates. Every route is built to leave room for the unexpected.
                </p>
              </div>

              <div className="inspiration-grid">
                <article className="inspiration-card">
                  <p className="inspiration-number">01</p>
                  <h3 className="inspiration-title">Bodh Gaya</h3>
                  <p className="inspiration-copy">Ancient temples, the Bodhi tree, and space for a slower kind of morning.</p>
                </article>
                <article className="inspiration-card">
                  <p className="inspiration-number">02</p>
                  <h3 className="inspiration-title">Rajgir</h3>
                  <p className="inspiration-copy">Lush hills, hot springs, the glass bridge, and deep history in every turn.</p>
                </article>
                <article className="inspiration-card">
                  <p className="inspiration-number">03</p>
                  <h3 className="inspiration-title">Patna</h3>
                  <p className="inspiration-copy">Rich heritage, thoughtful museums, and evenings beside the Ganges.</p>
                </article>
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="page-container footer-inner">
          <span><strong>BiharChale</strong> · Discover Bihar at your own pace.</span>
          <span>Made for meaningful journeys.</span>
        </div>
      </footer>
    </main>
  );
}

export default App;

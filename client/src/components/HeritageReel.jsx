import { useEffect, useRef, useState } from 'react';
import reelPoster from '../assets/heritage/bodh-gaya.jpg';
import reelVideo from '../assets/heritage/heritage-reel.mp4';

function HeritageReel() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video || hasVideoError) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section ref={sectionRef} className="reel-section" aria-labelledby="reel-title">
      <div className="page-container reel-layout">
        <div className="reel-copy">
          <p className="section-eyebrow">A moving picture of Bihar</p>
          <h2 id="reel-title" className="section-title display-face">Give the day a little more time.</h2>
          <p className="reel-description">
            A quiet cut through old stone, open skies, and the places that make a route feel like more than a list of stops.
          </p>
          <div className="reel-meta">
            <span>06 places</span>
            <span>01 quiet route</span>
          </div>
        </div>

        <div className={`reel-frame ${hasVideoError ? 'is-fallback' : ''}`}>
          {!hasVideoError ? (
            <video
              ref={videoRef}
              className="reel-video"
              src={reelVideo}
              poster={reelPoster}
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setHasVideoError(true)}
              aria-label="Slow-motion montage of Bihar heritage sites"
            />
          ) : (
            <img className="reel-fallback" src={reelPoster} alt="Mahabodhi Temple in Bodh Gaya" />
          )}
          <div className="reel-overlay" aria-hidden="true" />
          <div className="reel-caption">
            <span>Heritage, in a slower frame</span>
            {!hasVideoError && (
              <button type="button" className="reel-control" onClick={togglePlayback} aria-label={isPlaying ? 'Pause heritage montage' : 'Play heritage montage'}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeritageReel;

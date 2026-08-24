import { useEffect, useRef, useState } from 'react';

import bodhGaya from '../assets/heritage/bodh-gaya.jpg';
import nalanda from '../assets/heritage/nalanda.jpg';
import rajgir from '../assets/heritage/rajgir-vishwa-shanti-stupa.jpg';
import golghar from '../assets/heritage/golghar.jpg';
import kesariya from '../assets/heritage/kesariya.jpg';

const scenes = [
  {
    id: 'bodh-gaya',
    index: '01',
    place: 'Bodh Gaya · Gaya district',
    title: 'Where the day begins quietly.',
    description: 'At the Mahabodhi Temple, stone, light, and stillness make room for a slower morning.',
    image: bodhGaya,
    alt: 'The Mahabodhi Temple complex in Bodh Gaya, Bihar',
  },
  {
    id: 'nalanda',
    index: '02',
    place: 'Nalanda · Nalanda district',
    title: 'Walk through a living archive.',
    description: 'Red brick monasteries and long courtyards trace the memory of one of the world’s oldest centres of learning.',
    image: nalanda,
    alt: 'Ruins of a monastery at Nalanda Mahavihara in Bihar',
  },
  {
    id: 'rajgir',
    index: '03',
    place: 'Rajgir · Nalanda district',
    title: 'Let the hills change the pace.',
    description: 'Ancient paths, warm springs, and green hills turn a day in Rajgir into an unhurried detour.',
    image: rajgir,
    alt: 'Vishwa Shanti Stupa on the hills of Rajgir, Bihar',
  },
  {
    id: 'golghar',
    index: '04',
    place: 'Patna · Patna district',
    title: 'A city seen from another angle.',
    description: 'Golghar’s quiet curve is a reminder that even a busy city has room for a slower view.',
    image: golghar,
    alt: 'Golghar, the historic granary in Patna, Bihar',
  },
  {
    id: 'kesariya',
    index: '05',
    place: 'Kesariya · East Champaran',
    title: 'End somewhere with a horizon.',
    description: 'The wide, weathered form of Kesariya Stupa leaves the route open-ended—in the best way.',
    image: kesariya,
    alt: 'Kesariya Stupa in East Champaran, Bihar',
  },
];

function HeritageStory() {
  const [activeId, setActiveId] = useState(scenes[0].id);
  const [scrollProgress, setScrollProgress] = useState(0);
  const beatRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.dataset?.sceneId) {
          setActiveId(visible.target.dataset.sceneId);
          setScrollProgress(0);
        }
      },
      { rootMargin: '-25% 0px -45% 0px', threshold: [0.12, 0.4, 0.7] },
    );

    beatRefs.current.forEach((beat) => beat && observer.observe(beat));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const beat = beatRefs.current.find((item) => item?.dataset.sceneId === activeId);
      if (!beat || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setScrollProgress(0);
        return;
      }

      const rect = beat.getBoundingClientRect();
      const start = window.innerHeight * 0.62;
      const end = window.innerHeight * 0.17;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      setScrollProgress(progress);
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [activeId]);

  const selectScene = (sceneId) => {
    setActiveId(sceneId);
    setScrollProgress(0);
    const beat = beatRefs.current.find((item) => item?.dataset.sceneId === sceneId);
    beat?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  const activeScale = 1 + scrollProgress * 0.07;

  return (
    <section className="heritage-section" aria-labelledby="heritage-title">
      <div className="page-container heritage-content">
        <div className="heritage-intro">
          <div>
            <p className="section-eyebrow">A slower route through Bihar</p>
            <h2 id="heritage-title" className="section-title display-face">Some places ask you to stay a while.</h2>
          </div>
          <p className="section-caption">
            Scroll through a few of the stories your route can hold. The best ones are rarely the most hurried.
          </p>
        </div>

        <div className="heritage-layout">
          <div className="heritage-stage-wrap" aria-live="polite">
            <div className="heritage-stage">
              {scenes.map((scene) => (
                <figure
                  key={scene.id}
                  className={`heritage-stage-frame ${activeId === scene.id ? 'is-active' : ''}`}
                  style={activeId === scene.id ? { transform: `scale(${activeScale})` } : undefined}
                >
                  <img src={scene.image} alt={activeId === scene.id ? scene.alt : ''} loading={scene.id === scenes[0].id ? 'eager' : 'lazy'} />
                  <div className="heritage-stage-shade" />
                  <figcaption>
                    <span>{scene.place}</span>
                    <strong>{scene.index}</strong>
                  </figcaption>
                </figure>
              ))}
              <div className="heritage-stage-note" aria-hidden="true">
                <span>Scroll to wander</span>
                <span className="heritage-stage-line" />
              </div>
            </div>
          </div>

          <div className="heritage-beats">
              {scenes.map((scene, index) => (
                <article
                  key={scene.id}
                  ref={(element) => { beatRefs.current[index] = element; }}
                  data-scene-id={scene.id}
                  className={`heritage-beat ${activeId === scene.id ? 'is-active' : ''}`}
                >
                  <div className="heritage-beat-index">{scene.index}</div>
                  <div>
                    <p className="heritage-beat-place">{scene.place}</p>
                    <h3 className="heritage-beat-title display-face">{scene.title}</h3>
                    <p className="heritage-beat-copy">{scene.description}</p>
                  </div>
                </article>
              ))}
            </div>
        </div>

      </div>
    </section>
  );
}

export default HeritageStory;

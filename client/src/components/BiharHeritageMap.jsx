import { useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature, merge, mesh } from 'topojson-client';
import biharTopology from '../assets/maps/bihar.topo.json';

const mapWidth = 620;
const mapHeight = 460;
const mapObject = biharTopology.objects['bihar-division'];
const divisions = feature(biharTopology, mapObject);
const outerBoundary = merge(biharTopology, mapObject.geometries);
const internalLines = mesh(biharTopology, mapObject, (a, b) => a !== b);

const mapSites = [
  { id: 'bodh-gaya', name: 'Bodh Gaya', district: 'Gaya', coordinates: [84.9913, 24.6951], x: 0, y: 0 },
  { id: 'nalanda', name: 'Nalanda', district: 'Nalanda', coordinates: [85.4432, 25.1368], x: 0, y: 0 },
  { id: 'rajgir', name: 'Rajgir', district: 'Nalanda', coordinates: [85.4206, 25.0269], x: 0, y: 0 },
  { id: 'golghar', name: 'Golghar', district: 'Patna', coordinates: [85.1376, 25.5941], x: 0, y: 0 },
  { id: 'vikramshila', name: 'Vikramshila', district: 'Bhagalpur', coordinates: [87.2895, 25.3273], x: 0, y: 0 },
  { id: 'kesariya', name: 'Kesariya', district: 'East Champaran', coordinates: [84.8723, 26.3494], x: 0, y: 0 },
];

function BiharHeritageMap({ activeId, onSelect }) {
  const [hoveredId, setHoveredId] = useState(null);
  const projection = useMemo(() => geoMercator().fitSize([mapWidth, mapHeight], divisions), []);
  const path = useMemo(() => geoPath(projection), [projection]);
  const projectedSites = useMemo(
    () => mapSites.map((site) => ({ ...site, point: projection(site.coordinates) })),
    [projection],
  );
  const focusedSite = projectedSites.find((site) => site.id === hoveredId || site.id === activeId) || projectedSites[0];

  return (
    <div className="heritage-map-panel">
      <div className="heritage-map-copy">
        <p className="section-eyebrow">The route, at a glance</p>
        <h3 className="heritage-map-title display-face">A few meaningful dots on the map.</h3>
        <p className="heritage-map-description">
          Select a place to bring its story forward. The map stays quiet so the route remains the thing you notice.
        </p>
        <div className="heritage-map-focus" aria-live="polite">
          <span>Currently showing</span>
          <strong>{focusedSite.name}</strong>
          <small>{focusedSite.district} district</small>
        </div>
        <button type="button" className="heritage-map-reset" onClick={() => onSelect('bodh-gaya')}>
          Return to the first stop
        </button>
      </div>

      <div className="heritage-map-canvas">
        <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} role="img" aria-labelledby="bihar-map-title bihar-map-description">
          <title id="bihar-map-title">Bihar heritage route map</title>
          <desc id="bihar-map-description">A stylized outline of Bihar with internal division lines and six selectable heritage sites.</desc>
          <path className="map-outer-boundary" d={path(outerBoundary)} />
          <path className="map-internal-lines" d={path(internalLines)} />
          {projectedSites.map((site) => {
            const [cx, cy] = site.point;
            const isActive = site.id === activeId;
            const isHovered = site.id === hoveredId;
            return (
              <g key={site.id} className={`map-marker ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}>
                <circle className="map-marker-halo" cx={cx} cy={cy} r={isActive ? 15 : 10} />
                <circle
                  className="map-marker-button"
                  cx={cx}
                  cy={cy}
                  r={isActive ? 6 : 4.5}
                  tabIndex="0"
                  role="button"
                  aria-label={`Show ${site.name}, ${site.district} district`}
                  onClick={() => onSelect(site.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(site.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredId(site.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(site.id)}
                  onBlur={() => setHoveredId(null)}
                />
                {(isActive || isHovered) && (
                  <text className="map-marker-label" x={cx + 11} y={cy - 11}>{site.name}</text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="heritage-map-legend" aria-hidden="true">
          <span><i className="legend-dot" /> Heritage site</span>
          <span><i className="legend-line" /> Bihar divisions</span>
        </div>
      </div>
    </div>
  );
}

export default BiharHeritageMap;

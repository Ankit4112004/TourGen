import { useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature, merge, mesh } from 'topojson-client';
import biharTopology from '../assets/maps/bihar.topo.json';

const width = 1040;
const height = 720;
const mapObject = biharTopology.objects['bihar-division'];
const divisions = feature(biharTopology, mapObject);
const outerBoundary = merge(biharTopology, mapObject.geometries);
const internalLines = mesh(biharTopology, mapObject, (a, b) => a !== b);

function BiharOutlineBackground() {
  const projection = useMemo(() => geoMercator().fitSize([width, height], divisions), []);
  const path = useMemo(() => geoPath(projection), [projection]);

  return (
    <div className="heritage-outline-bg" aria-hidden="true">
      <svg viewBox={`0 0 ${width} ${height}`}>
        <path className="heritage-outline-outer" d={path(outerBoundary)} />
        <path className="heritage-outline-inner" d={path(internalLines)} />
      </svg>
    </div>
  );
}

export default BiharOutlineBackground;

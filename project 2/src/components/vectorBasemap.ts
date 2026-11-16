import type { Map as LeafletMap } from 'leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(workerUrl);

export function addVectorBasemap(
  map: LeafletMap,
  onReady: () => void,
  onError: () => void,
  onContextLost: () => void,
) {
  const layer = maplibreGL({
    interactive: false,
    attributionControl: { customAttribution: '© <a href="https://openfreemap.org/">OpenFreeMap</a> · © <a href="https://www.openmaptiles.org/">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' },
    style: 'https://tiles.openfreemap.org/styles/liberty',
  });
  try {
    layer.addTo(map);
    const vectorMap = layer.getMaplibreMap();
    vectorMap.once('load', onReady);
    vectorMap.on('error', onError);
    vectorMap.on('webglcontextlost', onContextLost);
    return layer;
  } catch (error) {
    if (map.hasLayer(layer)) map.removeLayer(layer);
    throw error;
  }
}

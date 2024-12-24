import './App.css'
import { useMemo, useEffect } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { GeoJsonLayer } from 'deck.gl';
import { GoogleMapsOverlay as DeckOverlay, GoogleMapsOverlayProps } from '@deck.gl/google-maps';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

// Set your Google Maps API key here or via environment variable
const GOOGLE_MAPS_API_KEY = "AIzaSyC6-kPQq0Hv7gacfZ_1NenpyS_a1ahV910"; // eslint-disable-line
const GOOGLE_MAP_ID = "8682b82c7c8bf444"; // eslint-disable-line

function DeckGLOverlay(props: GoogleMapsOverlayProps) {
  const map = useMap();
  const overlay = useMemo(() => new DeckOverlay(props), [props]);

  useEffect(() => {
    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map, overlay]);

  overlay.setProps(props);
  return null;
}

export default function App() {
  const layers = [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick: info => {
        if (info.object) {
          // eslint-disable-next-line
          alert(`${info.object.properties.name} (${info.object.properties.abbrev})`);
        }
      }
    }),
  ];

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map defaultCenter={{ lat: 51.47, lng: 0.45 }} defaultZoom={4} mapId={GOOGLE_MAP_ID}>
      </Map>
    </APIProvider>
  );
}
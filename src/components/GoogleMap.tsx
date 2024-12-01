import { useEffect, useRef, useState } from "react";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { ScatterplotLayer } from "@deck.gl/layers";

interface DataItem {
  position: [number, number]; // Latitude and Longitude as a tuple of numbers
}

interface Props {
  center: google.maps.LatLngLiteral;
  zoom: number;
  panToMarker: () => void;
}

const GoogleMap = ({ center, zoom, panToMarker }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    if (ref.current) {
      const mapInstance = new window.google.maps.Map(ref.current, {
        center,
        zoom,
      });
      setMap(mapInstance);

      const markerInstance = new window.google.maps.Marker({
        position: center,
        map: mapInstance,
        title: "Uluru",
      });
      setMarker(markerInstance);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (map && marker) {
      map.panTo(marker.getPosition() as google.maps.LatLng);
      map.setZoom(8);
    }
  }, [center, map, marker]);

  useEffect(() => {
    const overlay = new GoogleMapsOverlay({
      layers: [
        new ScatterplotLayer({
          id: "deckgl-circle",
          data: [{ position: [0.45, 51.47] }],
          getPosition: (d: DataItem) => d.position,
          getFillColor: [255, 0, 0, 100],
          getRadius: 1000,
        }),
      ],
    });

    overlay.setMap(map);
  }, [map]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} id="map" style={{ width: "100%", height: "100vh" }}></div>
      <button
        onClick={panToMarker}
        style={{
          position: "absolute",
          bottom: "40px",
          left: "10px",
          zIndex: 10,
        }}
      >
        Pan to Uluru
      </button>
    </div>
  );
};
export default GoogleMap;

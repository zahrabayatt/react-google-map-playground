import { useEffect, useRef, useState } from "react";

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

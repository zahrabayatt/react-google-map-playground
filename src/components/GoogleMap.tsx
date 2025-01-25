import { useEffect, useRef } from "react";

interface GoogleMapProps {
  zoom: number;
  center: google.maps.LatLngLiteral;
  map: google.maps.Map | null;
  setMap: (map: google.maps.Map) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ zoom, center, map, setMap }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: true
      });
      setMap(newMap);
    }
  }, [mapRef, center, zoom, map, setMap]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}

export default GoogleMap;

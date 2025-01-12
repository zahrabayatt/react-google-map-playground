import { useEffect, useRef, useState } from "react";

interface Props {
  center: google.maps.LatLngLiteral;
  zoom: number;
}

const GoogleMap = ({ center, zoom }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (ref.current) {
      const mapInstance = new window.google.maps.Map(ref.current, {
        center,
        zoom,
      });
      setMap(mapInstance);
    }
  }, [center, zoom]);


  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} id="map" style={{ width: "100%", height: "100vh" }}></div>
    </div>
  );
};
export default GoogleMap;
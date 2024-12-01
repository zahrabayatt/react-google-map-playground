import { useEffect, useRef } from "react";

const GoogleMap = ({
  center,
  zoom,
}: {
  center: google.maps.LatLngLiteral;
  zoom: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      new window.google.maps.Map(ref.current, {
        center,
        zoom,
      });
    }
  }, [center, zoom]);

  return <div ref={ref} id="map" style={{ width: "100%", height: "100vh" }} />;
};
export default GoogleMap;

import "./App.css";
import React, { useCallback, useState } from "react";
import ControlButtons from "./components/ControlButtons";
import Map from "./components/Map";

const initialCenter = { lat: -3.745, lng: -38.523 };
const sanFrancisco = { lat: 37.7749, lng: -122.4194 };

function App() {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds(initialCenter);
    mapInstance.fitBounds(bounds);
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handlePanToLocation = () => {
    if (map) map.panTo(sanFrancisco);
  };

  const handleZoomIn = () => {
    if (map) map.setZoom((map.getZoom() || 10) + 1);
  };

  const handleZoomOut = () => {
    if (map) map.setZoom((map.getZoom() || 10) - 1);
  };

  return (
    <div>
      <Map
        onLoad={onLoad}
        onUnmount={onUnmount}
        initialCenter={initialCenter}
      />
      <ControlButtons
        onPan={handlePanToLocation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
}

export default React.memo(App);

import "./App.css";

import React from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "400px",
  height: "400px",
};

const initialCenter = {
  lat: -3.745,
  lng: -38.523,
};

function App() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBLZxDKEynXZdwnrfwiLvi6UjkOew7i8-Y",
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback((mapInstance: google.maps.Map) => {
    // Example of using the map instance
    const bounds = new window.google.maps.LatLngBounds(initialCenter);
    mapInstance.fitBounds(bounds);
    setMap(mapInstance);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  const handlePanToLocation = () => {
    if (map) {
      const newCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco
      map.panTo(newCenter);
    }
  };

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom + 1); // Zoom in
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom - 1); // Zoom out
    }
  };

  return isLoaded ? (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Add markers or child components if needed */}
      </GoogleMap>
      <div style={{ marginTop: "20px" }}>
        <button onClick={handlePanToLocation}>Pan to San Francisco</button>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default React.memo(App);

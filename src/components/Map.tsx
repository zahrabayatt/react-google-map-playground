import React from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "400px",
  height: "400px",
};

interface MapProps {
  onLoad: (mapInstance: google.maps.Map) => void;
  onUnmount: () => void;
  initialCenter: { lat: number; lng: number };
}

const Map = ({ onLoad, onUnmount, initialCenter }: MapProps) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBLZxDKEynXZdwnrfwiLvi6UjkOew7i8-Y",
  });

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={initialCenter}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Add markers or child components here if needed */}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default React.memo(Map);

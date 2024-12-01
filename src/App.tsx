import { useCallback, useMemo } from "react";
import useGoogleMap from "./hooks/useGoogleMap";
import PanToButton from "./components/PanToButton";
import "./App.css";

const App = () => {
  const markerPosition = useMemo(() => ({ lat: -25.344, lng: 131.031 }), []);
  const apiKey = "AIzaSyBLZxDKEynXZdwnrfwiLvi6UjkOew7i8-Y"; // Replace with your actual API key
  const map = useGoogleMap(apiKey, markerPosition);

  const panToMarker = useCallback(() => {
    if (map) {
      map.panTo(markerPosition);
      map.setZoom(8);
    }
  }, [map, markerPosition]);

  return (
    <div style={{ position: "relative" }}>
      <div
        id="map"
        style={{
          width: "100%",
          height: "100vh",
        }}
      ></div>
      <PanToButton onClick={panToMarker} />
    </div>
  );
};

export default App;

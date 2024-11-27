import { useMap } from "@vis.gl/react-google-maps";
import ControlButtons from "./ControlButtons";

const sanFrancisco = { lat: 37.7749, lng: -122.4194 };

const ControlButtonsWrapper = () => {
  const map = useMap();

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
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(255, 255, 255, 0.8)",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
        zIndex: 1000, // Ensure it stays above the map
      }}
    >
      <ControlButtons
        onPan={handlePanToLocation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
};

export default ControlButtonsWrapper;

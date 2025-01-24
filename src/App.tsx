import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useRef, useState } from "react";
import GoogleMap, { GoogleMapHandle } from "./components/GoogleMap";
import Spinner from "./components/Spinner";
import ErrorComponent from "./components/ErrorComponent";
import "./App.css";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// const render = (status: Status): ReactElement => {
//   if (status === Status.FAILURE) return <ErrorComponent />;
//   return <Spinner />;
// };
export type DrawingStateType = "idle" | "drawing" | "complete";
export type DrawingShapeType = "polyline" | "polygon";

const App = () => {
  const [drawingState, setDrawingState] = useState<DrawingStateType>("idle");
  const [paths, setPaths] = useState<google.maps.LatLngLiteral[][]>([]);
  const googleMapRef = useRef<GoogleMapHandle>(null);
  const [shapeType, setShapeType] = useState<DrawingShapeType>("polyline");

  const handleSave = () => {
    if (googleMapRef.current) {
      const currentPath = googleMapRef.current.getCurrentPath();
      if (currentPath.length > 0) {
        setPaths(prev => [...prev, currentPath]);
        googleMapRef.current.clearDrawing();
      }
    }
    setDrawingState("idle");
    console.log(paths)
  };

  // Add this new function
  const handleClear = () => {
    if (googleMapRef.current) {
      googleMapRef.current.clearDrawing();
      setDrawingState("idle"); // Reset to initial state
    }
  };

  return (
    <Wrapper apiKey={apiKey} render={status => status === Status.FAILURE ? <ErrorComponent /> : <Spinner />}>
      <div className="map-container">
        <GoogleMap
          ref={googleMapRef}
          zoom={10}
          center={{ lat: -34.397, lng: 150.644 }}
          drawingState={drawingState}
          onExitDrawing={() => setDrawingState("complete")}
          shapeType={shapeType}
        />
        <div className="controls">
          <select
            value={shapeType}
            onChange={(e) => setShapeType(e.target.value as DrawingShapeType)}
            disabled={drawingState !== "idle"}
          >
            <option value="polyline">Polyline</option>
            <option value="polygon">Polygon</option>
          </select>
          <button
            onClick={() => setDrawingState("drawing")}
            disabled={drawingState !== "idle"}
          >
            Start Drawing
          </button>
          <button
            onClick={handleClear}
            disabled={drawingState === "idle"}
          >
            Clear Drawing
          </button>
          <button
            onClick={handleSave}
            disabled={drawingState === "idle"}
          >
            Save Path
          </button>
        </div>
      </div>
    </Wrapper>
  );
};

export default App;

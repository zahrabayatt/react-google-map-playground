import { useState } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import DrawingControls from "./components/DrawingControls";
import useDrawingManager from "./hooks/drawing/useDrawingManger";
import GoogleMap from "./components/GoogleMap";
import { DrawingEvent, DrawingHandlers, DrawingShape } from "./types/Drawing";
import "./App.css";

const App = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [paths, setPaths] = useState<DrawingEvent[]>([]);
  const [selectedShape, setSelectedShape] = useState<DrawingShape>("polyline");

  console.log(paths)

  const drawingHandlers: DrawingHandlers = {
    onDrawingStart: () => console.log("Drawing started"),
    onDrawingChange: (event) => console.log("Drawing changed", event),
    onDrawingComplete: (event) => setPaths(prev => [...prev, event]),
    onDrawingSave: (event) => console.log("Drawing saved", event)
  };

  const { drawingState, startDrawing, saveDrawing, clearDrawing } =
    useDrawingManager(map, selectedShape, drawingHandlers);

  return (
    <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["geometry"]}>
      <div className="map-container">
        <GoogleMap
          zoom={10}
          center={{ lat: -34.397, lng: 150.644 }}
          map={map}
          setMap={setMap}
        />

        <DrawingControls
          selectedShape={selectedShape}
          drawingState={drawingState}
          onShapeChange={setSelectedShape}
          onStart={startDrawing}
          onClear={clearDrawing}
          onSave={saveDrawing}
        />
      </div>
    </Wrapper>
  );
};

export default App;

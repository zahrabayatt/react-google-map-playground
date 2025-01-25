import { useState } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import GoogleMap from "./components/GoogleMap";
import { DrawingEvent } from "./types/Drawing";
import "./App.css";
import Drawing from "./components/Drawing";

const App = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [paths, setPaths] = useState<DrawingEvent[]>([]);

  console.log(paths)

  return (
    <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["geometry"]}>
      <div className="map-container">
        <GoogleMap
          zoom={10}
          center={{ lat: -34.397, lng: 150.644 }}
          map={map}
          setMap={setMap}
        />

        {map && (
          <Drawing
            map={map}
            onDrawingComplete={(event) => setPaths(prev => [...prev, event])}
          />
        )}
      </div>
    </Wrapper>
  );
};

export default App;

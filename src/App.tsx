import { FlyToInterpolator, LayersList, MapViewState } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useState } from "react";
import "./App.css";

function App() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 0.45,
    latitude: 51.47,
    zoom: 10,
  });

  // Example GeoJSON for boundary (replace with actual boundary data)
  const boundaryGeoJson: GeoJSON.Feature<GeoJSON.Polygon> = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [2.0, 48.8],
          [2.5, 48.8],
          [2.5, 49.0],
          [2.0, 49.0],
          [2.0, 48.8],
        ],
      ],
    },
    properties: {
      name: "Paris Boundary",
    },
  };

  const layers = [
    new ScatterplotLayer({
      id: "deckgl-circle",
      data: [{ position: [0.45, 51.47] }],
      getPosition: (d) => d.position,
      getFillColor: [255, 0, 0, 100],
      getRadius: 1000,
    }),
    new GeoJsonLayer({
      id: "boundary-layer",
      data: boundaryGeoJson,
      filled: true,
      lineWidthMinPixels: 2,
      getFillColor: [0, 0, 255, 100], // Blue boundary color
      getLineColor: [0, 0, 255],
      getLineWidth: 3,
    }),
  ];

  // Calculate the bounding box for the boundary (min and max longitude/latitude)
  const calculateBoundingBox = (geoJson: GeoJSON.Feature<GeoJSON.Polygon>) => {
    const coordinates = geoJson.geometry.coordinates[0];
    let minLng = coordinates[0][0];
    let maxLng = coordinates[0][0];
    let minLat = coordinates[0][1];
    let maxLat = coordinates[0][1];

    coordinates.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    return { minLng, maxLng, minLat, maxLat };
  };

  // Function to calculate the zoom level based on the bounding box
  const calculateZoomLevel = (boundingBox: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  }) => {
    const longitudeDelta = boundingBox.maxLng - boundingBox.minLng;
    const latitudeDelta = boundingBox.maxLat - boundingBox.minLat;

    // Calculate zoom level based on bounding box size (adjust multiplier as needed)
    const zoomLevel = Math.min(
      18,
      Math.max(10, Math.log2(360 / Math.max(longitudeDelta, latitudeDelta)))
    );
    return zoomLevel;
  };

  // Function to fly to the boundary
  const handleFlyToBoundary = () => {
    // Calculate bounding box for the boundary
    const boundingBox = calculateBoundingBox(boundaryGeoJson);

    // Calculate zoom level that fits the bounding box
    const newZoom = calculateZoomLevel(boundingBox);

    // Calculate the center of the boundary for the fly-to location
    const newLongitude = (boundingBox.minLng + boundingBox.maxLng) / 2;
    const newLatitude = (boundingBox.minLat + boundingBox.maxLat) / 2;

    // Update the viewState with the fly-to transition
    setViewState({
      longitude: newLongitude,
      latitude: newLatitude,
      zoom: newZoom,
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 2000, // duration of the fly-to animation in ms
    });
  };

  return (
    <APIProvider apiKey="AIzaSyC6-kPQq0Hv7gacfZ_1NenpyS_a1ahV910">
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <MyMap
          viewState={viewState}
          setViewState={setViewState}
          layers={layers}
        />
        <button
          style={{ position: "absolute", top: 60, left: 10 }}
          onClick={handleFlyToBoundary}
        >
          Fly To New Location
        </button>
        <div
          style={{
            position: "absolute",
            top: 110,
            left: 10,
            display: "flex",
            justifyContent: "space-between",
            gap: "5px",
          }}
        >
          <ZoomInButton viewState={viewState} setViewState={setViewState} />
          <ZoomOutButton viewState={viewState} setViewState={setViewState} />
        </div>
      </div>
    </APIProvider>
  );
}

export default App;

interface MyMapProps {
  viewState: MapViewState;
  setViewState: (viewState: MapViewState) => void;
  layers?: LayersList;
}

const MyMap = ({ viewState, setViewState, layers }: MyMapProps) => {
  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState }) => {
        setViewState(viewState as MapViewState);
      }}
      controller
      layers={layers}
    >
      <Map mapId="8682b82c7c8bf444" />
    </DeckGL>
  );
};

interface ZoomProps {
  viewState: MapViewState;
  setViewState: (viewState: MapViewState) => void;
}

const ZoomInButton = ({ viewState, setViewState }: ZoomProps) => {
  return (
    <button
      onClick={() => {
        const zoom = viewState.zoom ?? 0;
        setViewState({
          ...viewState,
          zoom: zoom + 1,
          transitionInterpolator: new FlyToInterpolator(),
          transitionDuration: 500, // duration of the fly-to animation in ms
        });
      }}
    >
      Zoom In
    </button>
  );
};

const ZoomOutButton = ({ viewState, setViewState }: ZoomProps) => {
  return (
    <button
      onClick={() => {
        const zoom = viewState.zoom ?? 0;
        setViewState({
          ...viewState,
          zoom: zoom - 1,
          transitionInterpolator: new FlyToInterpolator(),
          transitionDuration: 500, // duration of the fly-to animation in ms
        });
      }}
    >
      Zoom Out
    </button>
  );
};

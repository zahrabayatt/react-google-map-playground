import {
  FlyToInterpolator,
  LayersList,
  MapView,
  MapViewState,
  WebMercatorViewport,
} from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 53.688,
    latitude: 32.4279,
    zoom: 4,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 800,
    height: 600,
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

  // Function to fly to the boundary
  const handleFlyToBoundary = () => {
    // Calculate bounding box for the boundary
    const boundingBox = calculateBoundingBox(boundaryGeoJson);

    if (containerRef.current) {
      // Get the actual width and height of the container
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      // Create a WebMercatorViewport instance using the container's dimensions
      const viewport = new WebMercatorViewport({
        width: containerWidth,
        height: containerHeight,
      });

      // Use viewport.fitBounds to calculate the center and zoom level based on the bounding box
      const fitBoundsState = viewport.fitBounds(
        [
          [boundingBox.minLng, boundingBox.minLat], // South-west corner
          [boundingBox.maxLng, boundingBox.maxLat], // North-east corner
        ],
        { padding: 50 } // Optional padding for better view margin
      );

      // Update the viewState with the new center and zoom level
      setViewState({
        longitude: fitBoundsState.longitude,
        latitude: fitBoundsState.latitude,
        zoom: fitBoundsState.zoom,
        transitionInterpolator: new FlyToInterpolator(),
        transitionDuration: 2000, // duration of the fly-to animation in ms
      });
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      // Dynamically calculate the container's width and height
      const updateContainerSize = () => {
        if (containerRef.current) {
          setContainerSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
          });
        }
      };

      // Add resize event listener
      window.addEventListener("resize", updateContainerSize);

      // Initial size calculation
      updateContainerSize();

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener("resize", updateContainerSize);
      };
    }
  }, []);

  useEffect(() => {
    const iranBoundingBox = {
      minLng: 44.0,
      maxLng: 60.0,
      minLat: 23.0,
      maxLat: 39.7,
    };
    const { minLng, maxLng, minLat, maxLat } = iranBoundingBox;

    // Create a WebMercatorViewport instance with dynamic width and height
    const viewport = new WebMercatorViewport({
      width: containerSize.width,
      height: containerSize.height,
    });

    // Calculate the center and zoom level to fit the bounding box
    const fitBoundsState = viewport.fitBounds(
      [
        [minLng, minLat], // South-west corner
        [maxLng, maxLat], // North-east corner
      ],
      { padding: 50 } // Optional padding for better view margin
    );

    // Update the viewState with the new center and zoom level
    setViewState({
      latitude: fitBoundsState.latitude,
      longitude: fitBoundsState.longitude,
      zoom: fitBoundsState.zoom,
    });
  }, [containerSize]);

  return (
    <APIProvider apiKey="AIzaSyC6-kPQq0Hv7gacfZ_1NenpyS_a1ahV910">
      <div
        style={{ width: "100%", height: "100%", position: "relative" }}
        ref={containerRef}
      >
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
      views={new MapView()}
      onViewStateChange={({ viewState }) => {
        setViewState(viewState as MapViewState);
      }}
      controller
      layers={layers}
    >
      <Map
        mapId="8682b82c7c8bf444"
        mapTypeId="hybrid"
        // satellite: satellite google map when labels is off
        // hybrid: satellite google map when labels is on
        // roadmap: default value
        // terrain
      />
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
        console.log("Zoom in", zoom + 1);
        setViewState({
          ...viewState,
          zoom: zoom + 1,
          transitionDuration: 400, // duration of the fly-to animation in ms
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
        console.log("Zoom out", zoom - 1);
        setViewState({
          ...viewState,
          zoom: zoom - 1,
          transitionDuration: 400, // duration of the fly-to animation in ms
        });
      }}
    >
      Zoom Out
    </button>
  );
};

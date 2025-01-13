import { useEffect, useRef, useState } from "react";

interface Props {
  center: google.maps.LatLngLiteral;
  zoom: number;
}

interface SavedPolygon {
  id: string; // Unique ID based on datetime
  polygon: google.maps.Polygon; // The polygon instance
  visible: boolean; // Visibility flag
}

const GoogleMap = ({ center, zoom }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const [savedPolygons, setSavedPolygons] = useState<SavedPolygon[]>([]);

  useEffect(() => {
    if (ref.current) {
      const mapInstance = new window.google.maps.Map(ref.current, {
        center,
        zoom,
      });
      setMap(mapInstance);
    }
  }, [center, zoom]);

  const handleDrawPolygon = () => {
    if (map) {
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions: {
          fillColor: "#FF0000",
          fillOpacity: 0.4,
          strokeWeight: 2,
          clickable: true,
          editable: true, // Allow editing while drawing
          draggable: false,
        },
      });

      drawingManager.setMap(map);

      google.maps.event.addListener(drawingManager, "overlaycomplete", (event: google.maps.drawing.OverlayCompleteEvent) => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          // Stop drawing mode
          drawingManager.setDrawingMode(null);
          drawingManager.setMap(null);

          setPolygon(event.overlay as google.maps.Polygon);
        }
      });
    }
  };

  const generateId = (): string => {
    // Generate a unique ID based on the current datetime
    return new Date().toISOString(); // Example: "2023-10-05T14:48:00.000Z"
  };

  const handleSavePolygon = () => {
    if (polygon) {
      // Make the polygon non-editable
      polygon.setOptions({ editable: false });

      // Generate a unique ID for the polygon
      const id = generateId();

      // Save the polygon with a visibility flag and unique ID
      const newSavedPolygon: SavedPolygon = {
        id,
        polygon,
        visible: true, // Default to visible when saved
      };

      setSavedPolygons([...savedPolygons, newSavedPolygon]);
      setPolygon(null); // Clear the current polygon
      alert("Polygon saved!");
    } else {
      alert("No polygon to save!");
    }
  };

  const handleTogglePolygon = (id: string) => {
    setSavedPolygons((prev) =>
      prev.map((savedPolygon) => {
        if (savedPolygon.id === id) {
          const newVisibility = !savedPolygon.visible;
          savedPolygon.polygon.setMap(newVisibility ? map : null); // Toggle visibility
          return { ...savedPolygon, visible: newVisibility }; // Update visibility flag
        }
        return savedPolygon;
      })
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} id="map" style={{ width: "100%", height: "100vh" }}></div>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
        <button onClick={handleDrawPolygon} style={{ margin: "5px", padding: "10px" }}>
          Draw Polygon
        </button>
        <button onClick={handleSavePolygon} style={{ margin: "5px", padding: "10px" }}>
          Save Polygon
        </button>
      </div>
      <div style={{ position: "absolute", top: 80, left: 10, zIndex: 1000, backgroundColor: "white", padding: "10px", color: "#000" }}>
        <h3>Saved Polygons</h3>
        <ul>
          {savedPolygons.map((savedPolygon) => (
            <li key={savedPolygon.id} style={{ marginBottom: "10px" }}>
              <button onClick={() => handleTogglePolygon(savedPolygon.id)}>
                {savedPolygon.visible ? "Hide" : "Show"} Polygon {savedPolygon.id}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GoogleMap;
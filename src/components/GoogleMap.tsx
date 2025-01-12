import { useEffect, useRef, useState } from "react";

interface Props {
  center: google.maps.LatLngLiteral;
  zoom: number;
}

const GoogleMap = ({ center, zoom }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

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
          editable: true,
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

  const handleSavePolygon = () => {
    if (polygon) {
      const path = polygon.getPath();
      const coordinates = path.getArray().map((latLng) => ({
        lat: latLng.lat(),
        lng: latLng.lng(),
      }));

      console.log("Saved Polygon Coordinates:", coordinates);
      alert("Polygon saved! Check console for coordinates.");
    } else {
      alert("No polygon to save!");
    }
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
    </div>
  );
};

export default GoogleMap;
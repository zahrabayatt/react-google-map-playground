import { useEffect, useRef, useState } from "react";
import { GoogleMapsOverlay as DeckOverlay } from "@deck.gl/google-maps";
import { PolygonLayer, PathLayer, Layer, IconLayer } from "deck.gl";

interface Props {
  center: google.maps.LatLngLiteral;
  zoom: number;
}

export interface IGeometry {
  type?: string;
  coordinates?: number[] | number[][] | number[][][]; // Supports all shape types
}

enum ShapeType {
  POLYGON = "POLYGON",
  LINE = "LINE",
  POINT = "POINT",
  CIRCLE = "CIRCLE",
  RECTANGLE = "RECTANGLE",
}

interface Shape {
  id: string; // Unique ID based on datetime
  geometry: IGeometry; // The shape geometry data
  visible: boolean; // Visibility flag
  type: ShapeType; // Type of the shape
}

export interface IDeckLayer {
  layer: Layer; // The deck.gl layer
  visibleMinZoom?: number; // Minimum zoom level for visibility
  visibleMaxZoom?: number; // Maximum zoom level for visibility
}

const GoogleMap = ({ center, zoom }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingShape, setDrawingShape] = useState<
    | google.maps.Polygon
    | google.maps.Polyline
    | google.maps.Marker
    | google.maps.Circle
    | google.maps.Rectangle
    | null
  >(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [deckOverlay, setDeckOverlay] = useState<DeckOverlay | null>(null);
  const [deckLayers, setDeckLayers] = useState<IDeckLayer[]>([]); // Store deck.gl layers
  const [shapeType, setShapeType] = useState<ShapeType>(ShapeType.POLYGON); // Default shape type

  useEffect(() => {
    if (ref.current) {
      const mapInstance = new window.google.maps.Map(ref.current, {
        center,
        zoom,
      });
      setMap(mapInstance);

      // Initialize deck.gl overlay
      const overlay = new DeckOverlay({ layers: getVisibleLayers(zoom) });
      setDeckOverlay(overlay);
      overlay.setMap(mapInstance);
    }
  }, [center, zoom]);

  const handleDrawShape = () => {
    if (map) {
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: getDrawingMode(shapeType), // Set drawing mode based on selected shape type
        drawingControl: false,
        polygonOptions: {
          fillColor: "#FF0000",
          fillOpacity: 0.4,
          strokeWeight: 2,
          clickable: true,
          editable: true, // Allow editing while drawing
          draggable: false,
        },
        polylineOptions: {
          strokeColor: "#0000FF",
          strokeWeight: 2,
          editable: true,
        },
        circleOptions: {
          fillColor: "#00FF00",
          fillOpacity: 0.4,
          strokeWeight: 2,
          editable: true,
        },
        rectangleOptions: {
          fillColor: "#FFFF00",
          fillOpacity: 0.4,
          strokeWeight: 2,
          editable: true,
        },
        markerOptions: {
          draggable: true,
        },
      });

      drawingManager.setMap(map);

      google.maps.event.addListener(
        drawingManager,
        "overlaycomplete",
        (event: google.maps.drawing.OverlayCompleteEvent) => {
          // Stop drawing mode
          drawingManager.setDrawingMode(null);
          drawingManager.setMap(null);

          // Set the drawn shape based on the type
          switch (event.type) {
            case google.maps.drawing.OverlayType.POLYGON:
              setDrawingShape(event.overlay as google.maps.Polygon);
              break;
            case google.maps.drawing.OverlayType.POLYLINE:
              setDrawingShape(event.overlay as google.maps.Polyline);
              break;
            case google.maps.drawing.OverlayType.CIRCLE:
              setDrawingShape(event.overlay as google.maps.Circle);
              break;
            case google.maps.drawing.OverlayType.RECTANGLE:
              setDrawingShape(event.overlay as google.maps.Rectangle);
              break;
            case google.maps.drawing.OverlayType.MARKER:
              setDrawingShape(event.overlay as google.maps.Marker);
              break;
            default:
              break;
          }
        }
      );
    }
  };

  const generateId = (): string => {
    // Generate a unique ID based on the current datetime
    return new Date().toISOString(); // Example: "2023-10-05T14:48:00.000Z"
  };

  const handleSaveShape = () => {
    if (drawingShape) {
      // Generate a unique ID for the shape
      const id = generateId();

      // Extract the geometry data from the shape
      const geometry: IGeometry = {
        type: shapeType,
        coordinates: getShapePaths(drawingShape),
      };

      // Save the shape with a visibility flag and unique ID
      const newSavedShape: Shape = {
        id,
        geometry,
        visible: false, // Default to visible when saved
        type: shapeType,
      };
      drawingShape.setMap(null);
      setShapes((prev) => [...prev, newSavedShape]);
      setDrawingShape(null); // Clear the current shape
      alert("Shape saved!");
    } else {
      alert("No shape to save!");
    }
  };

  const handleToggleShape = (id: string) => {
    setShapes((prev) =>
      prev.map((shape) => {
        if (shape.id === id) {
          if (shape.visible) {
            // Remove the layer from deckLayers
            const newDeckLayers = deckLayers.filter(
              (deckLayer) => deckLayer.layer.id !== id
            );
            setDeckLayers(newDeckLayers);
          } else {
            // Create a new layer based on the shape type
            const newLayer = createLayerForShape(shape);
            if (newLayer) {
              const newDeckLayer: IDeckLayer = {
                layer: newLayer,
                visibleMinZoom: 5, // Example: visible only at zoom level 5 and above
                visibleMaxZoom: 15, // Example: visible only at zoom level 15 and below
              };
              setDeckLayers([...deckLayers, newDeckLayer]);
            }
          }

          return { ...shape, visible: !shape.visible };
        } else {
          return shape;
        }
      })
    );
  };

  // Create a deck.gl layer based on the shape type
  const createLayerForShape = (shape: Shape): Layer | null => {
    console.log(shape);
    switch (shape.type) {
      case ShapeType.POLYGON:
        return new PolygonLayer({
          id: shape.id,
          data: [shape.geometry.coordinates], // Wrap in an array
          getPolygon: (d) => d,
          filled: true,
          stroked: true,
          extruded: false,
          wireframe: true,
          getFillColor: [255, 0, 0, 100],
          getLineColor: [255, 0, 0],
          getLineWidth: 2,
        });
      case ShapeType.LINE:
        return new PathLayer({
          id: shape.id,
          data: [{ path: shape.geometry.coordinates }], // Wrap in an array
          getPath: (d) => d.path,
          getColor: [0, 0, 255, 200],
          getWidth: 2,
          widthMaxPixels: 2,
          widthMinPixels: 2,
        });
      case ShapeType.POINT:
        return new IconLayer({
          id: shape.id,
          data: [shape.geometry.coordinates], // Wrap in an array
          iconAtlas:
            "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png", // URL to your icon atlas
          iconMapping: {
            marker: { x: 128, y: 0, width: 128, height: 128, mask: true },
          }, // Map to the specific marker in the atlas
          getIcon: () => "marker", // Use the "marker" icon
          sizeScale: 1, // Scale of the marker
          getPosition: (d) => d, // Position of the marker
          getSize: 32, // Size of the marker
          getColor: [255, 0, 0, 255], // Marker color
        });
      case ShapeType.CIRCLE:
        // Approximate circle as a polygon
        return new PolygonLayer({
          id: shape.id,
          data: [shape.geometry.coordinates], // Wrap in an array
          getPolygon: (d) => d,
          filled: true,
          stroked: true,
          extruded: false,
          wireframe: true,
          getFillColor: [0, 255, 0, 100],
          getLineColor: [0, 255, 0],
          getLineWidth: 2,
        });
      case ShapeType.RECTANGLE:
        return new PolygonLayer({
          id: shape.id,
          data: [shape.geometry.coordinates], // Wrap in an array
          getPolygon: (d) => d,
          filled: true,
          stroked: true,
          extruded: false,
          wireframe: true,
          getFillColor: [255, 255, 0, 100],
          getLineColor: [255, 255, 0],
          getLineWidth: 2,
        });
      default:
        return null;
    }
  };

  // Convert Google Maps Shape to deck.gl-compatible format
  const getShapePaths = (
    shape:
      | google.maps.Polygon
      | google.maps.Polyline
      | google.maps.Marker
      | google.maps.Circle
      | google.maps.Rectangle
  ): number[] | number[][] | number[][][] => {
    if (shape instanceof google.maps.Polygon) {
      const paths = shape.getPaths();
      const coordinates: number[][][] = [];
      paths.forEach((path) => {
        const pathCoords = path
          .getArray()
          .map((latLng) => [latLng.lng(), latLng.lat()]);
        coordinates.push(pathCoords);
      });
      return coordinates;
    } else if (shape instanceof google.maps.Polyline) {
      const path = shape.getPath();
      return path.getArray().map((latLng) => [latLng.lng(), latLng.lat()]);
    } else if (shape instanceof google.maps.Marker) {
      const position = shape.getPosition();
      if (position) {
        return [position.lng(), position.lat()];
      }
    } else if (shape instanceof google.maps.Circle) {
      const center = shape.getCenter()!;
      const radius = shape.getRadius();
      // Approximate circle as a polygon (for simplicity)
      const coordinates: number[][] = [];
      const steps = 32;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        const lat = center.lat() + (radius / 111320) * Math.cos(angle); // Approximate conversion
        const lng =
          center.lng() +
          (radius / (111320 * Math.cos((center.lat() * Math.PI) / 180))) *
            Math.sin(angle);
        coordinates.push([lng, lat]);
      }
      return [coordinates];
    } else if (shape instanceof google.maps.Rectangle) {
      const bounds = shape.getBounds()!;
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      return [
        [
          [sw.lng(), sw.lat()],
          [ne.lng(), sw.lat()],
          [ne.lng(), ne.lat()],
          [sw.lng(), ne.lat()],
          [sw.lng(), sw.lat()],
        ],
      ];
    }
    return [];
  };

  // Filter layers based on zoom level
  const getVisibleLayers = (zoom?: number): Layer[] => {
    if (!zoom) {
      return [];
    }

    return deckLayers
      .filter(
        (deckLayer) =>
          (!deckLayer.visibleMinZoom || zoom >= deckLayer.visibleMinZoom) &&
          (!deckLayer.visibleMaxZoom || zoom <= deckLayer.visibleMaxZoom)
      )
      .map((deckLayer) => deckLayer.layer);
  };

  // Update deck.gl overlay when deckLayers or zoom changes
  useEffect(() => {
    if (deckOverlay && map) {
      const visibleLayers = getVisibleLayers(map.getZoom());
      deckOverlay.setProps({
        layers: visibleLayers,
      });
    }
  }, [deckLayers, deckOverlay, map]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} id="map" style={{ width: "100%", height: "100vh" }}></div>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
        <select
          value={shapeType}
          onChange={(e) => setShapeType(e.target.value as ShapeType)}
          style={{ margin: "5px", padding: "10px" }}
        >
          <option value={ShapeType.POLYGON}>Polygon</option>
          <option value={ShapeType.LINE}>Line</option>
          <option value={ShapeType.POINT}>Point</option>
          <option value={ShapeType.CIRCLE}>Circle</option>
          <option value={ShapeType.RECTANGLE}>Rectangle</option>
        </select>
        <button
          onClick={handleDrawShape}
          style={{ margin: "5px", padding: "10px" }}
        >
          Draw Shape
        </button>
        <button
          onClick={handleSaveShape}
          style={{ margin: "5px", padding: "10px" }}
        >
          Save Shape
        </button>
      </div>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 10,
          zIndex: 1000,
          backgroundColor: "white",
          padding: "10px",
          color: "#000",
        }}
      >
        <h3>Saved Shapes</h3>
        <ul>
          {shapes.map((shape) => (
            <li key={shape.id} style={{ marginBottom: "10px" }}>
              <button onClick={() => handleToggleShape(shape.id)}>
                {shape.visible ? "Hide" : "Show"} {getShapeTitle(shape)} Shape{" "}
                {shape.id}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GoogleMap;

const getShapeTitle = (shape: Shape): string => {
  switch (shape.type) {
    case ShapeType.POLYGON:
      return "Polygon";
    case ShapeType.LINE:
      return "Line";
    case ShapeType.POINT:
      return "Point";
    case ShapeType.CIRCLE:
      return "Circle";
    case ShapeType.RECTANGLE:
      return "Rectangle";
    default:
      return "Shape";
  }
};

// Get the drawing mode based on the selected shape type
const getDrawingMode = (
  shapeType: ShapeType
): google.maps.drawing.OverlayType | null => {
  switch (shapeType) {
    case ShapeType.POLYGON:
      return google.maps.drawing.OverlayType.POLYGON;
    case ShapeType.LINE:
      return google.maps.drawing.OverlayType.POLYLINE;
    case ShapeType.CIRCLE:
      return google.maps.drawing.OverlayType.CIRCLE;
    case ShapeType.RECTANGLE:
      return google.maps.drawing.OverlayType.RECTANGLE;
    case ShapeType.POINT:
      return google.maps.drawing.OverlayType.MARKER;
    default:
      return null;
  }
};

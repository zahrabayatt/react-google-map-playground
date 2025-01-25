// GoogleMap.tsx
import { forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import { DrawingShapeType, DrawingStateType } from "../App";

interface GoogleMapProps {
  zoom: number;
  center: google.maps.LatLngLiteral;
  drawingState: DrawingStateType;
  onExitDrawing: () => void;
  shapeType: DrawingShapeType;
}

export interface GoogleMapHandle {
  getCurrentPath: () => google.maps.LatLngLiteral[];
  clearDrawing: () => void;
}

const GoogleMap = forwardRef<GoogleMapHandle, GoogleMapProps>(
  ({ zoom, center, drawingState, onExitDrawing, shapeType }, ref) => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const googleMap = useRef<google.maps.Map | null>(null);
    const pathRef = useRef<google.maps.MVCArray<google.maps.LatLng> | null>(
      null
    );
    const shapeRef = useRef<google.maps.Polyline | google.maps.Polygon | null>(null);
    const temporaryLineRef = useRef<google.maps.Polyline | null>(null);
    const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
    const mouseMoveListenerRef = useRef<google.maps.MapsEventListener | null>(
      null
    );
    const contextMenuListenerRef = useRef<google.maps.MapsEventListener | null>(
      null
    );

    useImperativeHandle(ref, () => ({
      getCurrentPath: () => {
        if (!pathRef.current) return [];
        return pathRef.current.getArray().map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
      },
      clearDrawing: () => {
        shapeRef.current?.setMap(null);
        shapeRef.current = null;
        pathRef.current = null;
        temporaryLineRef.current?.setMap(null);
        temporaryLineRef.current = null;
      }
    }));

    useEffect(() => {
      if (mapRef.current && !googleMap.current) {
        googleMap.current = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          draggable: drawingState !== "drawing",
        });
      }
    }, [center, zoom]);

    useEffect(() => {
      if (!googleMap.current) return;

      if (drawingState === "drawing") {
        const path = new google.maps.MVCArray<google.maps.LatLng>();
        pathRef.current = path;

        // Clear previous drawing
        if (shapeRef.current) {
          shapeRef.current.setMap(null);
          shapeRef.current = null;
        }

        googleMap.current.setOptions({
          draggableCursor: "crosshair",
          draggable: false,
          disableDoubleClickZoom: true,
          gestureHandling: "none",
          clickableIcons: false,
          zoomControl: false,
        });

        // Create appropriate shape
        if (shapeType === "polyline") {
          shapeRef.current = new google.maps.Polyline({
            map: googleMap.current,
            path: path,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
            zIndex: 1000
          });
        } else {
          shapeRef.current = new google.maps.Polygon({
            map: googleMap.current,
            paths: [path],
            strokeColor: "#FF0000",
            fillColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillOpacity: 0.35,
            zIndex: 1000,
            editable: false,
            clickable: false
          });
        }

        const temporaryLine = new google.maps.Polyline({
          map: googleMap.current,
          strokeColor: "#4285F4",
          strokeOpacity: 0,
          strokeWeight: 2,
          zIndex: 1001,
          clickable: false,
          icons: [
            {
              icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 2 },
              offset: "0",
              repeat: "10px",
            },
          ],
        });
        temporaryLineRef.current = temporaryLine;

        clickListenerRef.current = googleMap.current.addListener(
          "click",
          (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              path.push(event.latLng);
              temporaryLine.setPath([event.latLng]);
            }
          }
        );

        contextMenuListenerRef.current = googleMap.current.addListener(
          "contextmenu",
          (event: google.maps.MapMouseEvent) => {
            event.domEvent.preventDefault(); // Block context menu
            temporaryLine.setMap(null);
            onExitDrawing();
          }
        );

        mouseMoveListenerRef.current = googleMap.current.addListener(
          "mousemove",
          (event: google.maps.MapMouseEvent) => {
            event.domEvent.preventDefault();

            if (!pathRef.current?.getLength()) return;


            if (shapeType === "polygon") {
              // For polygons: Connect first point to cursor
              if (event.latLng) {
                path.setAt(pathRef.current.getLength() - 1, event.latLng);
                shapeRef.current?.setPath(path);
              }


            } else {
              // For polylines: Connect last point to cursor
              const lastPoint = pathRef.current.getAt(pathRef.current.getLength() - 1);

              if (lastPoint && event.latLng) {
                temporaryLine.setPath([lastPoint, event.latLng]);
              }
            }
          }
        );
      } else {
        temporaryLineRef.current?.setMap(null);
        temporaryLineRef.current = null;

        if (clickListenerRef.current)
          google.maps.event.removeListener(clickListenerRef.current);
        if (mouseMoveListenerRef.current)
          google.maps.event.removeListener(mouseMoveListenerRef.current);
        if (contextMenuListenerRef.current)
          google.maps.event.removeListener(contextMenuListenerRef.current);

        googleMap.current.setOptions({
          draggableCursor: null,
          draggable: true,
          disableDoubleClickZoom: false,
          gestureHandling: "auto",
          clickableIcons: true,
          zoomControl: true,
        });
      }
    }, [drawingState]);

    return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
  }
);

export default GoogleMap;

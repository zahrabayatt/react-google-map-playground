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
    const shapeRef = useRef<google.maps.Polyline | google.maps.Polygon | google.maps.Rectangle | google.maps.Circle | google.maps.Marker | null>(null);
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
        if (shapeType === "point") {
          shapeRef.current = new google.maps.Marker({
            map: googleMap.current,
            position: null,
            icon: {
              path: "M12 0c-4.418 0-8 3.582-8 8 0 8 8 16 8 16s8-8 8-16c0-4.418-3.582-8-8-8zm0 4c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4z",
              fillColor: "#4285F4", // Google blue
              fillOpacity: 1,
              strokeColor: "#FFFFFF", // White border
              strokeWeight: 2,
              scale: 2, // Adjust size as needed
              anchor: new google.maps.Point(12, 24) // Proper pin anchor point
            },
            zIndex: 1000
          });
        } else if (shapeType === "polyline") {
          shapeRef.current = new google.maps.Polyline({
            map: googleMap.current,
            path: path,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
            zIndex: 1000
          });
        } else if (shapeType === "polygon") {
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
        } else if (shapeType === "rectangle") {
          shapeRef.current = new google.maps.Rectangle({
            map: googleMap.current,
            bounds: new google.maps.LatLngBounds(),
            strokeColor: "#FF0000",
            fillColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillOpacity: 0.35,
            zIndex: 1000,
            editable: false,
            clickable: false
          });
        } else if (shapeType === "circle") {
          shapeRef.current = new google.maps.Circle({
            map: googleMap.current,
            radius: 0,
            strokeColor: "#FF0000",
            fillColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillOpacity: 0.35,
            zIndex: 1000,
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
            if (!event.latLng) return;

            if (shapeType === "point") {
              // Clear previous point
              path.clear();
              path.push(event.latLng);

              // Update marker position
              (shapeRef.current as google.maps.Marker).setPosition(event.latLng);
              onExitDrawing(); // Auto-complete after single click

            } else if (shapeType === "circle") {
              if (path.getLength() === 0) {
                // First click - set center only
                path.push(event.latLng);
                (shapeRef.current as google.maps.Circle).setCenter(event.latLng);
                temporaryLineRef.current?.setPath([event.latLng]);
              }
              else {
                if (!event.latLng) return;

                // Complete the circle
                path.push(event.latLng);
                (shapeRef.current as google.maps.Circle).setRadius(
                  google.maps.geometry.spherical.computeDistanceBetween(
                    path.getAt(0),
                    event.latLng
                  )
                );
                temporaryLine.setMap(null);
                onExitDrawing();
              }
            } else if (shapeType === "rectangle") {
              path.push(event.latLng);
              temporaryLine.setMap(null);
              if (path.getLength() === 2) {
                onExitDrawing();
              }
            } else {
              path.push(event.latLng);
              temporaryLine.setPath([event.latLng]);
            }
          }

        );

        contextMenuListenerRef.current = googleMap.current.addListener(
          "contextmenu",
          (event: google.maps.MapMouseEvent) => {
            event.domEvent.preventDefault(); // Block context menu
            if (shapeType === "circle" && path.getLength() === 1 && event.latLng) {
              // Complete the circle
              path.push(event.latLng);
              (shapeRef.current as google.maps.Circle).setRadius(
                google.maps.geometry.spherical.computeDistanceBetween(
                  path.getAt(0),
                  event.latLng
                )
              );
            }
            temporaryLine.setMap(null);
            onExitDrawing();
          }
        );

        mouseMoveListenerRef.current = googleMap.current.addListener(
          "mousemove",
          (event: google.maps.MapMouseEvent) => {
            event.domEvent.preventDefault();

            if (!pathRef.current?.getLength()) return;

            switch (shapeType) {
              case "polygon":
                if (event.latLng) {
                  path.setAt(path.getLength() - 1, event.latLng);
                  (shapeRef.current as google.maps.Polygon).setPath(path);
                }
                break;
              case "rectangle":
                if (path.getLength() === 1 && event.latLng) {
                  const firstPoint = path.getAt(0);
                  const sw = new google.maps.LatLng(
                    Math.min(firstPoint.lat(), event.latLng.lat()),
                    Math.min(firstPoint.lng(), event.latLng.lng())
                  );
                  const ne = new google.maps.LatLng(
                    Math.max(firstPoint.lat(), event.latLng.lat()),
                    Math.max(firstPoint.lng(), event.latLng.lng())
                  );
                  const bounds = new google.maps.LatLngBounds(sw, ne);
                  (shapeRef.current as google.maps.Rectangle).setBounds(bounds);
                }
                break;
              case "circle": {
                if (path.getLength() === 1) { // Only when center is set
                  const center = path.getAt(0);
                  if (center && event.latLng) {
                    temporaryLineRef.current?.setPath([center, event.latLng]);

                    // Update circle radius
                    const radius = google.maps.geometry.spherical.computeDistanceBetween(
                      center,
                      event.latLng
                    );
                    (shapeRef.current as google.maps.Circle).setRadius(radius);
                  }
                }
                break;
              }
              case "point":
                break
              default: {
                const lastPoint = path.getAt(path.getLength() - 1);
                if (lastPoint && event.latLng) {
                  temporaryLine.setPath([lastPoint, event.latLng]);
                }
              }
            }
          }
        );
      } else {
        temporaryLineRef.current?.setMap(null);
        temporaryLineRef.current = null;

        [clickListenerRef, mouseMoveListenerRef, contextMenuListenerRef].forEach(listenerRef => {
          if (listenerRef.current) google.maps.event.removeListener(listenerRef.current);
        });

        googleMap.current.setOptions({
          draggableCursor: null,
          draggable: true,
          disableDoubleClickZoom: false,
          gestureHandling: "auto",
          clickableIcons: true,
          zoomControl: true,
        });
      }
    }, [drawingState, onExitDrawing, shapeType]);

    return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
  }
);

export default GoogleMap;

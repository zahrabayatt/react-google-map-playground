import { useEffect, useRef, useState } from "react";
import {
    DrawingHandlers,
    DrawingShape,
    DrawingState,
} from "../../types/Drawing";

const useDrawingManager = (
    map: google.maps.Map | null,
    shape: DrawingShape,
    handlers: DrawingHandlers
) => {
    const [drawingState, setDrawingState] = useState<DrawingState>("idle");
    const pathRef = useRef<google.maps.MVCArray<google.maps.LatLng>>();
    const shapeRef = useRef<google.maps.Polyline | google.maps.Polygon | google.maps.Rectangle | google.maps.Circle | google.maps.Marker | null>();
    const tempLineRef = useRef<google.maps.Polyline>();

    const temporaryLineRef = useRef<google.maps.Polyline | null>(null);
    const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
    const mouseMoveListenerRef = useRef<google.maps.MapsEventListener | null>(null);
    const contextMenuListenerRef = useRef<google.maps.MapsEventListener | null>(null);

    // Cleanup function
    const cleanup = () => {
        pathRef.current?.clear();
        shapeRef.current?.setMap(null);
        tempLineRef.current?.setMap(null);
    };

    // Initialize drawing session
    const startDrawing = () => {
        cleanup();
        setDrawingState("drawing");
        handlers.onDrawingStart?.();
    };

    // Save current drawing
    const saveDrawing = () => {
        if (pathRef.current?.getArray().length) {
            const path = pathRef.current.getArray().map((latLng) => ({
                lat: latLng.lat(),
                lng: latLng.lng(),
            }));
            handlers.onDrawingSave?.({ path, shape });
        }
        cleanup();
        setDrawingState("idle");
    };

    // Drawing logic implementation...
    // (Move the drawing implementation details here)
    useEffect(() => {
        if (!map) return;

        if (drawingState === "drawing") {
            const path = new google.maps.MVCArray<google.maps.LatLng>();
            pathRef.current = path;

            // Clear previous drawing
            if (shapeRef.current) {
                shapeRef.current.setMap(null);
                shapeRef.current = null;
            }

            map.setOptions({
                draggableCursor: "crosshair",
                draggable: false,
                disableDoubleClickZoom: true,
                gestureHandling: "none",
                clickableIcons: false,
                zoomControl: false,
            });

            // Create appropriate shape
            if (shape === "point") {
                shapeRef.current = new google.maps.Marker({
                    map: map,
                    position: null,
                    icon: {
                        path: "M12 0c-4.418 0-8 3.582-8 8 0 8 8 16 8 16s8-8 8-16c0-4.418-3.582-8-8-8zm0 4c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4z",
                        fillColor: "#4285F4", // Google blue
                        fillOpacity: 1,
                        strokeColor: "#FFFFFF", // White border
                        strokeWeight: 2,
                        scale: 2, // Adjust size as needed
                        anchor: new google.maps.Point(12, 24), // Proper pin anchor point
                    },
                    zIndex: 1000,
                });
            } else if (shape === "polyline") {
                shapeRef.current = new google.maps.Polyline({
                    map: map,
                    path: path,
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    zIndex: 1000,
                });
            } else if (shape === "polygon") {
                shapeRef.current = new google.maps.Polygon({
                    map: map,
                    paths: [path],
                    strokeColor: "#FF0000",
                    fillColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillOpacity: 0.35,
                    zIndex: 1000,
                    editable: false,
                    clickable: false,
                });
            } else if (shape === "rectangle") {
                shapeRef.current = new google.maps.Rectangle({
                    map: map,
                    bounds: new google.maps.LatLngBounds(),
                    strokeColor: "#FF0000",
                    fillColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillOpacity: 0.35,
                    zIndex: 1000,
                    editable: false,
                    clickable: false,
                });
            } else if (shape === "circle") {
                shapeRef.current = new google.maps.Circle({
                    map: map,
                    radius: 0,
                    strokeColor: "#FF0000",
                    fillColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillOpacity: 0.35,
                    zIndex: 1000,
                    clickable: false,
                });
            }

            const temporaryLine = new google.maps.Polyline({
                map: map,
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

            clickListenerRef.current = map.addListener(
                "click",
                (event: google.maps.MapMouseEvent) => {
                    if (!event.latLng) return;

                    if (shape === "point") {
                        // Clear previous point
                        path.clear();
                        path.push(event.latLng);

                        // Update marker position
                        (shapeRef.current as google.maps.Marker).setPosition(event.latLng);
                        setDrawingState("complete")// Auto-complete after single click
                    } else if (shape === "circle") {
                        if (path.getLength() === 0) {
                            // First click - set center only
                            path.push(event.latLng);
                            (shapeRef.current as google.maps.Circle).setCenter(event.latLng);
                            temporaryLineRef.current?.setPath([event.latLng]);
                        } else {
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
                            setDrawingState("complete")
                        }
                    } else if (shape === "rectangle") {
                        path.push(event.latLng);
                        temporaryLine.setMap(null);
                        if (path.getLength() === 2) {
                            setDrawingState("complete")
                        }
                    } else {
                        path.push(event.latLng);
                        temporaryLine.setPath([event.latLng]);
                    }
                }
            );

            contextMenuListenerRef.current = map.addListener(
                "contextmenu",
                (event: google.maps.MapMouseEvent) => {
                    event.domEvent.preventDefault(); // Block context menu
                    if (
                        shape === "circle" &&
                        path.getLength() === 1 &&
                        event.latLng
                    ) {
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
                    setDrawingState("complete")
                }
            );

            mouseMoveListenerRef.current = map.addListener(
                "mousemove",
                (event: google.maps.MapMouseEvent) => {
                    event.domEvent.preventDefault();

                    if (!pathRef.current?.getLength()) return;

                    switch (shape) {
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
                            if (path.getLength() === 1) {
                                // Only when center is set
                                const center = path.getAt(0);
                                if (center && event.latLng) {
                                    temporaryLineRef.current?.setPath([center, event.latLng]);

                                    // Update circle radius
                                    const radius =
                                        google.maps.geometry.spherical.computeDistanceBetween(
                                            center,
                                            event.latLng
                                        );
                                    (shapeRef.current as google.maps.Circle).setRadius(radius);
                                }
                            }
                            break;
                        }
                        case "point":
                            break;
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

            [clickListenerRef, mouseMoveListenerRef, contextMenuListenerRef].forEach(
                (listenerRef) => {
                    if (listenerRef.current)
                        google.maps.event.removeListener(listenerRef.current);
                }
            );

            map.setOptions({
                draggableCursor: null,
                draggable: true,
                disableDoubleClickZoom: false,
                gestureHandling: "auto",
                clickableIcons: true,
                zoomControl: true,
            });
        }
    }, [drawingState, map, shape]);

    return {
        drawingState,
        startDrawing,
        saveDrawing,
        clearDrawing: () => {
            cleanup()
            setDrawingState("idle");
        },
    };
};

export default useDrawingManager;

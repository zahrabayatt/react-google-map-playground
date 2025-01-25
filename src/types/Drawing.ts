export type DrawingState = "idle" | "drawing" | "complete";
export type DrawingShape = "polyline" | "polygon" | "rectangle" | "circle" | "point";

export interface DrawingEvent {
    path: google.maps.LatLngLiteral[];
    shape: DrawingShape;
}

export interface DrawingHandlers {
    onDrawingStart?: () => void;
    onDrawingChange?: (event: DrawingEvent) => void;
    onDrawingComplete?: (event: DrawingEvent) => void;
    onDrawingSave?: (event: DrawingEvent) => void;
}
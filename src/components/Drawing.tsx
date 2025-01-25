import { useState } from "react";

import DrawingControls from "./DrawingControls";
import { DrawingEvent, DrawingHandlers, DrawingShape } from "../types/Drawing";
import useDrawingManager from "../hooks/drawing/useDrawingManger";
import ShapeSelector from "./ShapeSelector";

interface DrawingProps {
    map: google.maps.Map | null;
    onDrawingComplete: (event: DrawingEvent) => void;
}

const Drawing = ({ map, onDrawingComplete }: DrawingProps) => {
    const [selectedShape, setSelectedShape] = useState<DrawingShape>("polyline");

    const drawingHandlers: DrawingHandlers = {
        onDrawingComplete,
        // Add other handlers as needed
    };

    const { drawingState, startDrawing, saveDrawing, clearDrawing } =
        useDrawingManager(map, selectedShape, drawingHandlers);

    return (
        <div className="drawing-container">
            <ShapeSelector
                selectedShape={selectedShape}
                drawingState={drawingState}
                onShapeChange={setSelectedShape}
            />

            <DrawingControls
                drawingState={drawingState}
                onStart={startDrawing}
                onClear={clearDrawing}
                onSave={saveDrawing}
            />
        </div>
    );
};

export default Drawing;
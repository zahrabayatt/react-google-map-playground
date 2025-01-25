import { DrawingShape, DrawingState } from "../types/Drawing";


interface ControlsProps {
    selectedShape: DrawingShape;
    drawingState: DrawingState;
    onShapeChange: (shape: DrawingShape) => void;
    onStart: () => void;
    onClear: () => void;
    onSave: () => void;
}

const DrawingControls = ({
    selectedShape,
    drawingState,
    onShapeChange,
    onStart,
    onClear,
    onSave
}: ControlsProps) => {
    return (
        <div className="controls">
            <select
                value={selectedShape}
                onChange={(e) => onShapeChange(e.target.value as DrawingShape)}
                disabled={drawingState !== "idle"}
            >
                <option value="polyline">Polyline</option>
                <option value="polygon">Polygon</option>
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="point">Point</option>
            </select>

            <button onClick={onStart} disabled={drawingState !== "idle"}>
                Start Drawing
            </button>

            <button onClick={onClear} disabled={drawingState === "idle"}>
                Clear Drawing
            </button>

            <button onClick={onSave} disabled={drawingState === "idle"}>
                Save Drawing
            </button>
        </div>
    )
}

export default DrawingControls
import { DrawingShape, DrawingState } from "../types/Drawing";

interface ShapeSelectorProps {
    selectedShape: DrawingShape;
    drawingState: DrawingState;
    onShapeChange: (shape: DrawingShape) => void;
}

const ShapeSelector = ({
    selectedShape,
    drawingState,
    onShapeChange,
}: ShapeSelectorProps) => (
    <select
        className="shape-selector"
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
);

export default ShapeSelector;
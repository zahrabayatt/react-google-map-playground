import { DrawingState } from "../types/Drawing";

interface ControlsProps {
    drawingState: DrawingState;
    onStart: () => void;
    onClear: () => void;
    onSave: () => void;
}

const DrawingControls = ({
    drawingState,
    onStart,
    onClear,
    onSave,
}: ControlsProps) => {
    return (
        <div className="controls">
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
    );
};

export default DrawingControls;
import React from "react";

interface ControlButtonsProps {
  onPan: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ControlButtons = ({
  onPan,
  onZoomIn,
  onZoomOut,
}: ControlButtonsProps) => {
  return (
    <div style={{ marginTop: "20px" }}>
      <button onClick={onPan}>Pan to San Francisco</button>
      <button onClick={onZoomIn}>Zoom In</button>
      <button onClick={onZoomOut}>Zoom Out</button>
    </div>
  );
};

export default React.memo(ControlButtons);

interface PanToButtonProps {
  onClick: () => void;
}

const PanToButton = ({ onClick }: PanToButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        bottom: "40px",
        left: "10px",
        zIndex: 10,
      }}
    >
      Pan to Uluru
    </button>
  );
};

export default PanToButton;

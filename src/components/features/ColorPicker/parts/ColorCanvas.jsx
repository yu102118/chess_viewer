/**
 * Horizontal canvas that the parent draws the color picker gradient onto.
 * @param {Object} props
 * @param {React.RefObject<HTMLCanvasElement>} props.canvasRef - Ref attached to the canvas element
 * @param {Function} props.onClick - Called when the user clicks to pick a color
 * @returns {JSX.Element}
 */
const ColorCanvas = ({ canvasRef, onClick }) => {
  return (
    <div className="relative group">
      <canvas
        ref={canvasRef}
        width={280}
        height={160}
        onClick={onClick}
        className="w-full rounded-lg cursor-crosshair border-2 border-gray-700/50 hover:border-blue-500/50 transition-all shadow-lg"
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white font-semibold">
          Click to pick
        </div>
      </div>
    </div>
  );
};

export default ColorCanvas;

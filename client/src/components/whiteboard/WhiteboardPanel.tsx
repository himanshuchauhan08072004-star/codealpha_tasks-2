import { useEffect, useRef, useState } from "react";
import { getSocket } from "../../services/socket";
import { WhiteboardOp } from "../../types";

interface Props {
  initialOps: WhiteboardOp[];
  onClose: () => void;
}

const COLORS = ["#ffffff", "#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];

const WhiteboardPanel = ({ initialOps, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  const drawStroke = (op: WhiteboardOp) => {
    const ctx = ctxRef.current;
    if (!ctx || op.points.length < 1) return;
    ctx.strokeStyle = op.tool === "eraser" ? "#0f1115" : op.color;
    ctx.lineWidth = op.tool === "eraser" ? op.size * 4 : op.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(op.points[0].x, op.points[0].y);
    op.points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement!;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f1115";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctxRef.current = ctx;
      initialOps.forEach(drawStroke);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleDraw = (op: WhiteboardOp) => drawStroke(op);
    const handleClear = () => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        ctx.fillStyle = "#0f1115";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    socket.on("whiteboard:draw", handleDraw);
    socket.on("whiteboard:clear", handleClear);
    return () => {
      socket.off("whiteboard:draw", handleDraw);
      socket.off("whiteboard:clear", handleClear);
    };
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    currentStrokeRef.current = [getPos(e)];
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const pos = getPos(e);
    currentStrokeRef.current.push(pos);
    const op: WhiteboardOp = {
      type: "stroke",
      points: currentStrokeRef.current.slice(-2),
      color,
      size,
      tool,
    };
    drawStroke(op);
  };

  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (currentStrokeRef.current.length > 1) {
      const op: WhiteboardOp = { type: "stroke", points: currentStrokeRef.current, color, size, tool };
      getSocket().emit("whiteboard:draw", op);
    }
    currentStrokeRef.current = [];
  };

  const clearBoard = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.fillStyle = "#0f1115";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    getSocket().emit("whiteboard:clear");
  };

  return (
    <div className="absolute inset-0 bg-surface flex flex-col z-10">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool("pen")}
            className={`px-2 py-1 rounded text-sm ${tool === "pen" ? "bg-accent text-white" : "bg-white/10 text-gray-300"}`}
          >
            ✏️ Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`px-2 py-1 rounded text-sm ${tool === "eraser" ? "bg-accent text-white" : "bg-white/10 text-gray-300"}`}
          >
            🧹 Eraser
          </button>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
              style={{ background: c }}
            />
          ))}
          <input
            type="range"
            min={1}
            max={12}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
          <button onClick={clearBoard} className="px-2 py-1 rounded text-sm bg-white/10 text-gray-300">
            Clear
          </button>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕ Close</button>
      </div>
      <div className="flex-1">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="w-full h-full touch-none cursor-crosshair"
        />
      </div>
    </div>
  );
};

export default WhiteboardPanel;

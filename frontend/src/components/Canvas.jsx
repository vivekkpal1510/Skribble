import { useEffect, useRef, useState } from "react";
import Options from "./Options";

export default function Canvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);
  const coordinates = useRef([]);
  const width = useRef(0);
  const height = useRef(0);
  const [clear, setClear] = useState(false);
  const [undo, setUndo] = useState(false);
  const [erase, setErase] = useState(false);
  const [fill, setFill] = useState(false);
  const [color, setColor] = useState("#000000")

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    let { width: canvasWidth, height: canvasHeight } =
      window.getComputedStyle(canvas);
    canvasWidth = parseFloat(canvasWidth);
    canvasHeight = parseFloat(canvasHeight);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    width.current = canvasWidth;
    height.current = canvasHeight;
    redraw();
  };

  const redraw = () => {
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, width.current, height.current);
    for (const path of coordinates.current) {
      ctx.beginPath();
      ctx.moveTo(path[0][0] * width.current, path[0][1] * height.current);
      for (let i = 1; i < path.length; i++) {
        const [x, y] = path[i];
        ctx.lineTo(x * width.current, y * height.current);
      }
      ctx.strokeStyle = "red";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.closePath();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (clear) {
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, width.current, height.current);
      coordinates.current = [];
      setClear(false);
    }
    if (undo) {
      coordinates.current.pop();
      redraw();
      setUndo(false);
    }
  }, [clear, undo]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (fill) {
      setFill(false);
      fillColor(Math.floor(offsetX), Math.floor(offsetY), color);
      return;
    }
    isDrawing.current = true;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    if (!erase) {
      coordinates.current.push([
        [offsetX / width.current, offsetY / height.current],
      ]);
    }
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;

    if (erase) {
      ctx.clearRect(offsetX - 5, offsetY - 5, 10, 10);
    } else {
      ctx.lineTo(offsetX, offsetY);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
      const lastPath = coordinates.current[coordinates.current.length - 1];
      lastPath.push([offsetX / width.current, offsetY / height.current]);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    ctxRef.current.closePath();
  };

  const fillColor = (startX, startY, fillColor) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const startIndex = (startY * canvas.width + startX) * 4;
    const startColor = {
      r: data[startIndex],
      g: data[startIndex + 1],
      b: data[startIndex + 2],
      a: data[startIndex + 3],
    };
    const targetColor = {
      r: parseInt(fillColor.slice(1, 3), 16),
      g: parseInt(fillColor.slice(3, 5), 16),
      b: parseInt(fillColor.slice(5, 7), 16),
      a: 255,
    };
    if (
      startColor.r === targetColor.r &&
      startColor.g === targetColor.g &&
      startColor.b === targetColor.b &&
      startColor.a === targetColor.a
    ) {
      return;
    }
    const stack = [[startX, startY]];
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const index = (y * canvas.width + x) * 4;

      if (
        data[index] === startColor.r &&
        data[index + 1] === startColor.g &&
        data[index + 2] === startColor.b &&
        data[index + 3] === startColor.a
      ) {
        data[index] = targetColor.r;
        data[index + 1] = targetColor.g;
        data[index + 2] = targetColor.b;
        data[index + 3] = targetColor.a;

        if (x > 0) stack.push([x - 1, y]);
        if (x < canvas.width - 1) stack.push([x + 1, y]);
        if (y > 0) stack.push([x, y - 1]);
        if (y < canvas.height - 1) stack.push([x, y + 1]);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        onPointerLeave={stopDrawing}
      ></canvas>
      <Options
        setClear={setClear}
        setUndo={setUndo}
        setErase={setErase}
        setFill={setFill}
        setColor={setColor}
      />
    </>
  );
}

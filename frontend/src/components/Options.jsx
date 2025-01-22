export default function Options({
  setClear,
  setUndo,
  setErase,
  setFill,
  setColor,
}) {
  return (
    <div className="options">
      <button onClick={() => setClear(true)}>Clear</button>
      <button onClick={() => setErase((prev) => !prev)}>Erase</button>
      <button onClick={() => setUndo(true)}>Undo</button>
      <button onClick={() => setFill(true)}>Fill</button>
      <input
        type="color"
        onInput={(e) => {
          setColor(e.target.value);
        }}
      />
    </div>
  );
}

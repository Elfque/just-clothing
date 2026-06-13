function Slider({ label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <span style={{ fontSize: 11, color: "#6b6575" }}>{label}</span>
        <span style={{ fontSize: 11, color: "#c2bdb4", fontWeight: 500 }}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-brand-gold"
      />
    </div>
  );
}

export default Slider;

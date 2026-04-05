export default function StepsBar({ steps, current }) {
  return (
    <div className="steps-bar">
      {steps.map((label, i) => {
        const num = i + 1;
        const status =
          num < current ? "completed" : num === current ? "active" : "";
        return (
          <div key={i} className={`step ${status}`}>
            <div className="step-num">{num < current ? "✓" : num}</div>
            <span className="step-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Minimal dependency-free bar chart. Kept generic ({label,value,color}[]) so the
// stats page can render new breakdowns later without pulling in a chart library.

export interface Bar {
  label: string
  value: number
  color?: string
}

export default function BarChart({
  bars,
  height = 120,
}: {
  bars: Bar[]
  height?: number
}) {
  const max = Math.max(1, ...bars.map((b) => b.value))
  return (
    <div className="bar-chart" style={{ height }}>
      {bars.map((b, i) => (
        <div className="bar-col" key={i}>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                height: `${(b.value / max) * 100}%`,
                background: b.color,
              }}
            >
              {b.value > 0 && <span className="bar-value">{b.value}</span>}
            </div>
          </div>
          <span className="bar-label">{b.label}</span>
        </div>
      ))}
    </div>
  )
}

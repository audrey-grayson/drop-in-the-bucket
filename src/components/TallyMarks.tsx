// Classic 5-bar gate tally: four uprights struck through by a diagonal fifth.
// Rendered as inline SVG groups so it scales crisply on mobile.

function TallyGroup({ count }: { count: number }) {
  // count is 1..5
  const strokes = []
  for (let i = 0; i < Math.min(count, 4); i++) {
    const x = 3 + i * 6
    strokes.push(<line key={i} x1={x} y1="2" x2={x} y2="22" />)
  }
  if (count === 5) {
    strokes.push(<line key="slash" x1="0" y1="20" x2="24" y2="4" />)
  }
  return (
    <svg
      className="tally-group"
      width="26"
      height="24"
      viewBox="0 0 26 24"
      role="img"
      aria-hidden="true"
    >
      {strokes}
    </svg>
  )
}

export default function TallyMarks({ count }: { count: number }) {
  if (count <= 0) {
    return <span className="tally-empty">no drops yet</span>
  }
  const groups: number[] = []
  let remaining = count
  while (remaining > 0) {
    groups.push(Math.min(remaining, 5))
    remaining -= 5
  }
  return (
    <span className="tally" aria-label={`${count} drops this week`}>
      {groups.map((c, i) => (
        <TallyGroup key={i} count={c} />
      ))}
      <span className="tally-count">{count}</span>
    </span>
  )
}

import { useEffect, useState } from 'react'

export interface FallingDrop {
  id: string
  /** Viewport x of the bucket centre, px. */
  x: number
  /** Viewport y of the bucket rim (where the drop lands), px. */
  targetY: number
}

// A single droplet animated from the top of the screen down into a bucket.
// Position is `fixed` so it overlays everything regardless of scroll.
export default function Droplet({
  drop,
  onLand,
}: {
  drop: FallingDrop
  onLand: (id: string) => void
}) {
  const [fallen, setFallen] = useState(false)

  useEffect(() => {
    // Next frame: flip to the fallen state so the CSS transition runs.
    const raf = requestAnimationFrame(() => setFallen(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={`droplet${fallen ? ' fallen' : ''}`}
      style={{
        left: drop.x,
        transform: `translate(-50%, ${fallen ? drop.targetY : -40}px)`,
      }}
      onTransitionEnd={() => onLand(drop.id)}
      aria-hidden="true"
    />
  )
}

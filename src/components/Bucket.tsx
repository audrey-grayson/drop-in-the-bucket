import { forwardRef, useId } from 'react'

interface BucketProps {
  /** 0..1 how full to draw the water, for visual feedback. */
  fill: number
  /** Triggers a brief splash wobble when toggled. */
  splashing?: boolean
  onActivate?: () => void
}

// SVG bucket. The `rim` group is what droplets aim for, so the parent measures
// this element's rect. Water height is driven by `fill`.
const Bucket = forwardRef<HTMLButtonElement, BucketProps>(function Bucket(
  { fill, splashing, onActivate },
  ref,
) {
  const clipId = useId()
  const clamped = Math.max(0, Math.min(1, fill))
  // Water sits inside the tapered body: y from 92 (empty) up to 40 (full).
  const waterTop = 92 - clamped * 52

  return (
    <button
      ref={ref}
      type="button"
      className={`bucket${splashing ? ' splashing' : ''}`}
      onClick={onActivate}
      aria-label="Add a drop"
    >
      <svg width="84" height="96" viewBox="0 0 100 110" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <path d="M22 38 H78 L72 96 Q72 100 66 100 H34 Q28 100 28 96 Z" />
          </clipPath>
        </defs>

        {/* Interior background fill (sits behind the water) */}
        <path
          d="M22 38 H78 L72 96 Q72 100 66 100 H34 Q28 100 28 96 Z"
          className="bucket-inside"
        />

        {/* Water fill, clipped to the bucket interior, painted over the inside */}
        {clamped > 0 && (
          <g clipPath={`url(#${clipId})`}>
            <rect x="18" y={waterTop} width="64" height="70" className="bucket-water" />
            <ellipse
              cx="50"
              cy={waterTop}
              rx="32"
              ry="4"
              className="bucket-water-surface"
            />
          </g>
        )}

        {/* Bucket outline drawn on top so edges stay crisp over the water */}
        <path
          d="M22 38 H78 L72 96 Q72 100 66 100 H34 Q28 100 28 96 Z"
          className="bucket-body"
        />
        {/* Rim */}
        <ellipse cx="50" cy="38" rx="29" ry="7" className="bucket-rim" />
      </svg>
    </button>
  )
})

export default Bucket

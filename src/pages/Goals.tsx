import { useState } from 'react'
import { useStore } from '../store'

const EMOJI_SUGGESTIONS = [
  '💧', '📚', '🏃', '🧘', '🥗', '💪', '🛌', '🎸', '🎨', '✍️',
  '🧹', '💰', '☎️', '🌱', '🚭', '🍎', '🚶', '🧠', '🙏', '🎯',
]

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, moveGoal } = useStore()
  const [emoji, setEmoji] = useState('🎯')
  const [label, setLabel] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    addGoal(emoji, label)
    setLabel('')
    setEmoji('🎯')
  }

  return (
    <div className="goals-page">
      <form className="goal-form card" onSubmit={submit}>
        <div className="form-row">
          <input
            className="emoji-input"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
            aria-label="Goal emoji"
            inputMode="text"
          />
          <input
            className="label-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="New goal…"
            maxLength={40}
            aria-label="Goal name"
          />
          <button className="btn primary" type="submit">
            Add
          </button>
        </div>
        <div className="emoji-palette" role="group" aria-label="Pick an emoji">
          {EMOJI_SUGGESTIONS.map((e) => (
            <button
              key={e}
              type="button"
              className={`emoji-chip${emoji === e ? ' selected' : ''}`}
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </form>

      <ul className="goal-list">
        {goals.map((goal, i) => (
          <li key={goal.id} className="goal-edit card">
            <input
              className="emoji-input"
              value={goal.emoji}
              onChange={(e) =>
                updateGoal(goal.id, { emoji: e.target.value.slice(0, 4) })
              }
              aria-label={`Emoji for ${goal.label}`}
            />
            <input
              className="label-input"
              value={goal.label}
              onChange={(e) => updateGoal(goal.id, { label: e.target.value })}
              maxLength={40}
              aria-label="Goal name"
            />
            <div className="goal-edit-actions">
              <button
                className="icon-btn"
                onClick={() => moveGoal(goal.id, -1)}
                disabled={i === 0}
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                className="icon-btn"
                onClick={() => moveGoal(goal.id, 1)}
                disabled={i === goals.length - 1}
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                className="icon-btn danger"
                onClick={() => deleteGoal(goal.id)}
                aria-label={`Delete ${goal.label}`}
              >
                🗑
              </button>
            </div>
          </li>
        ))}
        {goals.length === 0 && (
          <li className="empty-state">No goals yet — add one above.</li>
        )}
      </ul>
    </div>
  )
}

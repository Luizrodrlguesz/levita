import { useId } from 'react';

interface StarsProps {
  value: number;
  /** quando presente, as estrelas viram botões */
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

function Star({ fill }: { fill: number }) {
  // fill: 0 → vazia, 1 → cheia, entre 0 e 1 → parcial (usado nas médias)
  const clipId = `star-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 24 24" className="star__svg" aria-hidden="true">
      <defs>
        <linearGradient id={clipId}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z"
        fill={`url(#${clipId})`}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Stars({ value, onChange, size = 'md', label }: StarsProps) {
  const stars = [1, 2, 3, 4, 5];

  if (!onChange) {
    return (
      <span className={`stars stars--${size}`} role="img" aria-label={`${value.toFixed(1)} de 5`}>
        {stars.map((s) => (
          <span className="star" key={s}>
            <Star fill={Math.min(1, Math.max(0, value - s + 1))} />
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={`stars stars--${size} stars--input`} role="radiogroup" aria-label={label}>
      {stars.map((s) => (
        <button
          type="button"
          key={s}
          className={`star star--btn ${s <= value ? 'is-on' : ''}`}
          role="radio"
          aria-checked={s === value}
          aria-label={`${s} ${s === 1 ? 'estrela' : 'estrelas'}`}
          onClick={() => onChange(s === value ? 0 : s)}
        >
          <Star fill={s <= value ? 1 : 0} />
        </button>
      ))}
    </span>
  );
}

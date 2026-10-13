import { useEffect, useRef, useState } from 'react';

/** Foto da pessoa ou, sem foto, as iniciais sobre o rosé da marca. */
export function Avatar({ name, photo, size = 40 }: { name: string; photo: string; size?: number }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {photo ? <img src={photo} alt="" /> : initials}
    </span>
  );
}

export function Kpi({
  label,
  value,
  suffix,
  hint,
  trend,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
  /** variação percentual; `null` = sem base de comparação */
  trend?: number | null;
  accent?: boolean;
}) {
  return (
    <div className={`kpi ${accent ? 'kpi--accent' : ''}`}>
      <span>{label}</span>
      <strong className="serif">
        {value}
        {suffix && <em>{suffix}</em>}
      </strong>
      {trend !== undefined && (
        <small className={trend === null ? 'is-flat' : trend < 0 ? 'is-down' : 'is-up'}>
          {trend === null ? 'sem base de comparação' : `${trend >= 0 ? '↗' : '↘'} ${Math.abs(trend).toFixed(1).replace('.', ',')}% vs. período anterior`}
        </small>
      )}
      {hint && <small className="is-flat">{hint}</small>}
    </div>
  );
}

/** Lê uma imagem local e devolve uma data URL quadrada e leve (cabe no localStorage). */
function resizeImage(file: File, size = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas indisponível'));
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (photo: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  return (
    <div className="photo-input">
      <Avatar name={name || '?'} photo={value} size={84} />
      <div>
        <div className="photo-input__actions">
          <button type="button" className="chip" onClick={() => input.current?.click()}>
            {value ? 'Trocar foto' : 'Enviar foto'}
          </button>
          {value && (
            <button type="button" className="chip chip--ghost" onClick={() => onChange('')}>
              Remover
            </button>
          )}
        </div>
        <p className="form-hint">JPG ou PNG. A imagem é recortada em quadrado.</p>
        {error && <p className="form-error">{error}</p>}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          try {
            onChange(await resizeImage(file));
            setError('');
          } catch {
            setError('Não foi possível ler esta imagem.');
          }
        }}
      />
    </div>
  );
}

export function Card({
  title,
  aside,
  children,
  className = '',
}: {
  title?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`hub-card ${className}`}>
      {(title || aside) && (
        <div className="hub-card__head">
          {title && <h2 className="serif">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </div>
  );
}

export interface Action {
  label: string;
  onSelect: () => void;
  /** pede um segundo clique antes de executar (remoções) */
  confirm?: string;
  danger?: boolean;
  /** link que abre noutra aba em vez de executar `onSelect` */
  href?: string;
}

/**
 * Botão "⋯" das linhas das tabelas. O menu usa `position: fixed` calculado a
 * partir do botão para não ser cortado pelo `overflow` das tabelas.
 */
export function ActionsMenu({ actions, label }: { actions: Action[]; label: string }) {
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [armed, setArmed] = useState<number | null>(null);

  const close = () => {
    setPos(null);
    setArmed(null);
  };

  useEffect(() => {
    if (!pos) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !button.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        button.current?.focus();
      }
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    menu.current?.querySelector<HTMLElement>('button, a')?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [pos]);

  function toggle() {
    if (pos) return close();
    const r = button.current!.getBoundingClientRect();
    setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        className={`actions-btn ${pos ? 'is-open' : ''}`}
        aria-label={`Ações: ${label}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(pos)}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {pos && (
        <div ref={menu} className="actions-menu" role="menu" style={{ top: pos.top, right: pos.right }}>
          {actions.map((a, i) =>
            a.href ? (
              <a key={a.label} role="menuitem" href={a.href} target="_blank" rel="noreferrer" onClick={close}>
                {a.label}
              </a>
            ) : (
              <button
                type="button"
                role="menuitem"
                key={a.label}
                className={`${a.danger ? 'is-danger' : ''} ${armed === i ? 'is-armed' : ''}`}
                onClick={() => {
                  if (a.confirm && armed !== i) return setArmed(i);
                  a.onSelect();
                  close();
                }}
              >
                {armed === i ? a.confirm : a.label}
              </button>
            ),
          )}
        </div>
      )}
    </>
  );
}

/** Trilha "Seção / página" acima dos formulários de criar/editar. */
export function Crumbs({ to, section, page }: { to: string; section: string; page: string }) {
  return (
    <nav className="dash-crumbs">
      <a href={to}>← {section}</a>
      <span>/</span>
      <span>{page}</span>
    </nav>
  );
}

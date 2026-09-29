import { useEffect, useMemo, useState } from 'react';
import useReviews from '../hooks/useReviews';
import { navigate } from '../hooks/useRoute';
import Stars from './Stars';
import {
  CRITERIA,
  addReview,
  average,
  emptyScores,
  formatDate,
  monthlySeries,
  reviewAverage,
  statsFor,
  type Professional,
  type Review,
} from '../data/reviews';

interface AvaliarProps {
  professionalId?: string;
}

const PANELS = [
  { key: 'geral', label: 'Visão geral', icon: 'M4 12l6-6 6 6-6 6z' },
  { key: 'avaliacoes', label: 'Avaliações', icon: 'M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z' },
  { key: 'evolucao', label: 'Evolução', icon: 'M3 17l5-5 4 3 8-8' },
  { key: 'comentarios', label: 'Comentários', icon: 'M4 5h16v10H8l-4 4z' },
  { key: 'comparativo', label: 'Comparativo', icon: 'M5 20V10M12 20V4M19 20v-7' },
] as const;

type PanelKey = (typeof PANELS)[number]['key'];

export default function Avaliar({ professionalId }: AvaliarProps) {
  const { professionals, reviews } = useReviews();
  const active = professionals.filter((p) => p.active);
  const selected = professionalId
    ? professionals.find((p) => p.id === professionalId)
    : undefined;

  if (professionalId && !selected) {
    return (
      <section className="rate rate--empty">
        <div className="container">
          <h1 className="rate__title serif">Profissional não encontrado</h1>
          <a className="rate__back" href="#/avaliar">
            ← Voltar para os profissionais
          </a>
        </div>
      </section>
    );
  }

  if (selected) {
    return <RateForm pro={selected} reviews={reviews} />;
  }

  return <ProfessionalList professionals={active} reviews={reviews} />;
}

/* ---------------- lista de profissionais ---------------- */

function ProfessionalList({
  professionals,
  reviews,
}: {
  professionals: Professional[];
  reviews: Review[];
}) {
  const published = reviews.filter((r) => r.status === 'publicada');
  const global = statsFor(published);

  return (
    <section className="rate">
      <div className="container">
        <header className="rate__head reveal">
          <div className="eyebrow">Avaliações</div>
          <h1 className="rate__title serif">Avalie seu atendimento</h1>
          <p className="rate__lead">
            Sua opinião nos ajuda a oferecer sempre o melhor!
          </p>
          <div className="rate__divider">
            <span className="rule" />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 20s-7-4.5-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.5-7 9-7 9z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
            <span className="rule" />
          </div>
        </header>

        <div className="rate__section-head reveal delay-1">
          <h2 className="serif">Nossos profissionais</h2>
          <p>Escolha o profissional que te atendeu e faça sua avaliação.</p>
        </div>

        <div className="pro-grid">
          {professionals.map((pro, i) => {
            const stats = statsFor(published.filter((r) => r.professionalId === pro.id));
            return (
              <article className={`pro-card reveal delay-${(i % 4) + 1}`} key={pro.id}>
                <div className="pro-card__photo">
                  <img src={pro.photo} alt={pro.name} />
                </div>
                <h3 className="serif">{pro.name}</h3>
                <p className="pro-card__role">{pro.role}</p>
                <div className="pro-card__score">
                  <Stars value={stats.average} size="sm" />
                  <strong>{formatScore(stats.average)}</strong>
                  <span>/5</span>
                </div>
                <p className="pro-card__count">
                  {stats.count} {stats.count === 1 ? 'avaliação' : 'avaliações'}
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate(`/avaliar/${pro.id}`)}
                >
                  Avaliar {pro.name.split(' ')[0]}
                </button>
              </article>
            );
          })}
        </div>

        <div className="rate-stats reveal">
          <Stat label="Profissionais" value={String(professionals.length)} icon="team" />
          <Stat label="Média geral" value={formatScore(global.average)} icon="star" />
          <Stat label="Avaliações" value={String(global.count)} icon="chat" />
          <Stat
            label="Clientes satisfeitos"
            value={`${Math.round(global.positiveRate)}%`}
            icon="trend"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- formulário + painéis ---------------- */

function RateForm({ pro, reviews }: { pro: Professional; reviews: Review[] }) {
  const [panel, setPanel] = useState<PanelKey>('geral');
  const [scores, setScores] = useState(emptyScores);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [client, setClient] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setPanel('geral');
    setSent(false);
    setScores(emptyScores());
    setComment('');
    setError('');
  }, [pro.id]);

  const mine = useMemo(
    () => reviews.filter((r) => r.professionalId === pro.id && r.status === 'publicada'),
    [reviews, pro.id],
  );
  const stats = statsFor(mine);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = CRITERIA.filter((c) => !scores[c.key]);
    if (missing.length) {
      setError(`Faltam ${missing.length} ${missing.length === 1 ? 'critério' : 'critérios'} para avaliar.`);
      return;
    }
    addReview({
      professionalId: pro.id,
      client: anonymous ? '' : client.trim(),
      anonymous,
      scores,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      status: 'pendente',
      source: 'cliente',
    });
    setSent(true);
    setError('');
  }

  return (
    <section className="rate rate--detail">
      <div className="container">
        <div className="rate-layout">
          <aside className="rate-aside">
            <a className="rate__back" href="#/avaliar">
              ← Voltar para os profissionais
            </a>
            <div className="rate-aside__photo">
              <img src={pro.photo} alt={pro.name} />
            </div>
            <h2 className="serif">{pro.name}</h2>
            <p className="rate-aside__role">{pro.role}</p>
            <div className="pro-card__score">
              <Stars value={stats.average} size="sm" />
              <strong>{formatScore(stats.average)}</strong>
              <span>/5</span>
            </div>
            <p className="pro-card__count">
              {stats.count} {stats.count === 1 ? 'avaliação' : 'avaliações'}
            </p>

            <nav className="rate-tabs">
              {PANELS.map((p) => (
                <button
                  type="button"
                  key={p.key}
                  className={`rate-tab ${panel === p.key ? 'is-active' : ''}`}
                  onClick={() => setPanel(p.key)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={p.icon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  {p.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="rate-main">
            {panel === 'geral' &&
              (sent ? (
                <div className="rate-sent">
                  <div className="rate-sent__icon">✓</div>
                  <h2 className="serif">Avaliação enviada</h2>
                  <p>
                    Obrigado! Sua avaliação de {pro.name} foi registrada e será publicada
                    após a conferência da equipe.
                  </p>
                  <div className="rate-sent__actions">
                    <a className="btn-primary" href="#/avaliar">
                      Avaliar outro profissional
                    </a>
                    <button type="button" className="btn-ghost" onClick={() => setPanel('avaliacoes')}>
                      Ver avaliações
                    </button>
                  </div>
                </div>
              ) : (
                <form className="rate-form" onSubmit={submit}>
                  <h2 className="serif">Avalie o atendimento de {pro.name.split(' ')[0]}</h2>
                  <p className="rate-form__lead">Sua avaliação é muito importante para nós!</p>

                  <ul className="criteria">
                    {CRITERIA.map((c) => (
                      <li key={c.key}>
                        <span className="criteria__label">
                          {c.label}
                          <span className="criteria__hint" title={c.hint} aria-label={c.hint}>
                            i
                          </span>
                        </span>
                        <Stars
                          value={scores[c.key]}
                          label={c.label}
                          onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))}
                        />
                      </li>
                    ))}
                  </ul>

                  <label className="field">
                    <span className="field__label">Comentário (opcional)</span>
                    <textarea
                      rows={4}
                      placeholder="Conte-nos sobre sua experiência..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </label>

                  {!anonymous && (
                    <label className="field">
                      <span className="field__label">Seu nome (opcional)</span>
                      <input
                        type="text"
                        placeholder="Como podemos te chamar?"
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                      />
                    </label>
                  )}

                  {error && <p className="form-error">{error}</p>}

                  <button type="submit" className="btn-primary btn-block">
                    Enviar avaliação
                  </button>
                </form>
              ))}

            {panel === 'avaliacoes' && <ReviewList reviews={mine} empty="Ainda não há avaliações publicadas." />}

            {panel === 'comentarios' && (
              <ReviewList
                reviews={mine.filter((r) => r.comment)}
                title="Comentários"
                empty="Ainda não há comentários por aqui."
              />
            )}

            {panel === 'evolucao' && <Evolution reviews={mine} />}

            {panel === 'comparativo' && (
              <Comparison
                reviews={reviews.filter((r) => r.status === 'publicada')}
                mine={mine}
                name={pro.name.split(' ')[0]}
              />
            )}
          </div>

          <aside className="rate-summary">
            <div className="rate-anon">
              <span>Avaliar anonimamente</span>
              <button
                type="button"
                className={`switch ${anonymous ? 'is-on' : ''}`}
                role="switch"
                aria-checked={anonymous}
                aria-label="Avaliar anonimamente"
                onClick={() => setAnonymous((v) => !v)}
              >
                <span />
              </button>
            </div>
            <p className="rate-secure">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3l7 3v6c0 4.2-2.9 7.7-7 9-4.1-1.3-7-4.8-7-9V6z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              <span>
                {anonymous
                  ? 'Sua avaliação é segura e não será identificada.'
                  : 'Seu nome aparecerá junto da avaliação publicada.'}
              </span>
            </p>

            <div className="summary-card">
              <h3 className="serif">Resumo de {pro.name.split(' ')[0]}</h3>
              <div className="summary-card__body">
                <span className="summary-card__label">Média geral</span>
                <div className="summary-card__score serif">
                  {formatScore(stats.average)}
                  <em>/5</em>
                </div>
                <Stars value={stats.average} />
                <p className="pro-card__count">
                  {stats.count} {stats.count === 1 ? 'avaliação' : 'avaliações'}
                </p>

                <div className="summary-card__row">
                  <span className="summary-card__label">Nota dos últimos 30 dias</span>
                  <strong>{formatScore(stats.last30)}<em>/5</em></strong>
                </div>

                <div className="summary-card__row">
                  <span className="summary-card__label">Evolução</span>
                  {stats.trend === null ? (
                    <strong className="is-flat">—</strong>
                  ) : (
                    <strong className={stats.trend < 0 ? 'is-down' : 'is-up'}>
                      {stats.trend >= 0 ? '↗' : '↘'} {Math.abs(stats.trend).toFixed(1)}%
                    </strong>
                  )}
                </div>
                <p className="summary-card__foot">
                  {stats.trend === null
                    ? 'sem base de comparação no período'
                    : 'em relação ao mês anterior'}
                </p>

                <button type="button" className="link-arrow" onClick={() => setPanel('avaliacoes')}>
                  Ver todas as avaliações →
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ---------------- painéis auxiliares ---------------- */

function ReviewList({
  reviews,
  title,
  empty,
}: {
  reviews: Review[];
  title?: string;
  empty: string;
}) {
  if (!reviews.length) return <div className="panel-empty">{empty}</div>;
  return (
    <div className="panel">
      {title && <h2 className="serif">{title}</h2>}
      <ul className="review-list">
        {reviews.map((r) => (
          <li key={r.id}>
            <div className="review-list__head">
              <strong>{r.anonymous || !r.client ? 'Cliente anônimo' : r.client}</strong>
              <Stars value={reviewAverage(r)} size="sm" />
              <span className="review-list__date">{formatDate(r.createdAt)}</span>
            </div>
            {r.comment && <p>{r.comment}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Evolution({ reviews }: { reviews: Review[] }) {
  const series = monthlySeries(reviews);
  // as notas vivem quase todas entre 3 e 5; ancorar a barra em 3 torna a
  // variação mensal legível
  const floor = 3;
  return (
    <div className="panel">
      <h2 className="serif">Evolução</h2>
      <p className="panel__lead">
        Média mensal das avaliações publicadas nos últimos 6 meses · escala de 3 a 5.
      </p>
      <div className="bars">
        {series.map((m) => (
          <div className="bars__item" key={m.label}>
            <div className="bars__track">
              <div
                className="bars__fill"
                style={{
                  height: m.value ? `${((m.value - floor) / (5 - floor)) * 100}%` : '0%',
                }}
                title={`${m.count} avaliações`}
              />
            </div>
            <span className="bars__value">{m.value ? formatScore(m.value) : '—'}</span>
            <span className="bars__label">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Comparison({
  reviews,
  mine,
  name,
}: {
  reviews: Review[];
  mine: Review[];
  name: string;
}) {
  return (
    <div className="panel">
      <h2 className="serif">Comparativo</h2>
      <p className="panel__lead">
        Como {name} se posiciona em cada critério frente à média da clínica.
      </p>
      <ul className="cmp">
        {CRITERIA.map((c) => {
          const own = average(mine.map((r) => r.scores[c.key] ?? 0));
          const all = average(reviews.map((r) => r.scores[c.key] ?? 0));
          return (
            <li key={c.key}>
              <span className="cmp__label">{c.label}</span>
              <div className="cmp__bars">
                <div className="cmp__bar">
                  <div className="cmp__fill" style={{ width: `${(own / 5) * 100}%` }} />
                </div>
                <div className="cmp__bar cmp__bar--ghost">
                  <div className="cmp__fill" style={{ width: `${(all / 5) * 100}%` }} />
                </div>
              </div>
              <span className="cmp__value">
                {formatScore(own)} <em>· clínica {formatScore(all)}</em>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  const paths: Record<string, string> = {
    team: 'M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 19c0-2.8 2.7-4.5 6-4.5s6 1.7 6 4.5M15 14.7c2.8.3 5 1.9 5 4.3',
    star: 'M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z',
    chat: 'M4 5h16v10H8l-4 4z',
    trend: 'M3 17l5-5 4 3 8-8M20 7h-4M20 7v4',
  };
  return (
    <div className="rate-stats__item">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={paths[icon]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <div>
        <strong className="serif">{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export function formatScore(value: number): string {
  if (!value) return '—';
  return value.toFixed(1).replace('.', ',');
}

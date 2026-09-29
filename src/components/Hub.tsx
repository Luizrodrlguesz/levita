import { useMemo, useState } from 'react';
import useReviews from '../hooks/useReviews';
import Stars from './Stars';
import { formatScore } from './Avaliar';
import {
  CRITERIA,
  addProfessional,
  addReview,
  deleteReview,
  emptyScores,
  formatDate,
  removeProfessional,
  resetStore,
  reviewAverage,
  setReviewStatus,
  statsFor,
  toggleProfessional,
  type Professional,
  type Review,
  type ReviewStatus,
} from '../data/reviews';

const TABS = [
  { key: 'visao', label: 'Visão geral' },
  { key: 'avaliacoes', label: 'Avaliações' },
  { key: 'equipe', label: 'Profissionais' },
  { key: 'nova', label: 'Nova avaliação' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pendente: 'Pendente',
  publicada: 'Publicada',
  oculta: 'Oculta',
};

export default function Hub() {
  const { professionals, reviews } = useReviews();
  const [tab, setTab] = useState<TabKey>('visao');

  const published = reviews.filter((r) => r.status === 'publicada');
  const pending = reviews.filter((r) => r.status === 'pendente');
  const global = statsFor(published);

  return (
    <section className="hub">
      <div className="container">
        <header className="hub__head">
          <div>
            <div className="eyebrow">Área da clínica</div>
            <h1 className="hub__title serif">
              HUB da <span className="it">Staff</span>
            </h1>
            <p className="hub__lead">
              Acompanhe as avaliações da equipe, publique o que chega dos clientes e
              registre atendimentos avaliados no balcão.
            </p>
          </div>
          <div className="hub__head-actions">
            {pending.length > 0 && (
              <button type="button" className="hub__badge" onClick={() => setTab('avaliacoes')}>
                {pending.length} aguardando revisão
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={resetStore}>
              Repor dados de exemplo
            </button>
          </div>
        </header>

        <div className="kpi-row">
          <Kpi label="Avaliações publicadas" value={String(global.count)} />
          <Kpi label="Média geral" value={formatScore(global.average)} suffix="/5" />
          <Kpi label="Aguardando revisão" value={String(pending.length)} accent={pending.length > 0} />
          <Kpi
            label="Profissionais ativos"
            value={String(professionals.filter((p) => p.active).length)}
          />
        </div>

        <nav className="hub__tabs">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              className={`hub__tab ${tab === t.key ? 'is-active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'visao' && (
          <Overview professionals={professionals} reviews={reviews} onGoTo={setTab} />
        )}
        {tab === 'avaliacoes' && <ReviewsTable professionals={professionals} reviews={reviews} />}
        {tab === 'equipe' && <Team professionals={professionals} reviews={reviews} />}
        {tab === 'nova' && <NewReview professionals={professionals} onDone={() => setTab('avaliacoes')} />}
      </div>
    </section>
  );
}

/* ---------------- visão geral ---------------- */

function Overview({
  professionals,
  reviews,
  onGoTo,
}: {
  professionals: Professional[];
  reviews: Review[];
  onGoTo: (tab: TabKey) => void;
}) {
  const published = reviews.filter((r) => r.status === 'publicada');
  const ranking = professionals
    .map((pro) => ({
      pro,
      stats: statsFor(published.filter((r) => r.professionalId === pro.id)),
    }))
    .sort((a, b) => b.stats.average - a.stats.average);

  const latest = [...reviews]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <div className="hub-grid">
      <div className="hub-card">
        <div className="hub-card__head">
          <h2 className="serif">Desempenho da equipe</h2>
          <button type="button" className="link-arrow" onClick={() => onGoTo('equipe')}>
            Gerenciar equipe →
          </button>
        </div>
        <ul className="ranking">
          {ranking.map(({ pro, stats }) => (
            <li key={pro.id} className={pro.active ? '' : 'is-off'}>
              <img src={pro.photo} alt="" />
              <div className="ranking__info">
                <strong>{pro.name}</strong>
                <span>{pro.role}</span>
                <div className="ranking__bar">
                  <div style={{ width: `${(stats.average / 5) * 100}%` }} />
                </div>
              </div>
              <div className="ranking__score">
                <strong>{formatScore(stats.average)}</strong>
                <span>{stats.count} aval.</span>
                {stats.trend === null ? (
                  <em className="is-flat">sem base</em>
                ) : (
                  <em className={stats.trend < 0 ? 'is-down' : 'is-up'}>
                    {stats.trend >= 0 ? '↗' : '↘'} {Math.abs(stats.trend).toFixed(1)}%
                  </em>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="hub-card">
        <div className="hub-card__head">
          <h2 className="serif">Últimas avaliações</h2>
          <button type="button" className="link-arrow" onClick={() => onGoTo('avaliacoes')}>
            Ver todas →
          </button>
        </div>
        <ul className="feed">
          {latest.map((r) => {
            const pro = professionals.find((p) => p.id === r.professionalId);
            return (
              <li key={r.id}>
                <div className="feed__top">
                  <strong>{pro?.name ?? 'Profissional removido'}</strong>
                  <span className={`status status--${r.status}`}>{STATUS_LABEL[r.status]}</span>
                </div>
                <div className="feed__meta">
                  <Stars value={reviewAverage(r)} size="sm" />
                  <span>{formatScore(reviewAverage(r))}</span>
                  <span>·</span>
                  <span>{r.anonymous || !r.client ? 'Anônimo' : r.client}</span>
                  <span>·</span>
                  <span>{formatDate(r.createdAt)}</span>
                </div>
                {r.comment && <p>{r.comment}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- tabela de avaliações ---------------- */

function ReviewsTable({
  professionals,
  reviews,
}: {
  professionals: Professional[];
  reviews: Review[];
}) {
  const [pro, setPro] = useState('todos');
  const [status, setStatus] = useState<'todos' | ReviewStatus>('todos');
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews
      .filter((r) => (pro === 'todos' ? true : r.professionalId === pro))
      .filter((r) => (status === 'todos' ? true : r.status === status))
      .filter((r) =>
        q
          ? `${r.client} ${r.comment}`.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reviews, pro, status, query]);

  return (
    <div className="hub-card">
      <div className="hub-card__head">
        <h2 className="serif">Avaliações</h2>
        <span className="hub-card__count">{filtered.length} resultado(s)</span>
      </div>

      <div className="filters">
        <label className="field field--inline">
          <span className="field__label">Profissional</span>
          <select value={pro} onChange={(e) => setPro(e.target.value)}>
            <option value="todos">Todos</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--inline">
          <span className="field__label">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'todos' | ReviewStatus)}
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="publicada">Publicada</option>
            <option value="oculta">Oculta</option>
          </select>
        </label>
        <label className="field field--inline field--grow">
          <span className="field__label">Buscar</span>
          <input
            type="search"
            placeholder="Nome do cliente ou trecho do comentário"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="panel-empty">Nenhuma avaliação com esses filtros.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Profissional</th>
                <th>Cliente</th>
                <th>Nota</th>
                <th>Data</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const p = professionals.find((x) => x.id === r.professionalId);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="cell-pro">
                        {p && <img src={p.photo} alt="" />}
                        <span>{p?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td>
                      {r.anonymous || !r.client ? <em>Anônimo</em> : r.client}
                      {r.comment && <p className="cell-comment">{r.comment}</p>}
                    </td>
                    <td>
                      <div className="cell-score">
                        <Stars value={reviewAverage(r)} size="sm" />
                        <strong>{formatScore(reviewAverage(r))}</strong>
                      </div>
                    </td>
                    <td className="cell-date">{formatDate(r.createdAt)}</td>
                    <td>
                      <span className={`status status--${r.status}`}>{STATUS_LABEL[r.status]}</span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        {r.status !== 'publicada' && (
                          <button
                            type="button"
                            className="chip"
                            onClick={() => setReviewStatus(r.id, 'publicada')}
                          >
                            Publicar
                          </button>
                        )}
                        {r.status !== 'oculta' && (
                          <button
                            type="button"
                            className="chip"
                            onClick={() => setReviewStatus(r.id, 'oculta')}
                          >
                            Ocultar
                          </button>
                        )}
                        {confirmId === r.id ? (
                          <button
                            type="button"
                            className="chip chip--danger"
                            onClick={() => {
                              deleteReview(r.id);
                              setConfirmId(null);
                            }}
                          >
                            Confirmar exclusão
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="chip chip--ghost"
                            onClick={() => setConfirmId(r.id)}
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- equipe ---------------- */

function Team({
  professionals,
  reviews,
}: {
  professionals: Professional[];
  reviews: Review[];
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [photo, setPhoto] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const published = reviews.filter((r) => r.status === 'publicada');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addProfessional({
      name: name.trim(),
      role: role.trim() || 'Profissional',
      photo: photo.trim() || '/assets/levita-icon.png',
      active: true,
    });
    setName('');
    setRole('');
    setPhoto('');
  }

  return (
    <div className="hub-grid hub-grid--team">
      <div className="hub-card">
        <div className="hub-card__head">
          <h2 className="serif">Equipe</h2>
          <span className="hub-card__count">{professionals.length} profissionais</span>
        </div>
        <ul className="team-list">
          {professionals.map((p) => {
            const stats = statsFor(published.filter((r) => r.professionalId === p.id));
            return (
              <li key={p.id} className={p.active ? '' : 'is-off'}>
                <img src={p.photo} alt="" />
                <div className="team-list__info">
                  <strong>{p.name}</strong>
                  <span>{p.role}</span>
                </div>
                <div className="team-list__score">
                  <strong>{formatScore(stats.average)}</strong>
                  <span>{stats.count} aval.</span>
                </div>
                <div className="cell-actions">
                  <button type="button" className="chip" onClick={() => toggleProfessional(p.id)}>
                    {p.active ? 'Desativar' : 'Ativar'}
                  </button>
                  {confirmId === p.id ? (
                    <button
                      type="button"
                      className="chip chip--danger"
                      onClick={() => {
                        removeProfessional(p.id);
                        setConfirmId(null);
                      }}
                    >
                      Confirmar exclusão
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="chip chip--ghost"
                      onClick={() => setConfirmId(p.id)}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="hub-card">
        <div className="hub-card__head">
          <h2 className="serif">Adicionar profissional</h2>
        </div>
        <form className="stack" onSubmit={submit}>
          <label className="field">
            <span className="field__label">Nome</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
          </label>
          <label className="field">
            <span className="field__label">Função</span>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Massoterapeuta, Esteticista…"
            />
          </label>
          <label className="field">
            <span className="field__label">Foto (caminho em /assets)</span>
            <input
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="/assets/nome.jpg"
            />
          </label>
          <button type="submit" className="btn-primary btn-block" disabled={!name.trim()}>
            Adicionar à equipe
          </button>
          <p className="form-hint">
            Remover um profissional apaga também as avaliações ligadas a ele.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ---------------- nova avaliação ---------------- */

function NewReview({
  professionals,
  onDone,
}: {
  professionals: Professional[];
  onDone: () => void;
}) {
  const active = professionals.filter((p) => p.active);
  const [professionalId, setProfessionalId] = useState(active[0]?.id ?? '');
  const [client, setClient] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [scores, setScores] = useState(emptyScores);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<ReviewStatus>('publicada');
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!professionalId) {
      setError('Selecione um profissional.');
      return;
    }
    const missing = CRITERIA.filter((c) => !scores[c.key]);
    if (missing.length) {
      setError(`Faltam ${missing.length} ${missing.length === 1 ? 'critério' : 'critérios'}.`);
      return;
    }
    addReview({
      professionalId,
      client: client.trim(),
      anonymous: !client.trim(),
      scores,
      comment: comment.trim(),
      createdAt: new Date(`${date}T12:00:00`).toISOString(),
      status,
      source: 'staff',
    });
    setScores(emptyScores());
    setComment('');
    setClient('');
    setError('');
    onDone();
  }

  return (
    <div className="hub-card hub-card--form">
      <div className="hub-card__head">
        <h2 className="serif">Nova avaliação</h2>
        <span className="hub-card__count">registro manual da staff</span>
      </div>

      <form className="new-review" onSubmit={submit}>
        <div className="new-review__cols">
          <label className="field">
            <span className="field__label">Profissional</span>
            <select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)}>
              {active.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Cliente (vazio = anônimo)</span>
            <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome do cliente" />
          </label>
          <label className="field">
            <span className="field__label">Data do atendimento</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as ReviewStatus)}>
              <option value="publicada">Publicada</option>
              <option value="pendente">Pendente</option>
              <option value="oculta">Oculta</option>
            </select>
          </label>
        </div>

        <ul className="criteria">
          {CRITERIA.map((c) => (
            <li key={c.key}>
              <span className="criteria__label">{c.label}</span>
              <Stars
                value={scores[c.key]}
                label={c.label}
                onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))}
              />
            </li>
          ))}
        </ul>

        <label className="field">
          <span className="field__label">Comentário</span>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="O que o cliente relatou?"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary btn-block">
          Registrar avaliação
        </button>
      </form>
    </div>
  );
}

function Kpi({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className={`kpi ${accent ? 'kpi--accent' : ''}`}>
      <strong className="serif">
        {value}
        {suffix && <em>{suffix}</em>}
      </strong>
      <span>{label}</span>
    </div>
  );
}

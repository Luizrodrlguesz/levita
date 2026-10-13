import { useMemo, useState } from 'react';
import useReviews from '../hooks/useReviews';
import useShop from '../hooks/useShop';
import useStaff from '../hooks/useStaff';
import { navigate } from '../hooks/useRoute';
import Stars from './Stars';
import ProductArt from './ProductArt';
import { formatScore } from './Avaliar';
import HubLogin from './hub/HubLogin';
import HubMyPanel, { MyReviews } from './hub/HubMyPanel';
import HubProfile from './hub/HubProfile';
import HubTeam from './hub/HubTeam';
import HubProducts from './hub/HubProducts';
import HubOrders from './hub/HubOrders';
import { ActionsMenu, Avatar, Card, Kpi } from './hub/ui';
import {
  CRITERIA,
  addReview,
  deleteReview,
  emptyScores,
  formatDate,
  reviewAverage,
  setReviewStatus,
  statsFor,
  type Professional,
  type Review,
  type ReviewStatus,
} from '../data/reviews';
import {
  formatEuro,
  ordersBetween,
  revenue,
  topProducts,
  weeklyRevenue,
} from '../data/shop';
import {
  ROLE_LABEL,
  currentAccount,
  isAdmin,
  logout,
  resetAll,
  type StaffAccount,
} from '../data/staff';

/* ---------------- seções e permissões ---------------- */

type SectionKey = 'visao' | 'painel' | 'minhas' | 'avaliacoes' | 'nova' | 'produtos' | 'pedidos' | 'equipe' | 'perfil';

interface Section {
  key: SectionKey;
  label: string;
  title: string;
  lead: string;
  group: string;
  icon: string;
  /** quem vê: só admin, só quem atende clientes, ou todos */
  access: 'admin' | 'pro' | 'todos';
}

const ICONS = {
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  chart: 'M3 17l5-5 4 3 8-8M20 7h-4M20 7v4',
  star: 'M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z',
  plus: 'M12 5v14M5 12h14',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8',
  team: 'M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 19c0-2.8 2.7-4.5 6-4.5s6 1.7 6 4.5M15 14.7c2.8.3 5 1.9 5 4.3',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-3.3 3.6-5.5 8-5.5s8 2.2 8 5.5',
  chat: 'M4 5h16v10H8l-4 4z',
};

const SECTIONS: Section[] = [
  { key: 'visao', label: 'Visão geral', title: 'Visão geral', lead: 'Vendas da loja e satisfação dos clientes num só lugar.', group: 'Geral', icon: ICONS.grid, access: 'admin' },
  { key: 'painel', label: 'Meu painel', title: 'Meu painel', lead: 'O seu relatório de avaliações: média, evolução e comparação com a clínica.', group: 'Geral', icon: ICONS.chart, access: 'pro' },
  { key: 'minhas', label: 'Minhas avaliações', title: 'Minhas avaliações', lead: 'Tudo o que os clientes publicaram sobre os seus atendimentos.', group: 'Geral', icon: ICONS.chat, access: 'pro' },
  { key: 'avaliacoes', label: 'Moderação', title: 'Avaliações', lead: 'Publique, oculte ou exclua o que chega dos clientes.', group: 'Avaliações', icon: ICONS.star, access: 'admin' },
  { key: 'nova', label: 'Registrar avaliação', title: 'Registrar avaliação', lead: 'Lance uma avaliação recolhida no balcão ou por telefone.', group: 'Avaliações', icon: ICONS.plus, access: 'admin' },
  { key: 'produtos', label: 'Produtos', title: 'Produtos', lead: 'Catálogo da loja: preços, textos, visibilidade e ilustrações.', group: 'Loja', icon: ICONS.box, access: 'admin' },
  { key: 'pedidos', label: 'Pedidos', title: 'Pedidos', lead: 'Acompanhe e atualize o estado de cada encomenda.', group: 'Loja', icon: ICONS.bag, access: 'admin' },
  { key: 'equipe', label: 'Equipe', title: 'Equipe', lead: 'Funcionários, cargos e permissões de acesso ao HUB.', group: 'Gestão', icon: ICONS.team, access: 'admin' },
  { key: 'perfil', label: 'Meu perfil', title: 'Meu perfil', lead: 'Os seus dados, foto e senha de acesso.', group: 'Conta', icon: ICONS.user, access: 'todos' },
];

/** títulos das telas de criar/editar (`#/hub/:secao/:item`) */
const SUB_PAGES: Partial<Record<SectionKey, { novo: [string, string]; item: [string, string] }>> = {
  produtos: {
    novo: ['Novo produto', 'Preencha as informações e escolha a ilustração. Ao criar, ele já aparece na loja.'],
    item: ['Editar produto', 'As alterações aparecem na loja assim que forem salvas.'],
  },
  equipe: {
    novo: ['Novo funcionário', 'Crie o acesso ao HUB e defina a permissão.'],
    item: ['Editar funcionário', 'Dados, cargo, permissão e redefinição de senha.'],
  },
  pedidos: {
    novo: ['Pedido', ''],
    item: ['Pedido', 'Itens, dados do cliente e status da encomenda.'],
  },
};

function allowed(section: Section, account: StaffAccount) {
  if (section.access === 'admin') return isAdmin(account);
  if (section.access === 'pro') return Boolean(account.professionalId);
  return true;
}

/* ---------------- shell ---------------- */

export default function Hub({ section, sub }: { section?: string; sub?: string }) {
  const staff = useStaff();
  const account = currentAccount(staff);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!account) return <HubLogin />;

  const visible = SECTIONS.filter((s) => allowed(s, account));
  const current = visible.find((s) => s.key === section) ?? visible[0];
  const groups = [...new Set(visible.map((s) => s.group))];
  const subPage = sub ? SUB_PAGES[current.key]?.[sub === 'novo' ? 'novo' : 'item'] : undefined;
  const [title, lead] = subPage ?? [current.title, current.lead];
  const goTo = (key: SectionKey) => {
    navigate(`/hub/${key}`);
    setMenuOpen(false);
  };

  return (
    <div className={`dash ${menuOpen ? 'dash--menu' : ''}`}>
      <aside className="dash__side">
        <div className="dash__brand">
          <img src="/assets/levita-icon.png" alt="" />
          <span>
            <strong>LEVITÁ</strong>
            <em>{isAdmin(account) ? 'Painel admin' : 'Painel da equipe'}</em>
          </span>
          <button type="button" className="dash__burger" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className="dash__nav">
          {groups.map((g) => (
            <div key={g} className="dash__group">
              <span className="dash__group-label">{g}</span>
              {visible
                .filter((s) => s.group === g)
                .map((s) => (
                  <button
                    type="button"
                    key={s.key}
                    className={s.key === current.key ? 'is-active' : ''}
                    onClick={() => goTo(s.key)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d={s.icon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                    {s.label}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        <div className="dash__foot">
          <a href="#/avaliar" target="_blank" rel="noreferrer">
            Página de avaliação ↗
          </a>
          <a href="#/">← Voltar ao site</a>
          <div className="dash__user">
            <Avatar name={account.name} photo={account.photo} size={38} />
            <span className="dash__user-info">
              <strong>{account.name}</strong>
              <em className={`role-badge role-badge--${account.role}`}>{ROLE_LABEL[account.role]}</em>
            </span>
            <button type="button" className="dash__logout" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="dash__main">
        <header className={`dash__top ${current.key === 'visao' && !sub ? 'dash__top--kpis' : ''}`}>
          <div className="dash__heading">
            <h1 className="serif">{title}</h1>
            <p>{lead}</p>
          </div>
          {/* na visão geral os cards de resumo dividem a linha com o título */}
          {current.key === 'visao' && !sub && <OverviewKpis />}
        </header>

        <div className="dash__content">
          {current.key === 'visao' && <Overview onGoTo={goTo} />}
          {current.key === 'painel' && <HubMyPanel account={account} onGoTo={goTo} />}
          {current.key === 'minhas' && <MyReviews account={account} />}
          {current.key === 'avaliacoes' && <ReviewsPanel />}
          {current.key === 'nova' && <NewReviewPanel onDone={() => goTo('avaliacoes')} />}
          {current.key === 'produtos' && <HubProducts sub={sub} />}
          {current.key === 'pedidos' && <HubOrders sub={sub} />}
          {current.key === 'equipe' && <HubTeam me={account} sub={sub} />}
          {current.key === 'perfil' && <HubProfile account={account} />}
        </div>
      </main>
    </div>
  );
}

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pendente: 'Pendente',
  publicada: 'Publicada',
  oculta: 'Oculta',
};

function ReviewsPanel() {
  const { professionals, reviews } = useReviews();
  return <ReviewsTable professionals={professionals} reviews={reviews} />;
}

function NewReviewPanel({ onDone }: { onDone: () => void }) {
  const { professionals } = useReviews();
  return <NewReview professionals={professionals} onDone={onDone} />;
}

/* ---------------- visão geral (admin) ---------------- */

function OverviewKpis() {
  const { reviews } = useReviews();
  const { orders } = useShop();
  const published = reviews.filter((r) => r.status === 'publicada');
  const pending = reviews.filter((r) => r.status === 'pendente').length;
  const global = statsFor(published);

  const last30 = ordersBetween(orders, 30);
  const prev30 = ordersBetween(orders, 60, 30);
  const rev30 = revenue(last30);
  const revPrev = revenue(prev30);
  const revTrend = revPrev > 0 ? ((rev30 - revPrev) / revPrev) * 100 : null;
  const ordersTrend = prev30.length ? ((last30.length - prev30.length) / prev30.length) * 100 : null;
  const toShip = orders.filter((o) => o.status === 'novo').length;

  return (
    <div className="kpi-row kpi-row--top">
      <Kpi label="Receita · 30 dias" value={formatEuro(Math.round(rev30))} trend={revTrend} />
      <Kpi label="Pedidos · 30 dias" value={String(last30.length)} trend={ordersTrend} />
      <Kpi label="Ticket médio" value={formatEuro(last30.length ? Math.round(rev30 / last30.length) : 0)} />
      <Kpi label="Média das avaliações" value={formatScore(global.average)} suffix="/5" trend={global.trend} />
      <Kpi label="Aguardando revisão" value={String(pending)} accent={pending > 0} hint={`${toShip} pedido(s) por enviar`} />
    </div>
  );
}

function Overview({ onGoTo }: { onGoTo: (key: SectionKey) => void }) {
  const { professionals, reviews } = useReviews();
  const { orders } = useShop();
  const [confirmReset, setConfirmReset] = useState(false);

  const published = reviews.filter((r) => r.status === 'publicada');
  const weeks = weeklyRevenue(orders);
  const maxWeek = Math.max(...weeks.map((w) => w.value), 1);
  const top = topProducts(ordersBetween(orders, 90));

  const ranking = professionals
    .filter((p) => p.active)
    .map((pro) => ({ pro, stats: statsFor(published.filter((r) => r.professionalId === pro.id)) }))
    .sort((a, b) => b.stats.average - a.stats.average);

  const latest = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <>
      <div className="dash-grid">
        <Card title="Vendas por semana" aside={<span className="hub-card__count">últimas 8 semanas</span>}>
          <div className="bars bars--money">
            {weeks.map((w) => (
              <div className="bars__item" key={w.label}>
                <div className="bars__track">
                  <div className="bars__fill" style={{ height: `${(w.value / maxWeek) * 100}%` }} title={`${w.count} pedidos`} />
                </div>
                <span className="bars__value">{w.value ? formatEuro(Math.round(w.value)) : '—'}</span>
                <span className="bars__label">{w.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Mais vendidos"
          aside={
            <button type="button" className="link-arrow" onClick={() => onGoTo('produtos')}>
              Produtos →
            </button>
          }
        >
          <ul className="top-list">
            {top.map(({ product, qty }, i) => (
              <li key={product.id}>
                <span className="top-list__pos">{i + 1}</span>
                <span className="cell-art">
                  <ProductArt shape={product.art.shape} palette={product.art.palette} />
                </span>
                <span className="top-list__name">
                  <strong>{product.name}</strong>
                  <em>{formatEuro(product.price)}</em>
                </span>
                <span className="top-list__qty">{qty} un.</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="dash-grid">
        <Card
          title="Desempenho da equipe"
          aside={
            <button type="button" className="link-arrow" onClick={() => onGoTo('equipe')}>
              Gerenciar equipe →
            </button>
          }
        >
          <ul className="ranking">
            {ranking.map(({ pro, stats }) => (
              <li key={pro.id}>
                <Avatar name={pro.name} photo={pro.photo} size={46} />
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
        </Card>

        <Card
          title="Últimas avaliações"
          aside={
            <button type="button" className="link-arrow" onClick={() => onGoTo('avaliacoes')}>
              Moderar →
            </button>
          }
        >
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
        </Card>
      </div>

      <div className="dash-reset">
        {confirmReset ? (
          <>
            <span>Isto apaga as alterações e volta tudo aos dados de exemplo.</span>
            <button
              type="button"
              className="chip chip--danger"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
              }}
            >
              Confirmar
            </button>
            <button type="button" className="chip chip--ghost" onClick={() => setConfirmReset(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <button type="button" className="chip chip--ghost" onClick={() => setConfirmReset(true)}>
            Repor dados de exemplo
          </button>
        )}
      </div>
    </>
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
                <th className="col-actions">Ações</th>
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
                    <td className="col-actions">
                      <ActionsMenu
                        label={`avaliação de ${r.anonymous || !r.client ? 'cliente anônimo' : r.client}`}
                        actions={[
                          ...(r.status !== 'publicada'
                            ? [{ label: 'Publicar', onSelect: () => setReviewStatus(r.id, 'publicada') }]
                            : []),
                          ...(r.status !== 'oculta'
                            ? [{ label: 'Ocultar', onSelect: () => setReviewStatus(r.id, 'oculta') }]
                            : []),
                          ...(r.status !== 'pendente'
                            ? [{ label: 'Voltar para pendente', onSelect: () => setReviewStatus(r.id, 'pendente') }]
                            : []),
                          {
                            label: 'Excluir',
                            confirm: 'Confirmar exclusão',
                            danger: true,
                            onSelect: () => deleteReview(r.id),
                          },
                        ]}
                      />
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

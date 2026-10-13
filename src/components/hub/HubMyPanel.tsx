import useReviews from '../../hooks/useReviews';
import { statsFor, type Review } from '../../data/reviews';
import type { StaffAccount } from '../../data/staff';
import { Comparison, Evolution, ReviewList, formatScore } from '../Avaliar';
import { Card, Kpi } from './ui';

/** Relatório individual: só as avaliações publicadas do próprio profissional. */
export default function HubMyPanel({ account, onGoTo }: { account: StaffAccount; onGoTo: (s: 'minhas') => void }) {
  const { reviews } = useReviews();
  const published = reviews.filter((r) => r.status === 'publicada');
  const mine = published.filter((r) => r.professionalId === account.professionalId);
  const stats = statsFor(mine);
  const clinic = statsFor(published);

  if (!account.professionalId) {
    return (
      <Card>
        <div className="panel-empty">
          Esta conta é só de gestão e não recebe avaliações de clientes.
        </div>
      </Card>
    );
  }

  const latest = [...mine].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <>
      <div className="kpi-row">
        <Kpi label="Minha média" value={formatScore(stats.average)} suffix="/5" hint={`clínica: ${formatScore(clinic.average)}`} />
        <Kpi label="Últimos 30 dias" value={formatScore(stats.last30)} suffix="/5" trend={stats.trend} />
        <Kpi label="Avaliações recebidas" value={String(stats.count)} />
        <Kpi label="Clientes satisfeitos" value={`${Math.round(stats.positiveRate)}%`} hint="notas 4 ou 5" />
      </div>

      <div className="dash-grid">
        <Card>
          <Evolution reviews={mine} />
        </Card>
        <Card>
          <Comparison reviews={published} mine={mine} name="você" />
        </Card>
      </div>

      <Card
        title="Comentários recentes"
        aside={
          <button type="button" className="link-arrow" onClick={() => onGoTo('minhas')}>
            Ver todas →
          </button>
        }
      >
        <ReviewList reviews={latest} empty="Você ainda não tem avaliações publicadas." />
      </Card>
    </>
  );
}

export function MyReviews({ account }: { account: StaffAccount }) {
  const { reviews } = useReviews();
  const mine: Review[] = reviews
    .filter((r) => r.status === 'publicada' && r.professionalId === account.professionalId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <Card title="Minhas avaliações" aside={<span className="hub-card__count">{mine.length} publicadas</span>}>
      <ReviewList reviews={mine} empty="Você ainda não tem avaliações publicadas." />
      <p className="form-hint">Avaliações pendentes de revisão aparecem aqui depois de publicadas pela gestão.</p>
    </Card>
  );
}

/**
 * Camada de dados das avaliações.
 *
 * Tudo vive no localStorage e é exposto por um store minimalista compatível
 * com `useSyncExternalStore`. Quando existir backend, basta trocar as funções
 * de leitura/escrita deste arquivo — os componentes não conhecem o storage.
 */

const STORAGE_KEY = 'levita.reviews.v1';

export const CRITERIA = [
  {
    key: 'qualidade',
    label: 'Qualidade do atendimento',
    hint: 'O cuidado técnico e o resultado da sessão.',
  },
  {
    key: 'cordialidade',
    label: 'Cordialidade e respeito',
    hint: 'Acolhimento, simpatia e escuta durante o atendimento.',
  },
  {
    key: 'tecnica',
    label: 'Conhecimento técnico',
    hint: 'Domínio do protocolo, das técnicas e dos equipamentos.',
  },
  {
    key: 'higiene',
    label: 'Higiene e organização',
    hint: 'Limpeza da sala, das mãos, dos lençóis e dos materiais.',
  },
  {
    key: 'pontualidade',
    label: 'Pontualidade',
    hint: 'Início e duração da sessão dentro do horário combinado.',
  },
  {
    key: 'experiencia',
    label: 'Experiência geral',
    hint: 'A sensação com que você saiu da Levitá.',
  },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]['key'];

export type ReviewStatus = 'pendente' | 'publicada' | 'oculta';

export interface Professional {
  id: string;
  name: string;
  role: string;
  photo: string;
  active: boolean;
}

export interface Review {
  id: string;
  professionalId: string;
  client: string;
  anonymous: boolean;
  scores: Record<CriterionKey, number>;
  comment: string;
  createdAt: string;
  status: ReviewStatus;
  source: 'cliente' | 'staff';
}

export interface ReviewsState {
  professionals: Professional[];
  reviews: Review[];
}

/* ---------- seed ---------- */

const seedProfessionals: Professional[] = [
  {
    id: 'adrian',
    name: 'Adrian Gomes',
    role: 'Fundadora · Massoterapeuta',
    photo: '/assets/adrian-2.jpg',
    active: true,
  },
  {
    id: 'maria',
    name: 'Maria Eduarda',
    role: 'Massoterapeuta',
    photo: '/assets/maria-eduarda.jpg',
    active: true,
  },
  {
    id: 'amanda',
    name: 'Amanda Lima',
    role: 'Massoterapeuta',
    photo: '/assets/amanda-lima.jpg',
    active: true,
  },
  {
    id: 'yudelkis',
    name: 'Yudelkis',
    role: 'Esteticista',
    photo: '/assets/Yudelkis.jpg',
    active: true,
  },
  {
    id: 'lucas',
    name: 'Lucas Neves',
    role: 'Massoterapeuta',
    photo: '/assets/lucas-neves.jpg',
    active: true,
  },
];

const seedComments = [
  'Saí flutuando. Atendimento impecável do início ao fim.',
  'Explicou cada etapa do protocolo, me senti muito segura.',
  'Sala perfeita, cheirinho ótimo e mãos maravilhosas.',
  'Já vi diferença na segunda sessão. Recomendo demais.',
  'Muito atenciosa, ajustou a pressão exatamente como pedi.',
  'Chegou alguns minutos atrasada, mas o atendimento compensou.',
  'A drenagem foi o ponto alto da minha semana.',
  'Profissional super técnica, senti firmeza no toque.',
  'Ambiente calmo e acolhedor, voltarei com certeza.',
  'Gostei muito, só senti falta de um pouco mais de tempo na sessão.',
  '',
  '',
];

const seedClients = [
  'Beatriz M.', 'Carla S.', 'Inês F.', 'Rita P.', 'Joana L.',
  'Sofia A.', 'Mariana C.', 'Patrícia R.', 'Helena T.', 'Cátia B.',
  'Daniela V.', 'Filipa N.', 'Andreia G.', 'Vera M.', 'Luísa D.',
];

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSeedReviews(): Review[] {
  const rand = mulberry32(20260826);
  const base: Record<string, number> = {
    adrian: 4.9,
    maria: 4.85,
    amanda: 4.7,
    yudelkis: 4.6,
    lucas: 4.75,
  };
  const volume: Record<string, number> = {
    adrian: 22,
    maria: 18,
    amanda: 14,
    yudelkis: 11,
    lucas: 9,
  };

  const out: Review[] = [];
  const now = Date.now();
  const day = 86_400_000;

  seedProfessionals.forEach((pro) => {
    const count = volume[pro.id] ?? 10;
    for (let i = 0; i < count; i++) {
      // avaliações mais recentes puxam um pouco para cima (evolução positiva)
      const ageInDays = Math.round(rand() * 150);
      const recency = 1 - ageInDays / 150;
      const scores = {} as Record<CriterionKey, number>;
      CRITERIA.forEach((c) => {
        const target = (base[pro.id] ?? 4.6) + recency * 0.25 - rand() * 0.7;
        scores[c.key] = Math.min(5, Math.max(3, Math.round(target)));
      });
      const comment = seedComments[Math.floor(rand() * seedComments.length)] ?? '';
      const anonymous = rand() < 0.25;
      out.push({
        id: `seed-${pro.id}-${i}`,
        professionalId: pro.id,
        client: anonymous ? '' : seedClients[Math.floor(rand() * seedClients.length)] ?? 'Cliente',
        anonymous,
        scores,
        comment,
        createdAt: new Date(now - ageInDays * day).toISOString(),
        status: 'publicada',
        source: 'cliente',
      });
    }
  });

  // duas avaliações aguardando moderação, para o HUB nascer com trabalho a fazer
  out.push({
    id: 'seed-pendente-1',
    professionalId: 'maria',
    client: 'Teresa M.',
    anonymous: false,
    scores: { qualidade: 5, cordialidade: 5, tecnica: 5, higiene: 5, pontualidade: 4, experiencia: 5 },
    comment: 'Melhor drenagem que já fiz em Lisboa. Obrigada!',
    createdAt: new Date(now - 2 * day).toISOString(),
    status: 'pendente',
    source: 'cliente',
  });
  out.push({
    id: 'seed-pendente-2',
    professionalId: 'amanda',
    client: '',
    anonymous: true,
    scores: { qualidade: 4, cordialidade: 5, tecnica: 4, higiene: 5, pontualidade: 3, experiencia: 4 },
    comment: 'Atendimento ótimo, mas atrasou uns 15 minutos.',
    createdAt: new Date(now - 1 * day).toISOString(),
    status: 'pendente',
    source: 'cliente',
  });

  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function seedState(): ReviewsState {
  return { professionals: seedProfessionals, reviews: buildSeedReviews() };
}

/* ---------- store ---------- */

let state: ReviewsState = load();
const listeners = new Set<() => void>();

function load(): ReviewsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Partial<ReviewsState>;
    if (!Array.isArray(parsed.professionals) || !Array.isArray(parsed.reviews)) {
      return seedState();
    }
    return { professionals: parsed.professionals, reviews: parsed.reviews };
  } catch {
    return seedState();
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* modo privado / storage cheio: seguimos só em memória */
  }
}

function commit(next: ReviewsState) {
  state = next;
  persist();
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getState(): ReviewsState {
  return state;
}

function newId() {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function addReview(input: Omit<Review, 'id'>): Review {
  const review: Review = { ...input, id: newId() };
  commit({ ...state, reviews: [review, ...state.reviews] });
  return review;
}

export function setReviewStatus(id: string, status: ReviewStatus) {
  commit({
    ...state,
    reviews: state.reviews.map((r) => (r.id === id ? { ...r, status } : r)),
  });
}

export function deleteReview(id: string) {
  commit({ ...state, reviews: state.reviews.filter((r) => r.id !== id) });
}

export function addProfessional(input: Omit<Professional, 'id'>): Professional {
  const id = input.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || newId();
  const pro: Professional = { ...input, id };
  commit({ ...state, professionals: [...state.professionals, pro] });
  return pro;
}

export function toggleProfessional(id: string) {
  commit({
    ...state,
    professionals: state.professionals.map((p) =>
      p.id === id ? { ...p, active: !p.active } : p,
    ),
  });
}

export function removeProfessional(id: string) {
  commit({
    professionals: state.professionals.filter((p) => p.id !== id),
    reviews: state.reviews.filter((r) => r.professionalId !== id),
  });
}

export function resetStore() {
  commit(seedState());
}

/* ---------- derivados ---------- */

export function reviewAverage(review: Review): number {
  const values = CRITERIA.map((c) => review.scores[c.key] ?? 0);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export interface ProfessionalStats {
  count: number;
  average: number;
  last30: number;
  previous30: number;
  /** null quando não há base de comparação nos dois períodos */
  trend: number | null;
  perCriterion: Record<CriterionKey, number>;
  positiveRate: number;
}

export function statsFor(reviews: Review[]): ProfessionalStats {
  const perCriterion = {} as Record<CriterionKey, number>;
  CRITERIA.forEach((c) => {
    perCriterion[c.key] = average(reviews.map((r) => r.scores[c.key] ?? 0));
  });

  const day = 86_400_000;
  const now = Date.now();
  const inWindow = (r: Review, from: number, to: number) => {
    const t = new Date(r.createdAt).getTime();
    return t >= now - from * day && t < now - to * day;
  };

  const last30 = average(reviews.filter((r) => inWindow(r, 30, 0)).map(reviewAverage));
  const previous30 = average(reviews.filter((r) => inWindow(r, 60, 30)).map(reviewAverage));
  const averages = reviews.map(reviewAverage);

  return {
    count: reviews.length,
    average: average(averages),
    last30,
    previous30,
    trend:
      previous30 > 0 && last30 > 0 ? ((last30 - previous30) / previous30) * 100 : null,
    perCriterion,
    positiveRate: averages.length
      ? (averages.filter((a) => a >= 4).length / averages.length) * 100
      : 0,
  };
}

export function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function monthlySeries(reviews: Review[], months = 6) {
  const out: { label: string; value: number; count: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const inMonth = reviews.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
    });
    out.push({
      label: ref.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', ''),
      value: average(inMonth.map(reviewAverage)),
      count: inMonth.length,
    });
  }
  return out;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function emptyScores(): Record<CriterionKey, number> {
  const scores = {} as Record<CriterionKey, number>;
  CRITERIA.forEach((c) => {
    scores[c.key] = 0;
  });
  return scores;
}

/**
 * Camada de dados da loja.
 *
 * Catálogo (editável pelos admins no HUB), carrinho e pedidos no localStorage,
 * expostos no mesmo formato de store do `data/reviews.ts`. Trocar por uma
 * API/Shopify é trocar só este arquivo.
 */

const CART_KEY = 'levita.cart.v1';
const PRODUCTS_KEY = 'levita.products.v1';
const ORDERS_KEY = 'levita.orders.v1';

export const FREE_SHIPPING_FROM = 60;
export const SHIPPING_PRICE = 4.9;

export const CATEGORIES = [
  { key: 'corpo', label: 'Corpo' },
  { key: 'rosto', label: 'Rosto' },
  { key: 'oleos', label: 'Óleos & Velas' },
  { key: 'acessorios', label: 'Acessórios' },
  { key: 'kits', label: 'Kits & Presentes' },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

/** Formas disponíveis em `ProductArt` — cada produto é desenhado em SVG. */
export type ArtShape =
  | 'bottle'
  | 'dropper'
  | 'tube'
  | 'jar'
  | 'candle'
  | 'roller'
  | 'guasha'
  | 'giftbox'
  | 'card';

export const ART_SHAPES: { key: ArtShape; label: string }[] = [
  { key: 'bottle', label: 'Frasco com válvula' },
  { key: 'dropper', label: 'Conta-gotas' },
  { key: 'tube', label: 'Bisnaga' },
  { key: 'jar', label: 'Pote' },
  { key: 'candle', label: 'Vela' },
  { key: 'roller', label: 'Rolo facial' },
  { key: 'guasha', label: 'Gua sha' },
  { key: 'giftbox', label: 'Caixa de presente' },
  { key: 'card', label: 'Vale / cartão' },
];

export interface ArtPalette {
  /** cor do fundo circular */
  bg: string;
  /** corpo da embalagem */
  body: string;
  /** tampa, válvula, detalhes */
  cap: string;
  /** rótulo */
  label: string;
}

export interface ProductOption {
  label: string;
  price: number;
}

export const BADGES = ['Mais vendido', 'Novo', 'Exclusivo Levitá', 'Edição limitada'] as const;

export interface Product {
  id: string;
  /** visível na loja */
  active: boolean;
  name: string;
  tagline: string;
  category: CategoryKey;
  price: number;
  /** preço "de" riscado, quando há promoção */
  compareAt?: number;
  /** tamanhos ou valores; o primeiro é o padrão */
  options?: ProductOption[];
  size: string;
  badge?: (typeof BADGES)[number];
  rating: number;
  reviewsCount: number;
  description: string;
  howTo: string;
  ingredients: string;
  /** tratamento da clínica que o produto complementa */
  pairsWith?: string;
  art: { shape: ArtShape; palette: ArtPalette };
}

const SEED_PRODUCTS: Omit<Product, 'active'>[] = [
  {
    id: 'oleo-drenante-redux',
    name: 'Óleo Drenante Redux',
    tagline: 'Cipreste, toranja e alecrim',
    category: 'oleos',
    price: 26,
    size: '100 ml',
    options: [
      { label: '100 ml', price: 26 },
      { label: '250 ml', price: 52 },
    ],
    badge: 'Exclusivo Levitá',
    rating: 4.9,
    reviewsCount: 128,
    description:
      'O mesmo blend usado nas sessões do Método Redux Luxe, agora para a rotina em casa. Óleos essenciais de cipreste e toranja estimulam a circulação e ajudam a prolongar o efeito drenante entre as sessões.',
    howTo:
      'Aplique sobre a pele seca, com movimentos ascendentes dos tornozelos até a cintura. Use diariamente, de preferência após o banho.',
    ingredients:
      'Óleo de amêndoas doces, óleo de semente de uva, óleos essenciais de cipreste, toranja e alecrim, vitamina E.',
    pairsWith: 'Método Redux Luxe',
    art: { shape: 'bottle', palette: { bg: '#dfe7df', body: '#355a45', cap: '#c9a46a', label: '#f4ecde' } },
  },
  {
    id: 'oleo-relaxante-lavanda',
    name: 'Óleo de Massagem Relaxante',
    tagline: 'Lavanda e amêndoas doces',
    category: 'oleos',
    price: 24,
    size: '100 ml',
    badge: 'Mais vendido',
    rating: 4.8,
    reviewsCount: 214,
    description:
      'Textura sedosa que desliza sem pesar. A lavanda acalma o sistema nervoso e transforma qualquer massagem em casa num ritual de descanso.',
    howTo: 'Aqueça algumas gotas nas mãos e massageie com movimentos lentos e longos. Ideal antes de dormir.',
    ingredients: 'Óleo de amêndoas doces, óleo de jojoba, óleo essencial de lavanda, vitamina E.',
    pairsWith: 'Massagem Relaxante',
    art: { shape: 'bottle', palette: { bg: '#ebe3ef', body: '#8a7699', cap: '#e5d6b8', label: '#fbf7ee' } },
  },
  {
    id: 'creme-redutor-termoativo',
    name: 'Creme Redutor Termoativo',
    tagline: 'Cafeína, gengibre e centelha asiática',
    category: 'corpo',
    price: 34,
    size: '200 ml',
    badge: 'Mais vendido',
    rating: 4.7,
    reviewsCount: 96,
    description:
      'Ação térmica suave que ativa a microcirculação e ajuda a reduzir a aparência da celulite e da gordura localizada. Pele mais firme e lisa em 4 semanas de uso.',
    howTo:
      'Massageie nas áreas desejadas até a completa absorção, duas vezes ao dia. Lave as mãos após a aplicação e evite mucosas.',
    ingredients: 'Cafeína, extrato de gengibre, centelha asiática, L-carnitina, manteiga de karité.',
    pairsWith: 'Tratamento de Celulite',
    art: { shape: 'tube', palette: { bg: '#f7e3d9', body: '#e5b3a2', cap: '#b27865', label: '#fefaf2' } },
  },
  {
    id: 'gel-crio-pernas-leves',
    name: 'Gel Crioterápico Pernas Leves',
    tagline: 'Mentol, castanha-da-índia e hamamélis',
    category: 'corpo',
    price: 29,
    size: '150 ml',
    badge: 'Novo',
    rating: 4.8,
    reviewsCount: 41,
    description:
      'Efeito gelado imediato para pernas cansadas e inchadas. Complemento perfeito das sessões de drenagem e da aparatologia.',
    howTo: 'Aplique de baixo para cima, sem massagear demais. Guarde no frigorífico para potenciar o efeito.',
    ingredients: 'Mentol, extrato de castanha-da-índia, hamamélis, aloé vera, cânfora.',
    pairsWith: 'Drenagem Linfática',
    art: { shape: 'tube', palette: { bg: '#dde8e8', body: '#9ec1bd', cap: '#355a45', label: '#fefaf2' } },
  },
  {
    id: 'esfoliante-sal-rosa',
    name: 'Esfoliante Sal Rosa & Coco',
    tagline: 'Sal dos Himalaias e óleo de coco',
    category: 'corpo',
    price: 22,
    size: '250 g',
    rating: 4.6,
    reviewsCount: 73,
    description:
      'Remove células mortas e deixa a pele pronta para absorver os ativos dos cremes e óleos. Pele macia e luminosa desde a primeira aplicação.',
    howTo: 'Na pele húmida, massageie em movimentos circulares. Enxágue com água morna. Use 2 vezes por semana.',
    ingredients: 'Sal rosa dos Himalaias, óleo de coco, açúcar mascavado, óleo de rosa mosqueta.',
    art: { shape: 'jar', palette: { bg: '#f7e3d9', body: '#f0c9bc', cap: '#c98775', label: '#fefaf2' } },
  },
  {
    id: 'manteiga-karite',
    name: 'Manteiga Corporal Nutritiva',
    tagline: 'Karité, cacau e baunilha',
    category: 'corpo',
    price: 27,
    size: '200 g',
    rating: 4.9,
    reviewsCount: 88,
    description:
      'Hidratação profunda e duradoura com textura que derrete ao toque. Ideal para peles secas e para depois da esfoliação.',
    howTo: 'Aplique uma pequena quantidade após o banho, com a pele ainda ligeiramente húmida.',
    ingredients: 'Manteiga de karité, manteiga de cacau, óleo de macadâmia, extrato de baunilha.',
    art: { shape: 'jar', palette: { bg: '#efe6d6', body: '#e8d7b9', cap: '#7a6047', label: '#fefaf2' } },
  },
  {
    id: 'serum-firmador',
    name: 'Sérum Firmador Facial',
    tagline: 'Ácido hialurónico e peptídeos',
    category: 'rosto',
    price: 39,
    size: '30 ml',
    badge: 'Novo',
    rating: 4.8,
    reviewsCount: 52,
    description:
      'Preenche, hidrata e devolve o viço à pele. Fórmula leve, de rápida absorção, que prolonga os resultados dos tratamentos faciais da clínica.',
    howTo: 'Aplique 3 a 4 gotas no rosto limpo, de manhã e à noite, antes do creme hidratante.',
    ingredients: 'Ácido hialurónico de baixo e alto peso molecular, matrixyl, niacinamida, pantenol.',
    pairsWith: 'Limpeza de Pele',
    art: { shape: 'dropper', palette: { bg: '#f7e3d9', body: '#d99b88', cap: '#1f352a', label: '#fefaf2' } },
  },
  {
    id: 'vela-massagem-ambar',
    name: 'Vela de Massagem Âmbar',
    tagline: 'Âmbar, baunilha e sândalo',
    category: 'oleos',
    price: 28,
    size: '120 g',
    badge: 'Edição limitada',
    rating: 4.9,
    reviewsCount: 37,
    description:
      'Uma vela que vira óleo. Feita com ceras vegetais que derretem a uma temperatura agradável para a pele: acenda, deixe derreter e use na massagem.',
    howTo:
      'Acenda por 10 minutos, apague e verta o óleo morno nas mãos. Teste a temperatura antes de aplicar.',
    ingredients: 'Cera de soja, manteiga de karité, óleo de amêndoas doces, fragrância de âmbar e sândalo.',
    art: { shape: 'candle', palette: { bg: '#efe6d6', body: '#c9a46a', cap: '#f4ecde', label: '#1f352a' } },
  },
  {
    id: 'rolo-quartzo-rosa',
    name: 'Rolo de Quartzo Rosa',
    tagline: 'Massagem facial descongestionante',
    category: 'acessorios',
    price: 32,
    size: 'Pedra natural',
    rating: 4.7,
    reviewsCount: 64,
    description:
      'Desincha, relaxa a musculatura facial e potencia a absorção do sérum. A pedra fria ao toque é um ritual matinal de cinco minutos.',
    howTo: 'Role do centro do rosto para fora e de baixo para cima. Guarde no frigorífico para um efeito mais refrescante.',
    ingredients: 'Quartzo rosa natural, armação em latão dourado.',
    pairsWith: 'Limpeza de Pele',
    art: { shape: 'roller', palette: { bg: '#fbf1ec', body: '#f0c9bc', cap: '#c9a46a', label: '#fefaf2' } },
  },
  {
    id: 'gua-sha-jade',
    name: 'Gua Sha de Jade',
    tagline: 'Drenagem e contorno facial',
    category: 'acessorios',
    price: 25,
    size: 'Pedra natural',
    rating: 4.6,
    reviewsCount: 49,
    description:
      'Técnica milenar de drenagem que esculpe o contorno do rosto e alivia a tensão da mandíbula. Acompanha guia ilustrado de movimentos.',
    howTo: 'Com óleo ou sérum no rosto, deslize a pedra num ângulo de 15° em direção às orelhas e ao pescoço.',
    ingredients: 'Jade natural polido à mão.',
    art: { shape: 'guasha', palette: { bg: '#e5ebe5', body: '#7a9183', cap: '#4b7259', label: '#fefaf2' } },
  },
  {
    id: 'kit-redux-em-casa',
    name: 'Kit Ritual Redux em Casa',
    tagline: 'Óleo drenante + creme redutor + ventosa',
    category: 'kits',
    price: 79,
    compareAt: 92,
    size: '3 itens',
    badge: 'Exclusivo Levitá',
    rating: 5,
    reviewsCount: 31,
    description:
      'Tudo o que você precisa para manter os resultados do Método Redux Luxe entre as sessões, numa caixa de presente da Levitá. Inclui guia de automassagem.',
    howTo: 'Siga o guia incluído: 10 minutos por dia, 5 dias por semana, intercalando óleo e creme.',
    ingredients: 'Óleo Drenante Redux 100 ml, Creme Redutor Termoativo 200 ml, ventosa de silicone médico.',
    pairsWith: 'Método Redux Luxe',
    art: { shape: 'giftbox', palette: { bg: '#dfe7df', body: '#2a4937', cap: '#e5b3a2', label: '#f4ecde' } },
  },
  {
    id: 'vale-presente',
    name: 'Vale-Presente Levitá',
    tagline: 'Para usar em tratamentos ou produtos',
    category: 'kits',
    price: 50,
    size: 'Digital',
    options: [
      { label: '50 €', price: 50 },
      { label: '100 €', price: 100 },
      { label: '150 €', price: 150 },
      { label: '250 €', price: 250 },
    ],
    rating: 5,
    reviewsCount: 112,
    description:
      'O presente certo para quem merece uma pausa. Enviado por e-mail com uma mensagem personalizada e válido por 12 meses em qualquer tratamento ou produto da Levitá.',
    howTo: 'Após a compra, você recebe o vale em PDF. Basta apresentar o código no momento do agendamento.',
    ingredients: 'Vale digital, válido por 12 meses.',
    art: { shape: 'card', palette: { bg: '#f7e3d9', body: '#1f352a', cap: '#d99b88', label: '#f4ecde' } },
  },
];

/** paletas prontas para o editor de produtos do HUB */
export const ART_PALETTES: { label: string; palette: ArtPalette }[] = [
  { label: 'Verde Levitá', palette: { bg: '#dfe7df', body: '#355a45', cap: '#c9a46a', label: '#f4ecde' } },
  { label: 'Rosé', palette: { bg: '#f7e3d9', body: '#e5b3a2', cap: '#b27865', label: '#fefaf2' } },
  { label: 'Terracota', palette: { bg: '#f7e3d9', body: '#d99b88', cap: '#1f352a', label: '#fefaf2' } },
  { label: 'Lavanda', palette: { bg: '#ebe3ef', body: '#8a7699', cap: '#e5d6b8', label: '#fbf7ee' } },
  { label: 'Menta', palette: { bg: '#dde8e8', body: '#9ec1bd', cap: '#355a45', label: '#fefaf2' } },
  { label: 'Areia', palette: { bg: '#efe6d6', body: '#e8d7b9', cap: '#7a6047', label: '#fefaf2' } },
  { label: 'Âmbar', palette: { bg: '#efe6d6', body: '#c9a46a', cap: '#f4ecde', label: '#1f352a' } },
  { label: 'Floresta', palette: { bg: '#f7e3d9', body: '#1f352a', cap: '#d99b88', label: '#f4ecde' } },
];

export function productById(id: string | undefined): Product | undefined {
  return state.products.find((p) => p.id === id);
}

export function priceFor(product: Product, option?: string): number {
  return product.options?.find((o) => o.label === option)?.price ?? product.price;
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

/* ---------- carrinho e pedidos ---------- */

export interface CartItem {
  productId: string;
  option?: string;
  qty: number;
}

export type OrderStatus = 'novo' | 'enviado' | 'concluido' | 'cancelado';

export const ORDER_STATUS: { key: OrderStatus; label: string }[] = [
  { key: 'novo', label: 'Novo' },
  { key: 'enviado', label: 'Enviado / pronto' },
  { key: 'concluido', label: 'Concluído' },
  { key: 'cancelado', label: 'Cancelado' },
];

export interface Order {
  number: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  name: string;
  email: string;
  delivery: 'envio' | 'clinica';
  payment: 'mbway' | 'cartao' | 'multibanco';
  status: OrderStatus;
  createdAt: string;
}

export interface ShopState {
  products: Product[];
  cart: CartItem[];
  lastOrder: Order | null;
  orders: Order[];
}

/* ---------- seed ---------- */

function seedProducts(): Product[] {
  return SEED_PRODUCTS.map((p) => ({ ...p, active: true }));
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED_BUYERS = [
  'Beatriz Martins', 'Carla Sousa', 'Inês Ferreira', 'Rita Pinto', 'Joana Lopes',
  'Sofia Almeida', 'Mariana Costa', 'Patrícia Rocha', 'Helena Teixeira', 'Cátia Batista',
  'Daniela Vieira', 'Filipa Nunes', 'Andreia Gomes', 'Vera Moreira', 'Luísa Dias',
];

/** ~3 meses de pedidos de exemplo, determinísticos, para o dashboard */
function seedOrders(products: Product[]): Order[] {
  const rand = mulberry32(2026);
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
  const day = 86_400_000;
  const now = Date.now();
  const orders: Order[] = [];
  // os mais vendidos aparecem mais vezes
  const weighted = products.flatMap((p) => Array(p.badge === 'Mais vendido' ? 4 : p.badge ? 2 : 1).fill(p));

  for (let i = 0; i < 64; i++) {
    // mais pedidos nas semanas recentes: a loja "a crescer" desde o lançamento
    const age = Math.floor(Math.pow(rand(), 1.5) * 90);
    const items: CartItem[] = [];
    const lines = 1 + Math.floor(rand() * 2.4);
    for (let l = 0; l < lines; l++) {
      const product = pick(weighted);
      if (items.some((x) => x.productId === product.id)) continue;
      items.push({ productId: product.id, option: product.options?.[0].label, qty: rand() > 0.85 ? 2 : 1 });
    }
    const subtotal = items.reduce((sum, it) => {
      const product = products.find((p) => p.id === it.productId)!;
      return sum + priceFor(product, it.option) * it.qty;
    }, 0);
    const delivery: Order['delivery'] = rand() > 0.4 ? 'envio' : 'clinica';
    const shipping = shippingFor(subtotal, delivery);
    const name = pick(SEED_BUYERS);
    orders.push({
      number: `LV-${(104200 + i * 7).toString()}`,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      name,
      email: `${name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@exemplo.pt`,
      delivery,
      payment: pick(['mbway', 'mbway', 'cartao', 'multibanco'] as const),
      status: age < 3 ? 'novo' : age < 7 ? 'enviado' : rand() > 0.95 ? 'cancelado' : 'concluido',
      createdAt: new Date(now - age * day - Math.floor(rand() * day)).toISOString(),
    });
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ---------- store ---------- */

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* modo privado / storage cheio: seguimos só em memória */
  }
}

function load(): ShopState {
  const storedProducts = read<Product[]>(PRODUCTS_KEY);
  const products = Array.isArray(storedProducts) && storedProducts.length ? storedProducts : seedProducts();
  const exists = (id: string) => products.some((p) => p.id === id);

  const storedCart = read<{ cart?: CartItem[]; lastOrder?: Order | null }>(CART_KEY);
  const cart = Array.isArray(storedCart?.cart)
    ? storedCart!.cart.filter((i) => exists(i.productId) && i.qty > 0)
    : [];

  const storedOrders = read<Order[]>(ORDERS_KEY);
  const orders = Array.isArray(storedOrders) ? storedOrders : seedOrders(products);

  return { products, cart, lastOrder: storedCart?.lastOrder ?? null, orders };
}

let state: ShopState = load();
const listeners = new Set<() => void>();

function commit(next: ShopState) {
  if (next.products !== state.products) write(PRODUCTS_KEY, next.products);
  if (next.orders !== state.orders) write(ORDERS_KEY, next.orders);
  if (next.cart !== state.cart || next.lastOrder !== state.lastOrder) {
    write(CART_KEY, { cart: next.cart, lastOrder: next.lastOrder });
  }
  state = next;
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getState(): ShopState {
  return state;
}

/* ---------- carrinho ---------- */

const sameLine = (a: CartItem, productId: string, option?: string) =>
  a.productId === productId && a.option === option;

export function addToCart(productId: string, option?: string, qty = 1) {
  const exists = state.cart.some((i) => sameLine(i, productId, option));
  const cart = exists
    ? state.cart.map((i) => (sameLine(i, productId, option) ? { ...i, qty: i.qty + qty } : i))
    : [...state.cart, { productId, option, qty }];
  commit({ ...state, cart });
}

export function setQty(productId: string, option: string | undefined, qty: number) {
  const cart =
    qty <= 0
      ? state.cart.filter((i) => !sameLine(i, productId, option))
      : state.cart.map((i) => (sameLine(i, productId, option) ? { ...i, qty } : i));
  commit({ ...state, cart });
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

export function cartSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => {
    const product = productById(i.productId);
    return product ? sum + priceFor(product, i.option) * i.qty : sum;
  }, 0);
}

export function shippingFor(subtotal: number, delivery: Order['delivery']): number {
  if (delivery === 'clinica' || subtotal >= FREE_SHIPPING_FROM || subtotal === 0) return 0;
  return SHIPPING_PRICE;
}

export function placeOrder(
  input: Pick<Order, 'name' | 'email' | 'delivery' | 'payment'>,
): Order {
  const subtotal = cartSubtotal(state.cart);
  const shipping = shippingFor(subtotal, input.delivery);
  const order: Order = {
    ...input,
    number: `LV-${Date.now().toString().slice(-6)}`,
    items: state.cart,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: 'novo',
    createdAt: new Date().toISOString(),
  };
  commit({ ...state, cart: [], lastOrder: order, orders: [order, ...state.orders] });
  return order;
}

/* ---------- gestão (HUB) ---------- */

export function setOrderStatus(number: string, status: OrderStatus) {
  commit({ ...state, orders: state.orders.map((o) => (o.number === number ? { ...o, status } : o)) });
}

function slug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** cria (sem `id`) ou atualiza um produto */
export function saveProduct(input: Omit<Product, 'id'> & { id?: string }): Product {
  if (input.id && state.products.some((p) => p.id === input.id)) {
    const product = input as Product;
    commit({ ...state, products: state.products.map((p) => (p.id === product.id ? product : p)) });
    return product;
  }
  let id = slug(input.name) || `produto-${Date.now().toString(36)}`;
  if (state.products.some((p) => p.id === id)) id = `${id}-${Date.now().toString(36)}`;
  const product: Product = { ...input, id };
  commit({ ...state, products: [product, ...state.products] });
  return product;
}

export function toggleProduct(id: string) {
  commit({ ...state, products: state.products.map((p) => (p.id === id ? { ...p, active: !p.active } : p)) });
}

export function removeProduct(id: string) {
  commit({
    ...state,
    products: state.products.filter((p) => p.id !== id),
    cart: state.cart.filter((i) => i.productId !== id),
  });
}

export function resetShop() {
  const products = seedProducts();
  commit({ products, cart: [], lastOrder: null, orders: seedOrders(products) });
}

/* ---------- derivados (dashboard) ---------- */

export function ordersBetween(orders: Order[], fromDaysAgo: number, toDaysAgo = 0) {
  const day = 86_400_000;
  const now = Date.now();
  return orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return o.status !== 'cancelado' && t >= now - fromDaysAgo * day && t < now - toDaysAgo * day;
  });
}

export function revenue(orders: Order[]): number {
  return orders.reduce((sum, o) => sum + o.total, 0);
}

/** receita por semana, da mais antiga para a atual */
export function weeklyRevenue(orders: Order[], weeks = 8) {
  return Array.from({ length: weeks }, (_, i) => {
    const w = weeks - 1 - i;
    const inWeek = ordersBetween(orders, (w + 1) * 7, w * 7);
    return { label: w === 0 ? 'Atual' : `-${w}s`, value: revenue(inWeek), count: inWeek.length };
  });
}

export function topProducts(orders: Order[], limit = 5) {
  const units = new Map<string, number>();
  orders
    .filter((o) => o.status !== 'cancelado')
    .forEach((o) => o.items.forEach((i) => units.set(i.productId, (units.get(i.productId) ?? 0) + i.qty)));
  return [...units.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, qty]) => ({ product: productById(id), qty }))
    .filter((x): x is { product: Product; qty: number } => Boolean(x.product));
}

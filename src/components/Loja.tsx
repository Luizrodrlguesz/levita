import { useEffect, useMemo, useRef, useState } from 'react';
import ProductArt from './ProductArt';
import Stars from './Stars';
import useShop from '../hooks/useShop';
import { navigate } from '../hooks/useRoute';
import {
  CATEGORIES,
  FREE_SHIPPING_FROM,
  SHIPPING_PRICE,
  addToCart,
  cartCount,
  cartSubtotal,
  formatEuro,
  placeOrder,
  priceFor,
  productById,
  setQty,
  shippingFor,
  type CategoryKey,
  type Order,
  type Product,
} from '../data/shop';

interface LojaProps {
  /** `undefined` → catálogo · `carrinho` · `pedido` · id do produto */
  param?: string;
}

type Notify = (message: string) => void;

export default function Loja({ param }: LojaProps) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number>();

  const notify: Notify = (message) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);
  // o aviso pertence à tela onde o produto foi adicionado
  useEffect(() => setToast(null), [param]);

  let page: JSX.Element;
  const visible = productById(param);
  if (!param) page = <Catalog notify={notify} />;
  else if (param === 'carrinho') page = <Cart />;
  else if (param === 'pedido') page = <OrderDone />;
  else {
    page =
      visible?.active ? <ProductPage key={visible.id} product={visible} notify={notify} /> : <NotFound />;
  }

  return (
    <section className="shop">
      {page}
      <div className={`shop-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        <span>{toast}</span>
        <a href="#/loja/carrinho">Ver sacola</a>
      </div>
    </section>
  );
}

/* ---------------- catálogo ---------------- */

const SORTS = [
  { key: 'destaques', label: 'Destaques' },
  { key: 'menor', label: 'Menor preço' },
  { key: 'maior', label: 'Maior preço' },
  { key: 'avaliados', label: 'Mais bem avaliados' },
] as const;
type SortKey = (typeof SORTS)[number]['key'];

const PERKS = [
  {
    title: `Envio grátis acima de ${formatEuro(FREE_SHIPPING_FROM)}`,
    text: 'Para todo Portugal continental, em 1 a 3 dias úteis.',
    icon: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z',
  },
  {
    title: 'Levante na clínica',
    text: 'Compre online e retire na sua próxima sessão, sem custo.',
    icon: 'M4 10l8-6 8 6v10H4zM10 20v-6h4v6',
  },
  {
    title: 'As fórmulas dos tratamentos',
    text: 'Os mesmos ativos que usamos na maca, pensados para casa.',
    icon: 'M12 3c4 4 6 7 6 10a6 6 0 01-12 0c0-3 2-6 6-10z',
  },
  {
    title: 'MB WAY, cartão ou Multibanco',
    text: 'Pagamento seguro e confirmação imediata por e-mail.',
    icon: 'M3 6h18v12H3zM3 10h18M7 15h4',
  },
];

function Catalog({ notify }: { notify: Notify }) {
  const { products: all } = useShop();
  const [category, setCategory] = useState<CategoryKey | 'todos'>('todos');
  const [sort, setSort] = useState<SortKey>('destaques');

  const products = useMemo(() => {
    const list = all.filter((p) => p.active && (category === 'todos' || p.category === category));
    if (sort === 'menor') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'maior') return [...list].sort((a, b) => b.price - a.price);
    if (sort === 'avaliados') return [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [all, category, sort]);

  // vitrine do topo: os três primeiros com selo, completando com o resto
  const live = all.filter((p) => p.active);
  const showcase = [...live.filter((p) => p.badge), ...live.filter((p) => !p.badge)].slice(0, 3);

  return (
    <>
      <div className="shop-hero">
        <div className="container shop-hero__inner">
          <div className="shop-hero__copy reveal">
            <div className="eyebrow">Loja Levitá</div>
            <h1 className="shop-hero__title serif">
              O ritual da clínica, <span className="it">em casa</span>
            </h1>
            <p className="shop-hero__lead">
              Óleos, cremes e acessórios escolhidos pela nossa equipa para prolongar os
              resultados de cada sessão — com a mesma assinatura sensorial da Levitá.
            </p>
            <div className="shop-hero__actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setCategory('kits');
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Ver kits e presentes
              </button>
              <a className="btn-ghost" href="#/loja/vale-presente">
                Oferecer um vale-presente
              </a>
            </div>
          </div>
          <div className="shop-hero__art reveal">
            {showcase.map((p, i) => (
              <a key={p.id} href={`#/loja/${p.id}`} className={`shop-hero__piece shop-hero__piece--${i}`}>
                <ProductArt shape={p.art.shape} palette={p.art.palette} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <ul className="shop-perks">
          {PERKS.map((perk) => (
            <li key={perk.title}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={perk.icon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <div>
                <strong>{perk.title}</strong>
                <span>{perk.text}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="shop-toolbar" id="catalogo">
          <div className="shop-filters" role="tablist">
            <button
              type="button"
              className={`shop-filter ${category === 'todos' ? 'is-active' : ''}`}
              onClick={() => setCategory('todos')}
            >
              Todos
            </button>
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.key}
                className={`shop-filter ${category === c.key ? 'is-active' : ''}`}
                onClick={() => setCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label className="shop-sort">
            <span>Ordenar</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="shop-count">
          {products.length} {products.length === 1 ? 'produto' : 'produtos'}
        </p>

        <div className="shop-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} notify={notify} />
          ))}
        </div>

        <aside className="shop-cta">
          <div>
            <div className="eyebrow">Ritual personalizado</div>
            <h2 className="serif">Não sabe por onde começar?</h2>
            <p>
              Fale com a nossa equipa: indicamos a rotina ideal para o seu objetivo e o
              tratamento que estiver a fazer na clínica.
            </p>
          </div>
          <a className="btn-primary" href="https://wa.me/351920129484" target="_blank" rel="noreferrer">
            Falar no WhatsApp
          </a>
        </aside>
      </div>
    </>
  );
}

function categoryLabel(key: CategoryKey) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? '';
}

function Price({ product, option }: { product: Product; option?: string }) {
  const price = priceFor(product, option);
  return (
    <span className="shop-price">
      {product.options && !option && <em>a partir de </em>}
      <strong>{formatEuro(price)}</strong>
      {product.compareAt && <s>{formatEuro(product.compareAt)}</s>}
    </span>
  );
}

function ProductCard({ product, notify }: { product: Product; notify: Notify }) {
  return (
    <article className="product-card">
      <a href={`#/loja/${product.id}`} className="product-card__media">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <ProductArt shape={product.art.shape} palette={product.art.palette} />
      </a>
      <div className="product-card__body">
        <span className="product-card__cat">{categoryLabel(product.category)}</span>
        <h3 className="serif">
          <a href={`#/loja/${product.id}`}>{product.name}</a>
        </h3>
        <p className="product-card__tagline">{product.tagline}</p>
        <div className="product-card__rating">
          <Stars value={product.rating} size="sm" />
          <span>({product.reviewsCount})</span>
        </div>
        <div className="product-card__foot">
          <Price product={product} />
          <button
            type="button"
            className="product-card__add"
            aria-label={`Adicionar ${product.name} à sacola`}
            onClick={() => {
              addToCart(product.id, product.options?.[0].label);
              notify(`${product.name} foi para a sacola`);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------- página de produto ---------------- */

const DETAIL_TABS = [
  { key: 'description', label: 'Descrição' },
  { key: 'howTo', label: 'Como usar' },
  { key: 'ingredients', label: 'Composição' },
] as const;

function ProductPage({ product, notify }: { product: Product; notify: Notify }) {
  const [option, setOption] = useState(product.options?.[0].label);
  const [qty, setQtyLocal] = useState(1);
  const [tab, setTab] = useState<(typeof DETAIL_TABS)[number]['key']>('description');

  const { products } = useShop();
  const related = products
    .filter((p) => p.active && p.id !== product.id)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4);

  return (
    <div className="container shop-detail">
      <nav className="shop-crumbs">
        <a href="#/loja">Loja</a>
        <span>/</span>
        <span>{categoryLabel(product.category)}</span>
        <span>/</span>
        <span className="is-current">{product.name}</span>
      </nav>

      <div className="shop-detail__grid">
        <div className="shop-detail__media">
          {product.badge && <span className="product-badge">{product.badge}</span>}
          <ProductArt shape={product.art.shape} palette={product.art.palette} />
        </div>

        <div className="shop-detail__info">
          <span className="product-card__cat">{categoryLabel(product.category)}</span>
          <h1 className="serif">{product.name}</h1>
          <p className="shop-detail__tagline">{product.tagline}</p>
          <div className="product-card__rating">
            <Stars value={product.rating} size="sm" />
            <span>
              {product.rating.toFixed(1)} · {product.reviewsCount} avaliações
            </span>
          </div>

          <div className="shop-detail__price">
            <Price product={product} option={option ?? product.size} />
            {!product.options && <span className="shop-detail__size">{product.size}</span>}
          </div>

          {product.options && (
            <div className="shop-options">
              <span className="field__label">
                {product.category === 'kits' ? 'Valor' : 'Tamanho'}
              </span>
              <div>
                {product.options.map((o) => (
                  <button
                    type="button"
                    key={o.label}
                    className={`shop-option ${option === o.label ? 'is-active' : ''}`}
                    onClick={() => setOption(o.label)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="shop-buy">
            <Qty value={qty} onChange={setQtyLocal} />
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                addToCart(product.id, option, qty);
                notify(`${qty}× ${product.name} na sacola`);
              }}
            >
              Adicionar à sacola · {formatEuro(priceFor(product, option) * qty)}
            </button>
          </div>

          {product.pairsWith && (
            <div className="shop-pairs">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3c4 4 6 7 6 10a6 6 0 01-12 0c0-3 2-6 6-10z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <p>
                Complementa o tratamento <strong>{product.pairsWith}</strong>.{' '}
                <a href="#tratamentos">Conhecer na clínica →</a>
              </p>
            </div>
          )}

          <div className="shop-tabs">
            <div className="shop-tabs__nav">
              {DETAIL_TABS.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  className={tab === t.key ? 'is-active' : ''}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p>{product[tab]}</p>
          </div>
        </div>
      </div>

      <div className="shop-related">
        <h2 className="serif">Combina com</h2>
        <div className="shop-grid">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} notify={notify} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Qty({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="qty">
      <button type="button" aria-label="Diminuir" onClick={() => onChange(Math.max(1, value - 1))}>
        −
      </button>
      <span>{value}</span>
      <button type="button" aria-label="Aumentar" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

/* ---------------- sacola + checkout ---------------- */

const PAYMENTS: { key: Order['payment']; label: string; hint: string }[] = [
  { key: 'mbway', label: 'MB WAY', hint: 'Confirme no telemóvel' },
  { key: 'cartao', label: 'Cartão', hint: 'Visa · Mastercard' },
  { key: 'multibanco', label: 'Multibanco', hint: 'Referência por e-mail' },
];

function Cart() {
  const { cart } = useShop();
  const [delivery, setDelivery] = useState<Order['delivery']>('envio');
  const [payment, setPayment] = useState<Order['payment']>('mbway');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', zip: '', city: '' });
  const [error, setError] = useState('');

  const subtotal = cartSubtotal(cart);
  const shipping = shippingFor(subtotal, delivery);
  const missing = Math.max(0, FREE_SHIPPING_FROM - subtotal);

  if (cart.length === 0) {
    return (
      <div className="container shop-empty">
        <div className="shop-empty__icon">
          <BagIcon />
        </div>
        <h1 className="serif">A sua sacola está vazia</h1>
        <p>Descubra os produtos que levam a experiência da Levitá para casa.</p>
        <a className="btn-primary" href="#/loja">
          Ir para a loja
        </a>
      </div>
    );
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof typeof form)[] =
      delivery === 'envio' ? ['name', 'email', 'phone', 'address', 'zip', 'city'] : ['name', 'email', 'phone'];
    if (required.some((k) => !form[k].trim())) {
      setError('Preencha os campos obrigatórios para finalizar.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Confira o e-mail informado.');
      return;
    }
    placeOrder({ name: form.name.trim(), email: form.email.trim(), delivery, payment });
    navigate('/loja/pedido');
  };

  return (
    <div className="container shop-checkout">
      <a className="rate__back" href="#/loja">
        ← Continuar a comprar
      </a>
      <h1 className="serif shop-checkout__title">Sacola</h1>

      <div className="shop-checkout__grid">
        <div className="stack">
          <div className="hub-card">
            <ul className="cart-list">
              {cart.map((item) => {
                const product = productById(item.productId);
                if (!product) return null;
                const unit = priceFor(product, item.option);
                return (
                  <li key={`${item.productId}-${item.option ?? ''}`}>
                    <a href={`#/loja/${product.id}`} className="cart-list__art">
                      <ProductArt shape={product.art.shape} palette={product.art.palette} />
                    </a>
                    <div className="cart-list__info">
                      <strong>{product.name}</strong>
                      <span>{item.option ?? product.size}</span>
                      <button type="button" className="link-arrow" onClick={() => setQty(item.productId, item.option, 0)}>
                        Remover
                      </button>
                    </div>
                    <Qty value={item.qty} onChange={(v) => setQty(item.productId, item.option, v)} />
                    <strong className="cart-list__total">{formatEuro(unit * item.qty)}</strong>
                  </li>
                );
              })}
            </ul>
          </div>

          <form className="hub-card stack" onSubmit={submit} noValidate>
            <h2 className="serif shop-checkout__h2">Dados e entrega</h2>
            <div className="new-review__cols">
              <label className="field">
                <span className="field__label">Nome completo *</span>
                <input value={form.name} onChange={set('name')} autoComplete="name" />
              </label>
              <label className="field">
                <span className="field__label">E-mail *</span>
                <input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              </label>
              <label className="field">
                <span className="field__label">Telemóvel *</span>
                <input value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+351" />
              </label>
            </div>

            <div className="choice-row">
              <Choice
                active={delivery === 'envio'}
                onClick={() => setDelivery('envio')}
                title="Envio CTT"
                hint={subtotal >= FREE_SHIPPING_FROM ? 'Grátis · 1 a 3 dias úteis' : `${formatEuro(SHIPPING_PRICE)} · 1 a 3 dias úteis`}
              />
              <Choice
                active={delivery === 'clinica'}
                onClick={() => setDelivery('clinica')}
                title="Levantar na clínica"
                hint="Grátis · pronto em 24h"
              />
            </div>

            {delivery === 'envio' && (
              <div className="new-review__cols">
                <label className="field field--grow">
                  <span className="field__label">Morada *</span>
                  <input value={form.address} onChange={set('address')} autoComplete="street-address" />
                </label>
                <label className="field">
                  <span className="field__label">Código postal *</span>
                  <input value={form.zip} onChange={set('zip')} autoComplete="postal-code" placeholder="0000-000" />
                </label>
                <label className="field">
                  <span className="field__label">Localidade *</span>
                  <input value={form.city} onChange={set('city')} autoComplete="address-level2" />
                </label>
              </div>
            )}

            <h2 className="serif shop-checkout__h2">Pagamento</h2>
            <div className="choice-row">
              {PAYMENTS.map((p) => (
                <Choice key={p.key} active={payment === p.key} onClick={() => setPayment(p.key)} title={p.label} hint={p.hint} />
              ))}
            </div>

            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary btn-block">
              Finalizar compra · {formatEuro(subtotal + shipping)}
            </button>
            <p className="form-hint">Ambiente de demonstração — nenhum pagamento é processado.</p>
          </form>
        </div>

        <aside className="hub-card shop-summary">
          <h2 className="serif shop-checkout__h2">Resumo</h2>
          {delivery === 'envio' && (
            <div className="ship-meter">
              <p>
                {missing > 0 ? (
                  <>
                    Faltam <strong>{formatEuro(missing)}</strong> para o envio grátis
                  </>
                ) : (
                  <>Você ganhou envio grátis ✦</>
                )}
              </p>
              <div className="ship-meter__track">
                <div style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%` }} />
              </div>
            </div>
          )}
          <dl className="shop-summary__rows">
            <div>
              <dt>Subtotal ({cartCount(cart)} itens)</dt>
              <dd>{formatEuro(subtotal)}</dd>
            </div>
            <div>
              <dt>Entrega</dt>
              <dd>{shipping === 0 ? 'Grátis' : formatEuro(shipping)}</dd>
            </div>
            <div className="is-total">
              <dt>Total</dt>
              <dd>{formatEuro(subtotal + shipping)}</dd>
            </div>
          </dl>
          <p className="form-hint">IVA incluído à taxa legal em vigor.</p>
        </aside>
      </div>
    </div>
  );
}

function Choice({
  active,
  onClick,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button type="button" className={`choice ${active ? 'is-active' : ''}`} onClick={onClick} aria-pressed={active}>
      <span className="choice__dot" />
      <span>
        <strong>{title}</strong>
        <em>{hint}</em>
      </span>
    </button>
  );
}

/* ---------------- confirmação ---------------- */

const PAYMENT_NEXT: Record<Order['payment'], string> = {
  mbway: 'Enviámos um pedido de pagamento MB WAY para o seu telemóvel.',
  cartao: 'O pagamento por cartão foi aprovado.',
  multibanco: 'A referência Multibanco foi enviada para o seu e-mail e é válida por 48h.',
};

function OrderDone() {
  const { lastOrder } = useShop();
  if (!lastOrder) return <NotFound />;

  return (
    <div className="container shop-done">
      <div className="hub-card shop-done__card">
        <div className="rate-sent__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="eyebrow">Pedido {lastOrder.number}</div>
        <h1 className="serif">Obrigada, {lastOrder.name.split(' ')[0]}!</h1>
        <p>
          {PAYMENT_NEXT[lastOrder.payment]}{' '}
          {lastOrder.delivery === 'clinica'
            ? 'Avisamos por e-mail quando estiver pronto para levantar na clínica.'
            : `Enviaremos o código de rastreio para ${lastOrder.email}.`}
        </p>

        <ul className="shop-done__items">
          {lastOrder.items.map((item) => {
            const product = productById(item.productId);
            if (!product) return null;
            return (
              <li key={`${item.productId}-${item.option ?? ''}`}>
                <div className="cart-list__art">
                  <ProductArt shape={product.art.shape} palette={product.art.palette} />
                </div>
                <span>
                  {item.qty}× {product.name}
                  {item.option && <em> · {item.option}</em>}
                </span>
                <strong>{formatEuro(priceFor(product, item.option) * item.qty)}</strong>
              </li>
            );
          })}
        </ul>
        <div className="shop-done__total">
          <span>Total pago</span>
          <strong>{formatEuro(lastOrder.total)}</strong>
        </div>

        <div className="rate-sent__actions">
          <a className="btn-primary" href="#/loja">
            Voltar à loja
          </a>
          <a className="btn-ghost" href="https://wa.me/351920129484" target="_blank" rel="noreferrer">
            Agendar uma sessão
          </a>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container shop-empty">
      <h1 className="serif">Produto não encontrado</h1>
      <p>Talvez ele tenha saído da vitrine. Veja o que temos hoje na loja.</p>
      <a className="btn-primary" href="#/loja">
        Ir para a loja
      </a>
    </div>
  );
}

export function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

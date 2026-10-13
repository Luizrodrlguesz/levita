import { useMemo, useState } from 'react';
import useShop from '../../hooks/useShop';
import ProductArt from '../ProductArt';
import {
  ART_PALETTES,
  ART_SHAPES,
  BADGES,
  CATEGORIES,
  formatEuro,
  removeProduct,
  saveProduct,
  toggleProduct,
  type CategoryKey,
  type Product,
} from '../../data/shop';
import { navigate } from '../../hooks/useRoute';
import { ActionsMenu, Card, Crumbs } from './ui';

type Draft = Omit<Product, 'id'> & { id?: string };

const BLANK: Draft = {
  active: true,
  name: '',
  tagline: '',
  category: 'corpo',
  price: 0,
  size: '',
  rating: 5,
  reviewsCount: 0,
  description: '',
  howTo: '',
  ingredients: '',
  art: { shape: 'bottle', palette: ART_PALETTES[0].palette },
};

export default function HubProducts({ sub }: { sub?: string }) {
  const { products } = useShop();
  if (sub === 'novo') return <ProductEditor key="novo" draft={BLANK} />;
  if (sub) {
    const product = products.find((p) => p.id === sub);
    return product ? <ProductEditor key={product.id} draft={product} /> : <Missing />;
  }
  return <ProductList />;
}

function Missing() {
  return (
    <Card>
      <div className="panel-empty">
        Produto não encontrado. <a href="#/hub/produtos">Voltar aos produtos</a>
      </div>
    </Card>
  );
}

function ProductList() {
  const { products, orders } = useShop();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryKey | 'todas'>('todas');

  const sold = useMemo(() => {
    const map = new Map<string, number>();
    orders
      .filter((o) => o.status !== 'cancelado')
      .forEach((o) => o.items.forEach((i) => map.set(i.productId, (map.get(i.productId) ?? 0) + i.qty)));
    return map;
  }, [orders]);

  const list = products.filter(
    (p) =>
      (category === 'todas' || p.category === category) &&
      `${p.name} ${p.tagline}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Card
      title="Catálogo"
      aside={
        <a className="btn-primary btn-sm" href="#/hub/produtos/novo">
          + Novo produto
        </a>
      }
    >
      <div className="filters">
        <label className="field field--inline">
          <span className="field__label">Categoria</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as CategoryKey | 'todas')}>
            <option value="todas">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--inline field--grow">
          <span className="field__label">Buscar</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome do produto" />
        </label>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Vendidos</th>
              <th>Status</th>
              <th className="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className={p.active ? '' : 'is-off'}>
                <td>
                  <a className="cell-person cell-link" href={`#/hub/produtos/${p.id}`}>
                    <span className="cell-art">
                      <ProductArt shape={p.art.shape} palette={p.art.palette} />
                    </span>
                    <div>
                      <strong>{p.name}</strong>
                      <span>
                        {p.size}
                        {p.badge && ` · ${p.badge}`}
                      </span>
                    </div>
                  </a>
                </td>
                <td>{CATEGORIES.find((c) => c.key === p.category)?.label}</td>
                <td>
                  <strong>{formatEuro(p.price)}</strong>
                  {p.compareAt && <s className="hub-card__count"> {formatEuro(p.compareAt)}</s>}
                </td>
                <td>{sold.get(p.id) ?? 0}</td>
                <td>
                  <span className={`status ${p.active ? 'status--publicada' : 'status--oculta'}`}>
                    {p.active ? 'Na loja' : 'Oculto'}
                  </span>
                </td>
                <td className="col-actions">
                  <ActionsMenu
                    label={p.name}
                    actions={[
                      { label: 'Editar', onSelect: () => navigate(`/hub/produtos/${p.id}`) },
                      { label: 'Ver na loja', onSelect: () => {}, href: `#/loja/${p.id}` },
                      { label: p.active ? 'Ocultar da loja' : 'Mostrar na loja', onSelect: () => toggleProduct(p.id) },
                      {
                        label: 'Remover',
                        confirm: 'Confirmar remoção',
                        danger: true,
                        onSelect: () => removeProduct(p.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <div className="panel-empty">Nenhum produto com esses filtros.</div>}
    </Card>
  );
}

function ProductEditor({ draft }: { draft: Draft }) {
  const [p, setP] = useState<Draft>(draft);
  const [error, setError] = useState('');
  const isNew = !draft.id;
  const back = () => navigate('/hub/produtos');

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setP((d) => ({ ...d, [key]: value }));
  const money = (v: string) => Math.max(0, Number(v.replace(',', '.')) || 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // com variações, o menor preço vira o "a partir de" do catálogo
    const options = p.options?.filter((o) => o.label.trim() && o.price > 0);
    const price = options?.length ? Math.min(...options.map((o) => o.price)) : p.price;
    if (!p.name.trim()) return setError('Dê um nome ao produto.');
    if (price <= 0) return setError('Informe um preço maior que zero.');
    if (p.compareAt && p.compareAt <= price) return setError('O preço "de" precisa ser maior que o preço atual.');
    saveProduct({
      ...p,
      name: p.name.trim(),
      options: options?.length ? options : undefined,
      price,
      compareAt: p.compareAt || undefined,
      badge: p.badge || undefined,
    });
    back();
  }

  return (
    <>
      <Crumbs to="#/hub/produtos" section="Produtos" page={isNew ? 'Novo produto' : draft.name} />
      <form className="dash-grid dash-grid--editor" onSubmit={submit} noValidate>
        <Card title="Informações">
          <div className="stack">
            <div className="new-review__cols">
              <label className="field field--grow">
                <span className="field__label">Nome</span>
                <input value={p.name} onChange={(e) => set('name', e.target.value)} />
              </label>
              <label className="field">
                <span className="field__label">Categoria</span>
                <select value={p.category} onChange={(e) => set('category', e.target.value as CategoryKey)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span className="field__label">Subtítulo</span>
              <input value={p.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Ativos principais ou benefício" />
            </label>
            <div className="new-review__cols">
              <label className="field">
                <span className="field__label">{p.options?.length ? 'Preço (pelas variações)' : 'Preço (€)'}</span>
                <input
                  inputMode="decimal"
                  value={p.price || ''}
                  disabled={Boolean(p.options?.length)}
                  onChange={(e) => set('price', money(e.target.value))}
                />
              </label>
              <label className="field">
                <span className="field__label">Preço "de" (opcional)</span>
                <input inputMode="decimal" value={p.compareAt || ''} onChange={(e) => set('compareAt', money(e.target.value) || undefined)} />
              </label>
              <label className="field">
                <span className="field__label">Tamanho / formato</span>
                <input value={p.size} onChange={(e) => set('size', e.target.value)} placeholder="100 ml" />
              </label>
              <label className="field">
                <span className="field__label">Selo</span>
                <select value={p.badge ?? ''} onChange={(e) => set('badge', (e.target.value || undefined) as Draft['badge'])}>
                  <option value="">Sem selo</option>
                  {BADGES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <Options value={p.options ?? []} onChange={(o) => set('options', o)} />

            <label className="field">
              <span className="field__label">Descrição</span>
              <textarea rows={3} value={p.description} onChange={(e) => set('description', e.target.value)} />
            </label>
            <div className="new-review__cols">
              <label className="field">
                <span className="field__label">Como usar</span>
                <textarea rows={3} value={p.howTo} onChange={(e) => set('howTo', e.target.value)} />
              </label>
              <label className="field">
                <span className="field__label">Composição</span>
                <textarea rows={3} value={p.ingredients} onChange={(e) => set('ingredients', e.target.value)} />
              </label>
            </div>
            <label className="field">
              <span className="field__label">Complementa o tratamento (opcional)</span>
              <input value={p.pairsWith ?? ''} onChange={(e) => set('pairsWith', e.target.value || undefined)} placeholder="Método Redux Luxe" />
            </label>
            <label className="check">
              <input type="checkbox" checked={p.active} onChange={(e) => set('active', e.target.checked)} />
              <span>Visível na loja</span>
            </label>
          </div>
        </Card>

        <div className="stack">
          <Card title="Ilustração">
            <div className="art-preview">
              <ProductArt shape={p.art.shape} palette={p.art.palette} />
            </div>
            <span className="field__label">Formato</span>
            <div className="art-shapes">
              {ART_SHAPES.map((s) => (
                <button
                  type="button"
                  key={s.key}
                  className={p.art.shape === s.key ? 'is-active' : ''}
                  title={s.label}
                  aria-label={s.label}
                  onClick={() => set('art', { ...p.art, shape: s.key })}
                >
                  <ProductArt shape={s.key} palette={p.art.palette} />
                </button>
              ))}
            </div>
            <span className="field__label">Cores</span>
            <div className="art-palettes">
              {ART_PALETTES.map((pal) => (
                <button
                  type="button"
                  key={pal.label}
                  title={pal.label}
                  aria-label={pal.label}
                  className={p.art.palette.body === pal.palette.body && p.art.palette.bg === pal.palette.bg ? 'is-active' : ''}
                  style={{ background: `linear-gradient(135deg, ${pal.palette.bg} 50%, ${pal.palette.body} 50%)` }}
                  onClick={() => set('art', { ...p.art, palette: pal.palette })}
                />
              ))}
            </div>
            <p className="form-hint">Quando houver fotografia dos produtos, este bloco vira o upload das fotos.</p>
          </Card>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={back}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isNew ? 'Criar produto' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

function Options({
  value,
  onChange,
}: {
  value: { label: string; price: number }[];
  onChange: (v: { label: string; price: number }[]) => void;
}) {
  return (
    <div className="options-editor">
      <div className="options-editor__head">
        <span className="field__label">Variações (tamanhos ou valores)</span>
        <button type="button" className="chip" onClick={() => onChange([...value, { label: '', price: 0 }])}>
          + Variação
        </button>
      </div>
      {value.length === 0 && <p className="form-hint">Sem variações: o produto usa o preço acima.</p>}
      {value.map((o, i) => (
        <div className="options-editor__row" key={i}>
          <input
            placeholder="250 ml"
            value={o.label}
            onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
          />
          <input
            placeholder="Preço €"
            inputMode="decimal"
            value={o.price || ''}
            onChange={(e) =>
              onChange(value.map((x, j) => (j === i ? { ...x, price: Number(e.target.value.replace(',', '.')) || 0 } : x)))
            }
          />
          <button type="button" className="chip chip--ghost" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            Remover
          </button>
        </div>
      ))}
    </div>
  );
}

import { useMemo, useState } from 'react';
import useShop from '../../hooks/useShop';
import { navigate } from '../../hooks/useRoute';
import ProductArt from '../ProductArt';
import { formatDate } from '../../data/reviews';
import {
  ORDER_STATUS,
  formatEuro,
  priceFor,
  productById,
  setOrderStatus,
  type Order,
  type OrderStatus,
} from '../../data/shop';
import { ActionsMenu, Card, Crumbs } from './ui';

const PAYMENT: Record<Order['payment'], string> = {
  mbway: 'MB WAY',
  cartao: 'Cartão',
  multibanco: 'Multibanco',
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  novo: 'status--pendente',
  enviado: 'status--enviado',
  concluido: 'status--publicada',
  cancelado: 'status--oculta',
};

const statusLabel = (s: OrderStatus) => ORDER_STATUS.find((x) => x.key === s)?.label ?? s;

export default function HubOrders({ sub }: { sub?: string }) {
  const { orders } = useShop();
  if (sub) {
    const order = orders.find((o) => o.number === sub);
    return order ? (
      <OrderPage key={order.number} order={order} />
    ) : (
      <Card>
        <div className="panel-empty">
          Pedido não encontrado. <a href="#/hub/pedidos">Voltar aos pedidos</a>
        </div>
      </Card>
    );
  }
  return <OrderList />;
}

function OrderList() {
  const { orders } = useShop();
  const [status, setStatus] = useState<OrderStatus | 'todos'>('todos');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (status === 'todos' || o.status === status) &&
        (!q || `${o.number} ${o.name} ${o.email}`.toLowerCase().includes(q)),
    );
  }, [orders, status, query]);

  return (
    <Card title="Encomendas" aside={<span className="hub-card__count">{list.length} pedido(s)</span>}>
      <div className="filters">
        <div className="seg">
          {[{ key: 'todos' as const, label: 'Todos' }, ...ORDER_STATUS].map((s) => (
            <button
              type="button"
              key={s.key}
              className={status === s.key ? 'is-active' : ''}
              onClick={() => setStatus(s.key)}
            >
              {s.label}
              {s.key !== 'todos' && <em>{orders.filter((o) => o.status === s.key).length}</em>}
            </button>
          ))}
        </div>
        <label className="field field--inline field--grow">
          <span className="field__label">Buscar</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Número, cliente ou e-mail" />
        </label>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Entrega</th>
              <th>Pagamento</th>
              <th>Total</th>
              <th>Status</th>
              <th className="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.number}>
                <td>
                  <a className="cell-link order-cell" href={`#/hub/pedidos/${o.number}`}>
                    <strong>{o.number}</strong>
                    <span>{formatDate(o.createdAt)}</span>
                  </a>
                </td>
                <td>
                  {o.name}
                  <p className="cell-comment">{o.email}</p>
                </td>
                <td>{o.delivery === 'envio' ? 'Envio CTT' : 'Levantar na clínica'}</td>
                <td>{PAYMENT[o.payment]}</td>
                <td>
                  <strong>{formatEuro(o.total)}</strong>
                </td>
                <td>
                  <span className={`status ${STATUS_CLASS[o.status]}`}>{statusLabel(o.status)}</span>
                </td>
                <td className="col-actions">
                  <ActionsMenu
                    label={`pedido ${o.number}`}
                    actions={[{ label: 'Abrir e editar', onSelect: () => navigate(`/hub/pedidos/${o.number}`) }]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <div className="panel-empty">Nenhum pedido com esses filtros.</div>}
    </Card>
  );
}

function OrderPage({ order: o }: { order: Order }) {
  const [status, setStatus] = useState<OrderStatus>(o.status);
  const back = () => navigate('/hub/pedidos');

  return (
    <>
      <Crumbs to="#/hub/pedidos" section="Pedidos" page={o.number} />
      <form
        className="dash-grid dash-grid--profile"
        onSubmit={(e) => {
          e.preventDefault();
          setOrderStatus(o.number, status);
          back();
        }}
      >
        <Card title="Itens" aside={<span className="hub-card__count">{formatDate(o.createdAt)}</span>}>
          <ul className="cart-list">
            {o.items.map((i) => {
              const product = productById(i.productId);
              return (
                <li key={`${i.productId}-${i.option ?? ''}`}>
                  <span className="cart-list__art">
                    {product && <ProductArt shape={product.art.shape} palette={product.art.palette} />}
                  </span>
                  <div className="cart-list__info">
                    <strong>{product?.name ?? 'Produto removido'}</strong>
                    <span>
                      {i.qty}× {i.option ?? product?.size ?? ''}
                    </span>
                  </div>
                  <strong className="cart-list__total">
                    {product ? formatEuro(priceFor(product, i.option) * i.qty) : '—'}
                  </strong>
                </li>
              );
            })}
          </ul>
          <dl className="shop-summary__rows order-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatEuro(o.subtotal)}</dd>
            </div>
            <div>
              <dt>Entrega</dt>
              <dd>{o.shipping ? formatEuro(o.shipping) : 'Grátis'}</dd>
            </div>
            <div className="is-total">
              <dt>Total</dt>
              <dd>{formatEuro(o.total)}</dd>
            </div>
          </dl>
        </Card>

        <div className="stack">
          <Card title="Cliente">
            <dl className="profile-meta profile-meta--stack">
              <div>
                <dt>Nome</dt>
                <dd>{o.name}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{o.email}</dd>
              </div>
              <div>
                <dt>Entrega</dt>
                <dd>{o.delivery === 'envio' ? 'Envio CTT' : 'Levantar na clínica'}</dd>
              </div>
              <div>
                <dt>Pagamento</dt>
                <dd>{PAYMENT[o.payment]}</dd>
              </div>
            </dl>
          </Card>
          <Card title="Status">
            <div className="stack">
              <div className="choice-row choice-row--stack">
                {ORDER_STATUS.map((s) => (
                  <button
                    type="button"
                    key={s.key}
                    className={`choice ${status === s.key ? 'is-active' : ''}`}
                    aria-pressed={status === s.key}
                    onClick={() => setStatus(s.key)}
                  >
                    <span className="choice__dot" />
                    <span>
                      <strong>{s.label}</strong>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={back}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={status === o.status}>
              Salvar status
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

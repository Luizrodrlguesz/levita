import type { RouteName } from '../hooks/useRoute';
import useShop from '../hooks/useShop';
import { cartCount } from '../data/shop';
import { BagIcon } from './Loja';

interface SubNavProps {
  active: RouteName;
}

/**
 * Cabeçalho claro das páginas internas públicas (loja e avaliação).
 * Mesmos destinos do `Nav` da home — a área da equipe tem o seu próprio
 * dashboard (`Hub`) e não aparece aqui.
 */
export default function SubNav({ active }: SubNavProps) {
  const count = cartCount(useShop().cart);
  return (
    <header className="subnav">
      <div className="container subnav__inner">
        <a className="subnav__logo" href="#/" aria-label="Levitá — início">
          <img src="/assets/levita-icon.png" alt="" />
          <span>
            <strong>LEVITÁ</strong>
            <em>Clínica</em>
          </span>
        </a>

        <nav className="subnav__links">
          <a href="#sobre">Sobre</a>
          <a href="#massagens">Massagens</a>
          <a href="#tratamentos">Tratamentos</a>
          <a href="#precos">Valores</a>
          <a className={active === 'loja' ? 'is-active' : ''} href="#/loja">
            Loja
          </a>
        </nav>

        <div className="subnav__actions">
          <a className="subnav__bag" href="#/loja/carrinho" aria-label={`Sacola (${count} itens)`}>
            <BagIcon />
            {count > 0 && <span>{count}</span>}
          </a>
          <a className="subnav__cta" href="https://wa.me/351920129484" target="_blank" rel="noreferrer">
            Agendar
          </a>
        </div>
      </div>
    </header>
  );
}

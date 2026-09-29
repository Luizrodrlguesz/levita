import type { RouteName } from '../hooks/useRoute';

interface SubNavProps {
  active: RouteName;
}

/**
 * Cabeçalho claro usado nas páginas internas (avaliação e HUB).
 * A home continua com o `Nav` sobreposto ao hero.
 */
export default function SubNav({ active }: SubNavProps) {
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
          <a href="#/">Início</a>
          <a className={active === 'avaliar' ? 'is-active' : ''} href="#/avaliar">
            Avaliar Profissional
          </a>
          <a href="#sobre">Sobre a Clínica</a>
          <a href="#contato">Contato</a>
        </nav>

        <a className={`subnav__cta ${active === 'hub' ? 'is-active' : ''}`} href="#/hub">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 10V7a5 5 0 0110 0v3M5 10h14v10H5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          Área da Clínica
        </a>
      </div>
    </header>
  );
}

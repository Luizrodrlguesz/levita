import { useState, useEffect } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen);
    return () => document.body.classList.remove('nav-open');
  }, [menuOpen]);

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'nav--open' : ''}`}>
      <a href="#top" className="nav__logo w-10">
        <img src="/assets/levita-icon.png" alt="Levitá" />
      </a>
      <nav className="nav__links">
        <a href="#sobre">Sobre</a>
        <a href="#metodo">Método</a>
        <a href="#massagens">Massagens</a>
        <a href="#tratamentos">Tratamentos</a>
        <a href="#precos">Valores</a>
      </nav>
      <div className="nav__actions">
        <a
          className="nav__cta"
          href="https://wa.me/351920129484"
          target="_blank"
          rel="noreferrer"
        >
          Agendar
        </a>
        <button
          type="button"
          className="nav__toggle"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <nav className="nav__mobile-menu" onClick={() => setMenuOpen(false)}>
        <a href="#sobre">Sobre</a>
        <a href="#tratamentos">Tratamentos</a>
        <a href="#precos">Valores</a>
      </nav>
    </header>
  );
}

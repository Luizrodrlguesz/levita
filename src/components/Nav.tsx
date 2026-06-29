import { useState, useEffect } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#top" className="nav__logo w-10">
        <img src="/assets/levita-icon.png" alt="Levitá" />
      </a>
      <nav className="nav__links">
        <a href="#sobre">Sobre</a>
        <a href="#metodo">Método</a>
        <a href="#massagens">Massagens</a>
        <a href="#tratamentos">Tratamentos</a>
        <a href="#precos">Preços</a>
      </nav>
      <a className="nav__cta" href="#contato">
        Agendar
      </a>
    </header>
  );
}

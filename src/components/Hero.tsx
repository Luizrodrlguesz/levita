export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <div className="hero__logo-wrap reveal">
          <img
            src="/assets/logo.png"
            alt="Levitá Massagem e Estética"
            className="hero__logo"
          />
        </div>
        <div className="hero__copy">
          <div className="hero__eyebrow reveal">
            <span className="rule" />
            <span>Massagem &amp; Estética · Lisboa</span>
          </div>
          <h1 className="hero__title reveal delay-1">
            Corpo &amp; Alma
            <span className="em">em Equilíbrio</span>
          </h1>
          <p className="hero__lead reveal delay-2">
            Uma experiência sensorial de autocuidado — drenagem, modelação e
            escultura corporal no conforto da sua casa ou no nosso espaço em
            Telheiras.
          </p>
          <div className="hero__ctas reveal delay-3">
            <a className="btn btn--primary" href="#contato">
              Agendar sessão <span className="arrow" />
            </a>
            <a className="btn btn--ghost" href="#metodo">
              Conheça o método
            </a>
          </div>
        </div>
      </div>
      <div className="hero__scroll">
        <span>scroll</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">Levitá · Massagem &amp; Estética</div>
        <div className="footer__legal">
          NEREIDES ESBELTAS - UNIPESSOAL LDA - NIF: 518797341
        </div>
        <div className="footer__links">
          <a href="#sobre">Sobre</a>
          <a href="#metodo">Método</a>
          <a href="#precos">Preços</a>
          <a href="#contato">Contato</a>
        </div>
        <div className="footer__copy">
          © {new Date().getFullYear()} Levitá Massagem · Lisboa
        </div>
      </div>
    </footer>
  );
}

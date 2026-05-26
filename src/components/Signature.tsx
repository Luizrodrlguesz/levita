import BeforeAfter from './BeforeAfter';

export default function Signature() {
  return (
    <section className="signature" id="metodo">
      <div className="container">
        <div className="signature__head">
          <div className="eyebrow reveal">Método Exclusivo</div>
          <h2 className="reveal delay-1">
            Redux <span className="it">Luxe</span>
          </h2>
          <div
            className="ornament reveal delay-2"
            style={{ maxWidth: 200, margin: '24px auto 0' }}
          >
            <span className="dot" />
          </div>
          <p className="reveal delay-2">
            Método exclusivo que combina drenagem, modelagem e tonificação em
            uma única sessão de luxo. Desenvolvido para quem busca resultados
            visíveis desde o primeiro atendimento — atua profundamente na
            retenção de líquidos, redução de celulite e definição corporal.
          </p>
        </div>
        <BeforeAfter />
      </div>
    </section>
  );
}

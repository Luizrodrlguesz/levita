export default function Contact() {
  return (
    <section className="contact" id="contato">
      <div className="container contact__grid">
        <div>
          <div
            className="eyebrow reveal"
            style={{ color: 'var(--green-700)' }}
          >
            Onde estamos
          </div>
          <h2 className="contact__head reveal delay-1">
            Venha viver a <span className="it">experiência Levitá.</span>
          </h2>
          <p
            className="reveal delay-2"
            style={{ color: 'var(--ink-700)', maxWidth: 460, fontSize: 16 }}
          >
            Atendemos no nosso espaço em Telheiras, Lisboa — ou no conforto da
            sua casa. Agende pelo WhatsApp e reserve o seu momento.
          </p>
          <div className="contact__rows reveal delay-3">
            <div className="contact__row">
              <span className="icon icon--green" />
              <div>
                <h4>Morada</h4>
                <p>
                  Rua Padre Américo 18F, 1º andar / Escritório 6<br />
                  Telheiras 1160‑548 · Lisboa
                </p>
              </div>
            </div>
            <div className="contact__row">
              <span className="icon" />
              <div>
                <h4>Contactos</h4>
                <p>
                  <a href="tel:+351920129484">920 129 484</a> · WhatsApp
                  <br />
                  <a href="mailto:levitamassagens@gmail.com">
                    levitamassagens@gmail.com
                  </a>
                </p>
              </div>
            </div>
            <div className="contact__row">
              <span className="icon icon--green" />
              <div>
                <h4>Horários</h4>
                <p>
                  Segunda a Sexta · 09h – 19h
                  <br />
                  Sábados · 09h – 15h
                  <br />
                  Domingo e feriados · fechado
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact__card reveal delay-2">
          <div className="contact__card-inner">
            <img
              src="/assets/logo.png"
              alt="Levitá"
              className="contact__card-logo"
              style={{ filter: 'brightness(1.05)' }}
            />
            <h3>
              Agende a sua sessão <span className="it">connosco.</span>
            </h3>
            <p>
              Resposta rápida pelo WhatsApp. Conte-nos o que procura e
              desenhamos o protocolo ideal para o seu momento.
            </p>
            <a
              className="btn btn--primary"
              href="https://wa.me/351920129484"
              target="_blank"
              rel="noreferrer"
            >
              Marcar via WhatsApp <span className="arrow" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

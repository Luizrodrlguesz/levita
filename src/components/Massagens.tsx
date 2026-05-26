interface Massagem {
  img: string;
  title: string;
  text: string;
}

const massagens: Massagem[] = [
  {
    img: '/assets/circles/terapeutica.png',
    title: 'Terapêutica',
    text: 'Indicada para aliviar e tratar as dores musculares.',
  },
  {
    img: '/assets/circles/relaxante.png',
    title: 'Relaxante',
    text: 'Indicada para alívio das tensões físicas e mentais.',
  },
  {
    img: '/assets/circles/drenagem.png',
    title: 'Drenagem Linfática',
    text: 'Indicada para drenar o acúmulo de líquidos, diminuindo o inchaço.',
  },
  {
    img: '/assets/circles/gestante.png',
    title: 'Massagem para Gestante',
    text: 'Indicada para reduzir o inchaço e aliviar as dores nas costas.',
  },
];

export default function Massagens() {
  return (
    <section id="massagens" style={{ background: 'var(--paper)' }}>
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow reveal">Toque sensorial</div>
            <h2 className="section-head__title reveal delay-1">
              <span className="it">Massagens</span>
            </h2>
          </div>
          <p className="section-head__lead reveal delay-2">
            Quatro modalidades adaptadas ao seu momento — relaxe, alivie e
            renove a partir de uma escuta atenta ao seu corpo.
          </p>
        </div>
        <div className="grid-4">
          {massagens.map((m, i) => (
            <div
              className={`massage-card reveal delay-${(i % 4) + 1}`}
              key={m.title}
            >
              <div className="massage-card__photo">
                <img src={m.img} alt={m.title} />
              </div>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

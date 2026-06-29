interface Tratamento {
  img: string;
  title: string;
  text: string;
}

const tratamentos: Tratamento[] = [
  {
    img: '/assets/circles/trat-celulite.png',
    title: 'Celulite Zero',
    text: 'Combina técnicas avançadas de massagem e estímulos específicos para reduzir visivelmente a celulite já nas primeiras sessões.',
  },
  {
    img: '/assets/circles/trat-flacidez.png',
    title: 'Flacidez',
    text: 'Restaura a firmeza e a elasticidade da pele através de técnicas manuais avançadas e ativos tensores que estimulam a produção de colágeno.',
  },
  {
    img: '/assets/circles/trat-bodyscupt.png',
    title: 'Bodyscupt Express',
    text: 'Protocolo avançado de remodelação corporal que combina drenagem, modelagem, manta térmica e ativos em 3 dias consecutivos.',
  },
  // {
  //   img: '/assets/circles/trat-gordura.png',
  //   title: 'Gordura Localizada',
  //   text: 'Indicada na eliminação de gordura localizada que não desaparece com exercício físico.',
  // },
  {
    img: '/assets/circles/ritual-redux.png',
    title: 'Ritual Redux Luxe',
    text: 'Protocolo exclusivo que une o Método Redux Luxe + Argila Verde e manta térmica. São 4 sessões, sendo 1 por semana, indicado para quem tem foco na região abdominal.',
  },
  {
    img: '/assets/circles/hifu.png',
    title: 'HIFU',
    text: 'Tratamento estético não invasivo que utiliza ultrassom focalizado de alta intensidade para estimular a produção natural de colágeno nas camadas profundas da pele.',
  },
  {
    img: '/assets/circles/bodyscupt2.png',
    title: 'Bodyscupt',
    text: 'Protocolo avançado de remodelação corporal — drenagem, modelagem, manta térmica e ativos. Total de 6 sessões.',
  },
  {
    img: '/assets/circles/liposonic.png',
    title: 'Liposonic',
    text: 'protocolo avançado para eliminar gordura localizada e remodelação corporal.',
  },
];

export default function Tratamentos() {
  return (
    <section className="treatments" id="tratamentos">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow reveal">Protocolos completos</div>
            <h2 className="section-head__title reveal delay-1">
              <span className="it">Tratamentos</span>
            </h2>
          </div>
          <p className="section-head__lead reveal delay-2">
            Protocolos avançados que combinam técnicas manuais, ativos e
            tecnologia para resultados duradouros.
          </p>
        </div>
        <div className="treatments__grid">
          {tratamentos.map((t, i) => (
            <div
              className={`trt-card reveal delay-${(i % 4) + 1}`}
              key={t.title}
            >
              <div className="trt-card__photo">
                <img src={t.img} alt={t.title} />
              </div>
              <div className="trt-card__body">
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

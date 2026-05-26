interface Apparatus {
  img: string;
  title: string;
  text: string;
}

const apparatus: Apparatus[] = [
  {
    img: '/assets/circles/radiofrequencia.png',
    title: 'Radiofrequência',
    text: 'Indicada para melhorar a flacidez da pele, redução de rugas e celulite.',
  },
  {
    img: '/assets/circles/manta.png',
    title: 'Manta Térmica',
    text: 'Indicada para detox corporal — ajuda na queima de gordura e inchaço.',
  },
  {
    img: '/assets/circles/lipocavitacao.png',
    title: 'LipoCavitação',
    text: 'Indicada na eliminação de gordura localizada que não desaparece com exercício físico.',
  },
  {
    img: '/assets/circles/led.png',
    title: 'Ledterapia',
    text: 'Indicada na eliminação de gordura localizada que não desaparece com exercício físico.',
  },
  {
    img: '/assets/circles/emsculpt.png',
    title: 'Emsculpt Zero',
    text: 'Tratamento não invasivo que ajuda a reduzir gordura localizada e tonificar os músculos ao mesmo tempo.',
  },
];

export default function Aparatologia() {
  return (
    <section className="apparatus">
      <div className="container">
        <div className="section-head">
          <div>
            <div
              className="eyebrow reveal"
              style={{ color: 'var(--rose-400)' }}
            >
              Tecnologia
            </div>
            <h2 className="section-head__title reveal delay-1">
              <span className="it">Aparatologia</span>
            </h2>
          </div>
          <p className="section-head__lead reveal delay-2">
            Equipamentos de alta performance que somam-se às técnicas manuais
            para potencializar cada protocolo.
          </p>
        </div>
        <div className="apparatus__grid">
          {apparatus.map((a, i) => (
            <div
              className={`app-card reveal delay-${(i % 4) + 1}`}
              key={a.title}
            >
              <div className="app-card__photo">
                <img src={a.img} alt={a.title} />
              </div>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

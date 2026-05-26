interface Service {
  img: string;
  title: string;
  text: string;
}

const principais: Service[] = [
  {
    img: '/assets/circles/svc-redux.png',
    title: 'Método Redux Luxe',
    text: 'Foi desenvolvido para ter o melhor das técnicas de Drenagem Linfática e massagem Modeladora — entregando resultados imediatos, duradouros e relaxantes.',
  },
  {
    img: '/assets/circles/svc-celulite.png',
    title: 'Celulite Zero',
    text: 'Um protocolo exclusivo que combina técnicas avançadas de massagem e ativos específicos para reduzir visivelmente a celulite já na primeira sessão.',
  },
  {
    img: '/assets/circles/svc-bodyscupt.png',
    title: 'Bodyscupt Express',
    text: 'Protocolo exclusivo que une o Método Redux Luxe + ativos cosméticos de alta performance e manta térmica. São 3 dias consecutivos.',
  },
];

export default function Triplet() {
  return (
    <section className="triplet">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow reveal">Em destaque</div>
            <h2 className="section-head__title reveal delay-1">
              Principais <span className="it">serviços</span>
            </h2>
          </div>
          <p className="section-head__lead reveal delay-2">
            Três protocolos assinatura, criados para entregar resultados
            visíveis com a assinatura sensorial da Levitá.
          </p>
        </div>
        <div className="triplet__grid">
          {principais.map((p, i) => (
            <div className={`svc-card reveal delay-${i + 1}`} key={p.title}>
              <div className="svc-card__photo">
                <img src={p.img} alt={p.title} />
                <div className="svc-card__num">0{i + 1}</div>
              </div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

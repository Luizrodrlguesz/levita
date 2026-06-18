const staff = [
  {
    name: 'Lucas Neves',
    role: 'Massoterapeuta',
    photo: '/assets/lucas-neves.jpg',
    description:
      'Especialista em massagem terapêutica e relaxante, com toque firme e atenção a cada ponto de tensão.',
  },
  {
    name: 'Yudelkis',
    role: 'Esteticista',
    photo: '/assets/Yudelkis.jpg',
    description:
      'Conduz protocolos de modelação corporal com precisão técnica e cuidado em cada detalhe do atendimento.',
  },
  {
    name: 'Amanda Lima',
    role: 'Terapeuta Corporal',
    photo: '/assets/amanda-lima.jpg',
    description:
      'Une drenagem linfática e técnicas manuais para resultados visíveis e uma experiência verdadeiramente relaxante.',
  },
  {
    name: 'Maria Eduarda',
    role: 'Recepção & Atendimento',
    photo: '/assets/maria-eduarda.jpg',
    description:
      'Primeiro contato com a Levitá, responsável por receber cada cliente com cuidado, agilidade e atenção.',
  },
];

export default function About() {
  return (
    <section className="about" id="sobre">
      <div className="container about__grid">
        <div className="about__copy">
          <div className="eyebrow reveal">
            <span
              className="rule"
              style={{ marginRight: 14, color: 'var(--green-700)' }}
            />
            Sobre a Levitá
          </div>
          <h2 className="reveal delay-1">
            Autocuidado
            <span className="it">como ritual.</span>
          </h2>
          <p className="reveal delay-2">
            A Levitá Massagem nasceu com o propósito de transformar o
            autocuidado em uma experiência sensorial, personalizada e de alto
             padrão {/* — seja no conforto da sua casa ou */} no nosso espaço em 
            Telheiras, Lisboa.
          </p>
          <p className="reveal delay-2">
            Por trás da Levitá está{' '}
            <strong style={{ color: 'var(--green-900)', fontWeight: 500 }}>
              Adrian Gomes
            </strong>
            , fundadora da marca e criadora do Método Redux Luxe® — uma técnica
            exclusiva focada em drenagem, modelação e escultura corporal, com
            resultados visíveis já na primeira sessão.
          </p>
          <div className="about__signature reveal delay-3">
            <div>
              <span className="name">Adrian Gomes</span>
              <div className="role">Fundadora · Criadora do Método</div>
            </div>
          </div>
        </div>
        <div className="about__photo reveal delay-2">
          <div className="about__photo-frame">
            <img src="/assets/adrian.png" alt="Adrian Gomes, fundadora" />
          </div>
          <div className="about__badge">
            <span className="num">100%</span>
            <span className="lbl">Atendimento personalizado</span>
          </div>
        </div>
      </div>
      <div className="container about__staff">
        <div className="about__staff-head reveal">
          <span
            className="rule"
            style={{ marginRight: 14, color: 'var(--green-700)' }}
          />
          Nossa equipe
        </div>
        <div className="about__staff-grid">
          {staff.map((member, i) => (
            <div
              className={`about__staff-card reveal delay-${Math.min(i + 1, 3)}`}
              key={member.name}
            >
              <div className="about__staff-photo">
                <img src={member.photo} alt={member.name} />
              </div>
              <span className="about__staff-name">{member.name}</span>
              <span className="about__staff-role">{member.role}</span>
              <p className="about__staff-desc">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

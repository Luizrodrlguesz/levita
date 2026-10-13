import useReviews from '../hooks/useReviews';

export default function About() {
  // equipe, cargos e descrições vêm do mesmo cadastro editado no HUB
  const { professionals } = useReviews();
  const founder = professionals.find((p) => p.active && p.site === 'fundadora');
  const staff = professionals.filter((p) => p.active && p.site === 'equipe');

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
          {founder && (
            <>
              <p className="reveal delay-2">
                Por trás da Levitá está{' '}
                <strong style={{ color: 'var(--green-900)', fontWeight: 500 }}>
                  {founder.name}
                </strong>
                . {founder.description}
              </p>
              <div className="about__signature reveal delay-3">
                <div>
                  <span className="name">{founder.name}</span>
                  <div className="role">{founder.role}</div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="about__photo reveal delay-2">
          <div className="about__photo-frame">
            <img
              src={founder?.photo ?? '/assets/adrian-2.jpg'}
              alt={founder ? `${founder.name}, ${founder.role}` : ''}
            />
          </div>
          <div className="about__badge">
            <span className="num">Método Redux Luxe</span>
            <span className="lbl">Desde 2021 transformando Corpos</span>
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
              key={member.id}
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

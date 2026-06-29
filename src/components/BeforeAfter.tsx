import 'img-comparison-slider';

// Declaração do web component para o TypeScript/JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'img-comparison-slider': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        value?: number | string;
        direction?: 'horizontal' | 'vertical';
        keyboard?: 'enabled' | 'disabled';
        hover?: 'enabled' | 'disabled';
      };
    }
  }
}

export default function BeforeAfter() {
  return (
    <img-comparison-slider
      className="compare reveal delay-2"
      value="50"
      onFocus={(e: React.FocusEvent<HTMLElement>) => {
        e.currentTarget.blur();
      }}
    >
      {/* Imagem "Antes" */}
      <div slot="first" className="compare__slot">
        <img
          src="/assets/redux-antes.jpeg"
          alt="Antes"
          className="compare__img"
        />
        <span className="compare__label compare__label--before">Antes</span>
      </div>

      {/* Imagem "Depois" */}
      <div slot="second" className="compare__slot">
        <img
          src="/assets/redux-depois.jpeg"
          alt="Depois"
          className="compare__img"
        />
        <span className="compare__label compare__label--after">Depois</span>
      </div>

      {/* Handle customizado */}
      <div slot="handle" className="compare__handle">
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
          <path
            d="M6 1 L1 7 L6 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 1 L21 7 L16 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </img-comparison-slider>
  );
}

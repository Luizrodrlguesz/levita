import { useState } from 'react';

interface PriceCard {
  label: string;
  title: string;
  rows: [string, string][];
}

interface PricingCategory {
  label: string;
  note?: string;
  cards: PriceCard[];
}

type PricingKey = 'redux' | 'massagens' | 'aparatologia' | 'tratamentos';

const pricingData: Record<PricingKey, PricingCategory> = {
  redux: {
    label: 'Método Redux Luxe',
    note: 'Zona: abdómen e flanco, ou pernas e glúteos · Duração média de 30 min. Corpo: abdómen, flanco, pernas, glúteos e braços · Duração média de 60 min.',
    cards: [
      {
        label: 'Corpo',
        title: 'Corpo inteiro',
        rows: [
          ['Sessão avulsa', '60€'],
          ['Pack 4 sessões', '185€'],
          ['Pack 8 sessões', '310€'],
        ],
      },
      {
        label: 'Zona',
        title: 'Por zona',
        rows: [
          ['Sessão avulsa', '45€'],
          ['Pack 4 sessões', '140€'],
          ['Pack 8 sessões', '220€'],
        ],
      },
    ],
  },
  massagens: {
    label: 'Massagens',
    note: 'Terapêutica · Relaxante · Drenagem Linfática · Gestante',
    cards: [
      {
        label: 'Zona',
        title: 'Massagem por zona',
        rows: [
          ['Sessão avulsa', '35€'],
          ['Pack 4 sessões', '120€'],
          ['Pack 8 sessões', '200€'],
        ],
      },
      {
        label: 'Corpo',
        title: 'Massagem corpo inteiro',
        rows: [
          ['Sessão avulsa', '50€'],
          ['Pack 4 sessões', '170€'],
          ['Pack 8 sessões', '250€'],
        ],
      },
    ],
  },
  aparatologia: {
    label: 'Aparatologia',
    note: 'Radiofrequência · Manta Térmica · LipoCavitação · Ledterapia · Emsculpt Zero',
    cards: [
      {
        label: 'Zona',
        title: 'Tecnologia por zona',
        rows: [
          ['Sessão avulsa', '45€'],
          ['Pack 4 sessões', '140€'],
          ['Pack 8 sessões', '220€'],
        ],
      },
    ],
  },
  tratamentos: {
    label: 'Tratamentos',
    note: 'Pacotes especiais — Celulite Zero inclui home care.',
    cards: [
      {
        label: 'Celulite Zero · Zona',
        title: 'Celulite Zero',
        rows: [
          ['Sessão avulsa', '70€'],
          ['Pack 4 sessões', '310€'],
          ['Home care incluído', '✓'],
        ],
      },
      {
        label: 'Gordura Localizada · Zona',
        title: 'Gordura Localizada',
        rows: [
          ['Sessão avulsa', '90€'],
          ['Pack 4 sessões', '320€'],
        ],
      },
      {
        label: 'Protocolo · 3 dias',
        title: 'Bodyscupt Express',
        rows: [
          ['3 sessões consecutivas', '380€'],
          ['Express + 3 sessões', '620€'],
        ],
      },
      {
        label: 'Ritual',
        title: 'Ritual Redux Luxe',
        rows: [
          ['Sessão avulsa', '90€'],
          ['Pack 4 sessões', '310€'],
        ],
      },
      {
        label: 'HIFU · Liposonic',
        title: 'HIFU',
        rows: [
          ['1 zona', '250€'],
          ['2 zonas', '450€'],
          ['Mais informações', 'sob consulta'],
        ],
      },
    ],
  },
};

const tabs = Object.keys(pricingData) as PricingKey[];

export default function Pricing() {
  const [tab, setTab] = useState<PricingKey>('redux');

  return (
    <section className="pricing" id="precos">
      <div className="container">
        <div className="section-head">
          <div>
            <div
              className="eyebrow reveal"
              style={{ color: 'var(--rose-400)' }}
            >
              Valores
            </div>
            <h2 className="section-head__title reveal delay-1">
              Tabela de <span className="it">preços</span>
            </h2>
          </div>
          <p className="section-head__lead reveal delay-2">
            Sessões avulsas e pacotes pensados para acompanhar o seu ritmo de
            cuidado. Validade: pack 4 sessões — 60 dias · pack 8 sessões — 90
            dias após pagamento.
          </p>
        </div>

        <div className="pricing__tabs reveal">
          {tabs.map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`pricing__tab ${tab === k ? 'active' : ''}`}
            >
              {pricingData[k].label}
            </button>
          ))}
        </div>

        {tabs.map((k) => (
          <div
            key={k}
            className={`pricing__panel ${tab === k ? 'active' : ''}`}
          >
            <div className="pricing__grid">
              {pricingData[k].cards.map((c) => (
                <div className="price-card" key={c.title}>
                  <div className="price-card__label">{c.label}</div>
                  <h3 className="price-card__title">{c.title}</h3>
                  <ul className="price-card__rows">
                    {c.rows.map(([opt, val]) => (
                      <li key={opt}>
                        <span className="opt">{opt}</span>
                        <span className="val">{val}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {pricingData[k].note && (
              <div className="pricing__note">
                <strong>Notas</strong> · {pricingData[k].note}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

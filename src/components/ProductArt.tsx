import type { ArtPalette, ArtShape } from '../data/shop';

interface ProductArtProps {
  shape: ArtShape;
  palette: ArtPalette;
  className?: string;
}

/** luminância relativa aproximada — escolhe a cor mais escura para o texto do rótulo */
function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const SERIF = 'Cormorant Garamond, Georgia, serif';

function Brand({ x, y, size, fill }: { x: number; y: number; size: number; fill: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontFamily={SERIF}
      fontSize={size}
      letterSpacing={size * 0.22}
      fill={fill}
    >
      LEVITÁ
    </text>
  );
}

function Sparkle({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <path
      d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`}
      fill={fill}
    />
  );
}

/**
 * Ilustração vetorial das embalagens — substitui fotos de produto até a
 * clínica ter o ensaio fotográfico. Cada produto escolhe forma + paleta.
 */
export default function ProductArt({ shape, palette, className }: ProductArtProps) {
  const { bg, body, cap, label } = palette;
  const ink = luminance(body) < luminance(cap) ? body : cap;

  let art: JSX.Element;
  switch (shape) {
    case 'bottle':
      art = (
        <g>
          <rect x="104" y="40" width="34" height="12" rx="4" fill={cap} />
          <rect x="134" y="43" width="22" height="6" rx="3" fill={cap} />
          <rect x="115" y="50" width="10" height="24" fill={cap} />
          <rect x="100" y="70" width="40" height="14" rx="3" fill={cap} />
          <rect x="104" y="80" width="32" height="18" rx="4" fill={body} />
          <rect x="82" y="92" width="76" height="120" rx="14" fill={body} />
          <rect x="92" y="122" width="56" height="60" rx="4" fill={label} />
          <Brand x={120} y={146} size={9} fill={ink} />
          <rect x="108" y="154" width="24" height="1" fill={ink} opacity="0.5" />
          <text x="120" y="168" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="8" fill={ink}>
            body oil
          </text>
          <rect x="89" y="100" width="6" height="104" rx="3" fill="#fff" opacity="0.22" />
        </g>
      );
      break;
    case 'dropper':
      art = (
        <g>
          <ellipse cx="120" cy="74" rx="13" ry="20" fill={cap} />
          <rect x="100" y="90" width="40" height="26" rx="4" fill={cap} />
          <rect x="90" y="112" width="60" height="100" rx="12" fill={body} />
          <rect x="98" y="138" width="44" height="50" rx="3" fill={label} />
          <Brand x={120} y={158} size={7.5} fill={ink} />
          <text x="120" y="174" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="7.5" fill={ink}>
            sérum
          </text>
          <rect x="96" y="120" width="5" height="84" rx="2.5" fill="#fff" opacity="0.25" />
          <rect x="114" y="66" width="4" height="14" rx="2" fill="#fff" opacity="0.25" />
        </g>
      );
      break;
    case 'tube':
      art = (
        <g>
          <rect x="84" y="46" width="72" height="16" rx="3" fill={body} />
          {[92, 100, 108, 116, 124, 132, 140, 148].map((x) => (
            <rect key={x} x={x} y="48" width="1.5" height="12" fill={cap} opacity="0.35" />
          ))}
          <path d="M98 184 L86 70 Q86 60 96 60 L144 60 Q154 60 154 70 L142 184 Z" fill={body} />
          <rect x="96" y="180" width="48" height="32" rx="6" fill={cap} />
          <rect x="100" y="94" width="40" height="62" rx="3" fill={label} />
          <Brand x={120} y={116} size={7.5} fill={ink} />
          <rect x="110" y="122" width="20" height="1" fill={ink} opacity="0.5" />
          <text x="120" y="136" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="7.5" fill={ink}>
            corpo
          </text>
          <path d="M92 72 L101 170" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.22" />
        </g>
      );
      break;
    case 'jar':
      art = (
        <g>
          <rect x="66" y="128" width="108" height="84" rx="16" fill={body} />
          <rect x="62" y="102" width="116" height="32" rx="8" fill={cap} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x="66" y={110 + i * 7} width="108" height="1.4" fill="#fff" opacity="0.18" />
          ))}
          <rect x="66" y="152" width="108" height="36" fill={label} />
          <Brand x={120} y={169} size={9} fill={ink} />
          <text x="120" y="181" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="7.5" fill={ink}>
            ritual de corpo
          </text>
          <rect x="74" y="136" width="6" height="68" rx="3" fill="#fff" opacity="0.22" />
        </g>
      );
      break;
    case 'candle':
      art = (
        <g>
          <path d="M120 82 C132 98 130 112 120 118 C110 112 108 98 120 82 Z" fill="#e8a75b" />
          <path d="M120 98 C126 106 125 113 120 116 C115 113 114 106 120 98 Z" fill="#f6d38b" />
          <rect x="119" y="114" width="2" height="16" fill="#1f352a" />
          <rect x="70" y="128" width="100" height="84" rx="10" fill={body} />
          <ellipse cx="120" cy="130" rx="50" ry="9" fill={cap} />
          <rect x="84" y="156" width="72" height="34" rx="3" fill={label} />
          <Brand x={120} y={172} size={8.5} fill={body} />
          <text x="120" y="183" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="7" fill={body}>
            massage candle
          </text>
          <rect x="76" y="140" width="5" height="64" rx="2.5" fill="#fff" opacity="0.22" />
        </g>
      );
      break;
    case 'roller':
      art = (
        <g transform="rotate(-28 120 130)">
          <path d="M90 92 L90 78 L150 78 L150 92" stroke={cap} strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="118" y="78" width="4" height="46" fill={cap} />
          <rect x="84" y="54" width="72" height="30" rx="15" fill={body} />
          <rect x="94" y="60" width="44" height="5" rx="2.5" fill="#fff" opacity="0.35" />
          <rect x="112" y="120" width="16" height="84" rx="8" fill={body} />
          <rect x="115" y="128" width="4" height="66" rx="2" fill="#fff" opacity="0.3" />
          <rect x="110" y="118" width="20" height="8" rx="3" fill={cap} />
          <path d="M104 214 L104 206 L136 206 L136 214" stroke={cap} strokeWidth="3" fill="none" />
          <rect x="102" y="212" width="36" height="16" rx="8" fill={body} />
        </g>
      );
      break;
    case 'guasha':
      art = (
        <g transform="rotate(-10 120 130)">
          <path
            d="M120 70 C146 40 196 58 186 102 C180 130 152 146 136 186 C130 200 110 200 104 186 C88 146 60 130 54 102 C44 58 94 40 120 70 Z"
            fill={body}
          />
          <path
            d="M120 84 C140 62 174 74 168 104 C164 124 144 136 132 166"
            stroke="#fff"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            opacity="0.25"
          />
          <circle cx="120" cy="118" r="6" fill={cap} opacity="0.6" />
        </g>
      );
      break;
    case 'giftbox':
      art = (
        <g>
          <ellipse cx="102" cy="88" rx="20" ry="10" fill={cap} transform="rotate(-20 102 88)" />
          <ellipse cx="138" cy="88" rx="20" ry="10" fill={cap} transform="rotate(20 138 88)" />
          <rect x="64" y="116" width="112" height="96" rx="6" fill={body} />
          <rect x="58" y="98" width="124" height="26" rx="5" fill={body} />
          <rect x="58" y="118" width="124" height="6" fill="#000" opacity="0.14" />
          <rect x="112" y="98" width="16" height="114" fill={cap} />
          <circle cx="120" cy="96" r="8" fill={cap} />
          <g transform="rotate(-8 152 166)">
            <rect x="136" y="152" width="40" height="26" rx="3" fill={label} />
            <Brand x={156} y={168} size={6.5} fill={body} />
          </g>
          <rect x="70" y="130" width="5" height="74" rx="2.5" fill="#fff" opacity="0.14" />
        </g>
      );
      break;
    case 'card':
      art = (
        <g>
          <rect x="62" y="84" width="128" height="82" rx="10" fill={cap} transform="rotate(9 126 125)" />
          <g transform="rotate(-6 120 148)">
            <rect x="50" y="104" width="140" height="88" rx="10" fill={body} />
            <circle cx="72" cy="128" r="9" fill="none" stroke={cap} strokeWidth="1.4" />
            <text x="72" y="132" textAnchor="middle" fontFamily={SERIF} fontSize="11" fill={cap}>
              L
            </text>
            <text x="88" y="132" fontFamily={SERIF} fontSize="13" letterSpacing="3" fill={label}>
              LEVITÁ
            </text>
            <rect x="64" y="146" width="112" height="1" fill={cap} opacity="0.7" />
            <text x="64" y="166" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={label}>
              Vale-Presente
            </text>
            <text x="64" y="181" fontFamily="Outfit, sans-serif" fontSize="5.6" letterSpacing="1.1" fill={cap}>
              MASSAGEM · ESTÉTICA · LISBOA
            </text>
          </g>
        </g>
      );
      break;
  }

  return (
    <svg className={className} viewBox="0 0 240 240" role="img" aria-hidden="true">
      <circle cx="120" cy="128" r="94" fill={bg} />
      <ellipse cx="120" cy="214" rx="58" ry="7" fill="#1f352a" opacity="0.1" />
      <Sparkle x={54} y={70} s={7} fill={cap} />
      <Sparkle x={190} y={168} s={5} fill={cap} />
      <Sparkle x={196} y={64} s={4} fill={cap} />
      {art}
    </svg>
  );
}

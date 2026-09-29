# Resumo da arquitetura e conteúdo

## Visão geral

Este projeto é um site institucional estático da **Levitá Massagem & Estética**, construído com **React 18**, **TypeScript** e **esbuild**. A aplicação apresenta a marca, o Método Redux Luxe, serviços, tratamentos, valores e formas de contato/agendamento em Lisboa.

A arquitetura é simples e orientada a componentes: cada seção visual da página fica em um componente React próprio dentro de `src/components`, enquanto o estilo visual completo é centralizado em `src/styles.css`.

## Stack

- **React**: renderização da interface.
- **TypeScript**: tipagem dos componentes e estruturas de dados.
- **esbuild**: bundler para desenvolvimento e build de produção.
- **Node.js**: servidor HTTP de desenvolvimento (`scripts/dev.js`).
- **CSS global**: tokens de design, layout, responsividade e animações.
- **img-comparison-slider**: web component usado para o comparador de antes/depois do Método Redux Luxe.
- **localStorage**: persistência das avaliações enquanto não existe backend.

Scripts principais:

```bash
npm run dev    # inicia o servidor Node em http://localhost:3000
npm run build  # type-check + bundle minificado em dist/
```

## Estrutura de pastas

```text
.
├── index.html
├── package.json
├── tsconfig.json
├── scripts/
│   ├── dev.js    ← servidor Node + esbuild watch
│   └── build.js  ← build de produção
├── public/
│   └── assets/
│       ├── logo.png
│       ├── adrian.png
│       ├── redux-antes.png
│       ├── redux-depois.png
│       └── circles/
│           └── imagens circulares dos serviços
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles.css
    ├── data/
    │   └── reviews.ts   ← store de avaliações (localStorage)
    ├── hooks/
    │   ├── useRoute.ts  ← router por hash
    │   └── useReviews.ts
    └── components/
        ├── Nav.tsx
        ├── Hero.tsx
        ├── About.tsx
        ├── Signature.tsx
        ├── BeforeAfter.tsx
        ├── Triplet.tsx
        ├── Massagens.tsx
        ├── Aparatologia.tsx
        ├── Tratamentos.tsx
        ├── Pricing.tsx
        ├── Contact.tsx
        ├── Footer.tsx
        ├── SubNav.tsx   ← cabeçalho das páginas internas
        ├── Stars.tsx
        ├── Avaliar.tsx  ← página pública de avaliação
        └── Hub.tsx      ← HUB da staff
```

## Fluxo de renderização

O ponto de entrada é `src/main.tsx`, que monta o componente `App` dentro do elemento `#root` definido em `index.html`.

`src/App.tsx` escolhe entre três telas através do hook `useRoute` (ver *Rotas*):

- `home` → o site institucional, descrito abaixo;
- `avaliar` → `SubNav` + `Avaliar` + `Footer`;
- `hub` → `SubNav` + `Hub` + `Footer`.

Na home, o `App` organiza a página em ordem vertical:

1. `Nav`
2. `Hero`
3. `About`
4. `Signature`
5. `Triplet`
6. `Massagens`
7. `Aparatologia`
8. `Tratamentos`
9. `Pricing`
10. `Contact`
11. `Footer`

O `App` também define o hook `useReveal`, que usa `IntersectionObserver` para adicionar a classe `in` aos elementos com classe `reveal` quando eles entram na tela. Essa é a base das animações de entrada.

## Rotas

Não há biblioteca de roteamento. `src/hooks/useRoute.ts` lê `location.hash` e
distingue dois casos:

- hash que **não** começa com `/` (`#sobre`, `#precos`) → âncora da home, o
  comportamento original do site;
- hash que começa com `/` → rota interna.

Rotas existentes:

| Hash | Tela |
| --- | --- |
| `#/` ou qualquer âncora | Site institucional |
| `#/avaliar` | Lista de profissionais para o cliente avaliar |
| `#/avaliar/:id` | Formulário e painéis de um profissional |
| `#/hub` | HUB da staff |

O hook também desliga o `scrollRestoration` do browser e leva a página ao topo
a cada troca de rota; ao voltar para a home com âncora, faz `scrollIntoView` no
alvo (que só existe depois do render da home).

Como o servidor de dev e o build servem sempre o mesmo `index.html`, o hash
funciona em produção sem configuração de servidor.

## Avaliações

### `data/reviews.ts`

Concentra tipos, dados de exemplo e o store. Os componentes nunca falam com o
`localStorage` direto — trocar por uma API é trocar só este arquivo.

- `CRITERIA`: os seis critérios avaliados (qualidade, cordialidade, técnica,
  higiene, pontualidade, experiência geral).
- `Professional`: `id`, `name`, `role`, `photo`, `active`.
- `Review`: profissional, cliente (vazio = anônimo), nota por critério,
  comentário, data, `status` (`pendente` | `publicada` | `oculta`) e `source`
  (`cliente` | `staff`).
- Store: `subscribe` / `getState` no formato de `useSyncExternalStore`, mais
  `addReview`, `setReviewStatus`, `deleteReview`, `addProfessional`,
  `toggleProfessional`, `removeProfessional` e `resetStore`.
- Derivados: `statsFor` (média, nota dos últimos 30 dias, tendência contra os 30
  anteriores, média por critério, % de avaliações ≥ 4), `monthlySeries`,
  `reviewAverage`, `formatDate`.

Chave usada: `levita.reviews.v1`. Sem nada salvo, o store nasce com uma base de
exemplo determinística (~75 avaliações e 2 pendentes). O botão *Repor dados de
exemplo*, no HUB, volta a esse estado.

`statsFor().trend` é `null` quando falta base de comparação em algum dos dois
períodos — a interface mostra “sem base” em vez de uma variação inventada.

### `components/Avaliar.tsx` — página pública (`#/avaliar`)

Duas telas no mesmo componente:

1. **Lista** — cards dos profissionais ativos com média, número de avaliações e
   botão para avaliar, seguidos de uma faixa de números da clínica.
2. **Detalhe** (`#/avaliar/:id`) — barra lateral com abas *Visão geral*
   (formulário), *Avaliações*, *Evolução* (média mensal dos últimos 6 meses),
   *Comentários* e *Comparativo* (profissional × média da clínica por critério);
   ao lado, o toggle de avaliação anônima e o cartão de resumo.

O formulário exige nota nos seis critérios e grava a avaliação como
`pendente` — ela só aparece publicamente depois de liberada no HUB.

### `components/Hub.tsx` — HUB da staff (`#/hub`)

Sem login por enquanto: a rota é aberta e linkada como *Área da Clínica*.

- Quatro KPIs: avaliações publicadas, média geral, aguardando revisão e
  profissionais ativos.
- **Visão geral**: ranking da equipe por média e feed das últimas avaliações.
- **Avaliações**: filtros por profissional, status e busca livre; cada linha
  permite publicar, ocultar ou excluir (exclusão pede confirmação inline).
- **Profissionais**: ativar/desativar, remover (apaga as avaliações do
  profissional) e adicionar alguém à equipe.
- **Nova avaliação**: registro manual de um atendimento avaliado no balcão.

### `components/Stars.tsx`

Estrelas em dois modos: leitura (aceita fração, usada nas médias) e entrada
(botões com `role="radio"`), quando recebe `onChange`.

## Estilo e design

O arquivo `src/styles.css` concentra:

- tokens globais de cor, tipografia, espaçamento e easing em `:root`;
- estilos base de `body`, imagens, links e botões;
- classes utilitárias como `.container`, `.serif`, `.italic`, `.eyebrow`, `.rule` e `.reveal`;
- estilos completos de cada seção e seus estados responsivos.

A identidade visual usa uma paleta quente com verdes, rosés e tons creme. As fontes externas são carregadas no `index.html` via Google Fonts:

- `Cormorant Garamond` para títulos e textos editoriais;
- `Outfit` para navegação, corpo e interface.

## Componentes e conteúdo

### `Nav.tsx`

Cabeçalho fixo com links âncora para as seções da página. Detecta scroll com `useEffect` e aplica a classe `scrolled` quando `window.scrollY > 60`, alterando o fundo e o espaçamento da navegação.

Links principais:

- Sobre
- Método
- Massagens
- Tratamentos
- Valores
- Agendar

### `Hero.tsx`

Primeira dobra do site. Exibe o logo, a chamada principal e botões para agendamento e apresentação do método.

Conteúdo principal:

- marca: Levitá Massagem & Estética;
- localização: Lisboa;
- promessa: “Corpo & Alma em Equilíbrio”;
- destaque para drenagem, modelação e escultura corporal.

Imagem usada:

- `/assets/logo.png`

### `About.tsx`

Seção institucional sobre a Levitá e sua fundadora, Adrian Gomes. Explica o propósito da marca, o atendimento personalizado e apresenta o Método Redux Luxe como técnica exclusiva.

Imagem usada:

- `/assets/adrian.png`

### `Signature.tsx`

Seção do **Método Redux Luxe**. Descreve o método como uma combinação de drenagem, modelagem e tonificação, com foco em retenção de líquidos, celulite e definição corporal.

Inclui o componente `BeforeAfter`.

### `BeforeAfter.tsx`

Componente de comparação visual antes/depois usando a dependência `img-comparison-slider`.

Imagens usadas:

- `/assets/redux-antes.png`
- `/assets/redux-depois.png`

O arquivo também declara o web component `img-comparison-slider` para uso seguro em JSX com TypeScript.

### `Triplet.tsx`

Seção “Principais serviços” com três cards de destaque:

- Método Redux Luxe
- Celulite Zero
- Bodyscupt Express

Os dados ficam em um array local `principais`, o que facilita editar títulos, descrições e imagens sem alterar a estrutura do componente.

### `Massagens.tsx`

Lista modalidades de massagem em cards:

- Terapêutica
- Relaxante
- Drenagem Linfática
- Massagem para Gestante

Os dados ficam no array local `massagens`.

### `Aparatologia.tsx`

Lista tecnologias e equipamentos usados nos protocolos:

- Radiofrequência
- Manta Térmica
- LipoCavitação
- Ledterapia
- Emsculpt Zero

Os dados ficam no array local `apparatus`.

### `Tratamentos.tsx`

Lista protocolos completos:

- Celulite Zero
- Flacidez
- Bodyscupt Express
- Gordura Localizada
- Ritual Redux Luxe
- HIFU
- Bodyscupt
- Liposonic

Os dados ficam no array local `tratamentos`.

### `Pricing.tsx`

Seção interativa de valores com abas controladas por estado React.

Estado principal:

```ts
const [tab, setTab] = useState<PricingKey>('redux');
```

Categorias disponíveis:

- `redux`: Método Redux Luxe
- `massagens`: Massagens
- `aparatologia`: Aparatologia
- `tratamentos`: Tratamentos

Os valores, notas e cards ficam no objeto `pricingData`. Para alterar valores ou pacotes, este é o principal arquivo.

### `Contact.tsx`

Seção de contato e agendamento. Mostra endereço, telefone, e-mail, horários e botão para WhatsApp.

Dados exibidos:

- Morada: Rua Padre Américo 18F, 1º andar / Escritório 6, Telheiras, Lisboa
- Telefone/WhatsApp: `920 129 484`
- E-mail: `levitamassagens@gmail.com`
- Horários: segunda a sexta, sábados, domingos e feriados
- Link WhatsApp: `https://wa.me/351920129484`

### `Footer.tsx`

Rodapé com marca, links âncora e ano atual gerado por `new Date().getFullYear()`.

## Assets

As imagens públicas ficam em `public/assets`. Como estão na pasta `public`, são referenciadas nos componentes a partir da raiz do site:

```tsx
<img src="/assets/logo.png" alt="Levitá" />
```

Principais grupos:

- imagens institucionais: `logo.png`, `adrian.png`, `about.png`;
- comparador: `redux-antes.png`, `redux-depois.png`;
- seções amplas: `massagens.png`, `aparatologia.png`, `tratamentos1.png`, `tratamentos2.png`, `contatos.png`;
- cards circulares: `public/assets/circles/*`.

## Onde alterar conteúdo

- Textos da primeira dobra: `src/components/Hero.tsx`
- Texto institucional e fundadora: `src/components/About.tsx`
- Descrição do Método Redux Luxe: `src/components/Signature.tsx`
- Antes/depois: `src/components/BeforeAfter.tsx`
- Serviços em destaque: `src/components/Triplet.tsx`
- Lista de massagens: `src/components/Massagens.tsx`
- Lista de tecnologias: `src/components/Aparatologia.tsx`
- Lista de tratamentos: `src/components/Tratamentos.tsx`
- Valores e pacotes: `src/components/Pricing.tsx`
- Contato, horários e WhatsApp: `src/components/Contact.tsx`
- Critérios de avaliação, dados de exemplo e regras de cálculo: `src/data/reviews.ts`
- Página pública de avaliação: `src/components/Avaliar.tsx`
- HUB da staff: `src/components/Hub.tsx`
- Rotas internas: `src/hooks/useRoute.ts`
- Cores, espaçamentos, responsividade e animações: `src/styles.css`

## Observações técnicas

- O roteamento é por hash e vive em `src/hooks/useRoute.ts`; dentro da home a navegação continua por âncoras.
- Não há chamadas para API ou backend: as avaliações vivem no `localStorage` do navegador de quem abre a página, então cada dispositivo tem a sua cópia.
- O HUB não tem autenticação — quem souber a URL entra. Antes de ir para produção com dados reais, ele precisa de login de verdade e de um backend compartilhado.
- Estado global só existe no store de avaliações (`subscribe`/`getState` + `useSyncExternalStore`); o resto é estado local de componente.
- O build roda `tsc --noEmit` antes do esbuild, então erros de tipagem bloqueiam a geração da versão final.
- `node_modules` e `dist` existem localmente, mas não fazem parte da arquitetura fonte do projeto.

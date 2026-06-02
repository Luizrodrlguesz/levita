# Resumo da arquitetura e conteúdo

## Visão geral

Este projeto é um site institucional estático da **Levitá Massagem & Estética**, construído com **React 18**, **TypeScript** e **esbuild**. A aplicação apresenta a marca, o Método Redux Luxe, serviços, tratamentos, preços e formas de contato/agendamento em Lisboa.

A arquitetura é simples e orientada a componentes: cada seção visual da página fica em um componente React próprio dentro de `src/components`, enquanto o estilo visual completo é centralizado em `src/styles.css`.

## Stack

- **React**: renderização da interface.
- **TypeScript**: tipagem dos componentes e estruturas de dados.
- **esbuild**: bundler para desenvolvimento e build de produção.
- **Node.js**: servidor HTTP de desenvolvimento (`scripts/dev.js`).
- **CSS global**: tokens de design, layout, responsividade e animações.
- **img-comparison-slider**: web component usado para o comparador de antes/depois do Método Redux Luxe.

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
        └── Footer.tsx
```

## Fluxo de renderização

O ponto de entrada é `src/main.tsx`, que monta o componente `App` dentro do elemento `#root` definido em `index.html`.

`src/App.tsx` organiza a página em ordem vertical:

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
- Preços
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

Seção interativa de preços com abas controladas por estado React.

Estado principal:

```ts
const [tab, setTab] = useState<PricingKey>('redux');
```

Categorias disponíveis:

- `redux`: Método Redux Luxe
- `massagens`: Massagens
- `aparatologia`: Aparatologia
- `tratamentos`: Tratamentos

Os preços, notas e cards ficam no objeto `pricingData`. Para alterar valores ou pacotes, este é o principal arquivo.

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
- Preços e pacotes: `src/components/Pricing.tsx`
- Contato, horários e WhatsApp: `src/components/Contact.tsx`
- Cores, espaçamentos, responsividade e animações: `src/styles.css`

## Observações técnicas

- A aplicação não possui roteamento; a navegação é feita por âncoras na mesma página.
- Não há chamadas para API ou backend.
- Não há gerenciamento global de estado; apenas `Pricing` usa estado local para alternar abas.
- O build roda `tsc --noEmit` antes do esbuild, então erros de tipagem bloqueiam a geração da versão final.
- `node_modules` e `dist` existem localmente, mas não fazem parte da arquitetura fonte do projeto.

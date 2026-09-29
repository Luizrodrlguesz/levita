import { useEffect, useState } from 'react';

export type RouteName = 'home' | 'avaliar' | 'hub';

export interface Route {
  name: RouteName;
  /** segmento extra da rota — hoje, o id do profissional em `#/avaliar/:id` */
  param?: string;
}

function parse(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  // âncoras da home (`#sobre`, `#precos`) não começam com barra
  if (!raw.startsWith('/')) return { name: 'home' };
  const [segment, param] = raw.slice(1).split('/');
  if (segment === 'avaliar') return { name: 'avaliar', param: param || undefined };
  if (segment === 'hub') return { name: 'hub', param: param || undefined };
  return { name: 'home' };
}

/**
 * Router mínimo baseado em hash. Convive com as âncoras existentes da home:
 * só `#/algo` vira rota, o resto continua sendo scroll na página inicial.
 */
export default function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    // sem isso o browser devolve o scroll anterior depois do load e a rota
    // interna abre no meio da página
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const onHashChange = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (route.name === 'home') {
      // voltando para a home com âncora, o alvo só existe depois deste render
      const anchor = window.location.hash.replace(/^#/, '');
      if (anchor && !anchor.startsWith('/')) {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    // `scroll-behavior: smooth` no html faria a troca de rota virar animação;
    // aqui queremos o topo imediatamente.
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [route.name, route.param]);

  return route;
}

export function navigate(to: string) {
  window.location.hash = to;
}

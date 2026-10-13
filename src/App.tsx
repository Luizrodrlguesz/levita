import { useEffect } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Signature from './components/Signature';
import Triplet from './components/Triplet';
import Massagens from './components/Massagens';
import Aparatologia from './components/Aparatologia';
import Tratamentos from './components/Tratamentos';
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SubNav from './components/SubNav';
import Avaliar from './components/Avaliar';
import Hub from './components/Hub';
import Loja from './components/Loja';
import useRoute from './hooks/useRoute';

function useReveal(key: string) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
}

export default function App() {
  const route = useRoute();
  useReveal(`${route.name}:${route.param ?? ''}:${route.sub ?? ''}`);

  if (route.name === 'avaliar') {
    return (
      <>
        <SubNav active="avaliar" />
        <Avaliar professionalId={route.param} />
        <Footer />
      </>
    );
  }

  if (route.name === 'loja') {
    return (
      <>
        <SubNav active="loja" />
        <Loja param={route.param} />
        <Footer />
      </>
    );
  }

  if (route.name === 'hub') {
    // dashboard com cabeçalho e navegação próprios (login quando não há sessão)
    return <Hub section={route.param} sub={route.sub} />;
  }

  return (
    <>
      <Nav />
      <Hero />
      <About />
      <Signature />
      <Triplet />
      <Massagens />
      <Aparatologia />
      <Tratamentos />
      <Pricing />
      <Contact />
      <Footer />
    </>
  );
}

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

function useReveal() {
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
  }, []);
}

export default function App() {
  useReveal();
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

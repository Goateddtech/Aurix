import Nav from './components/Nav'
import HeroSequence from './components/HeroSequence'
import Marquee from './components/Marquee'
import Explainer from './components/Explainer'
import TruthCards from './components/TruthCards'
import CanStory from './components/CanStory'
import Nutrition from './components/Nutrition'
import CanFloat from './components/CanFloat'
import WaveDivider from './components/WaveDivider'
import SocialProof from './components/SocialProof'
import Ritual from './components/Ritual'
import FAQ from './components/FAQ'
import Stockists from './components/Stockists'
import Footer from './components/Footer'
import { useReveal } from './lib/useReveal'

export default function App() {
  useReveal()
  // debug/preview: /?nohero skips the 3D hero so sections can be captured
  const noHero =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('nohero')
  return (
    <>
      <Nav />
      <main>
        {!noHero && <HeroSequence />}
        <Marquee />
        <Explainer />
        <TruthCards />
        <CanStory />
        <Nutrition />
        <CanFloat />
        <SocialProof />
        <Ritual />
        <FAQ />
        <Stockists />
        <WaveDivider />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  )
}

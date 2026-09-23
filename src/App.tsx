import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from './hooks/useLenis'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import Hero from './sections/Hero'
import CodeToGrowth from './sections/CodeToGrowth'
import About from './sections/About'
import Services from './sections/Services'
import Work from './sections/Work'
import Ecosystem from './sections/Ecosystem'
import Technology from './sections/Technology'
import Process from './sections/Process'
import WhyUs from './sections/WhyUs'
import AlbanianIdentity from './sections/AlbanianIdentity'
import CTA from './sections/CTA'
import Contact from './sections/Contact'

gsap.registerPlugin(ScrollTrigger)

function App() {
  useLenis()

  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <CustomCursor />
      <div className="noise-overlay" />
      <Navbar />
      <main className="relative">
        <Hero />
        <CodeToGrowth />
        <About />
        <Services />
        <Work />
        <Ecosystem />
        <Technology />
        <Process />
        <WhyUs />
        <AlbanianIdentity />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App

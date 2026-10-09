import Hero from "@/components/hub/Hero";
import Intro from "@/components/hub/Intro";
import Gallery from "@/components/hub/Gallery";
import Features from "@/components/hub/Features";
import Steps from "@/components/hub/Steps";
import Pricing from "@/components/hub/Pricing";
import Closing from "@/components/hub/Closing";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Intro />
        <Gallery />
        <Features />
        <Steps />
        <Pricing />
      </main>
      <Closing />
    </>
  );
}

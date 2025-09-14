import Footer from "./components/footer";
import Hero from "./components/hero";
import Navbar from "./components/navbar";
import { WobbleCardDemo } from "./components/WobbleCardDemo";

export default function Home() {
  return (
    <div className="font-sans min-h-screen flex flex-col bg-[#201f1f] text-white">
      {/* Navbar fixed */}
      <Navbar />

      {/* Main content grows */}
      <main className="flex-1 pt-16">
        <Hero />
        <WobbleCardDemo />
      </main>

      {/* Footer stays at bottom */}
      <Footer />
    </div>
  );
}

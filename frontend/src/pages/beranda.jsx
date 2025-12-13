import React from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import HeroSection from '../components/beranda/heroSection';
import StatistikSection from '../components/beranda/statistikSection';
import HighlightSection from '../components/beranda/hightlightSection';
import SekretariatSection from '../components/beranda/sekretariatSection';

const Beranda = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Main content dengan sections modular */}
      <main className="flex-1">
        <HeroSection />
        <StatistikSection />
        <HighlightSection />
        <SekretariatSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Beranda;
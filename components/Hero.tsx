
import React from 'react';
import { ViewState } from '../types';

interface HeroProps {
  onNavigate: (view: ViewState) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const handleCall = () => {
    window.location.href = "tel:+1234567890"; // Standard redirect for phone calls
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden bg-black">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[70%] bg-neon/10 rounded-full blur-[120px] opacity-40" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-zinc-800 rounded-full blur-[100px] opacity-20" />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <span className="inline-block py-2 px-5 mb-8 border border-neon/30 text-neon text-[10px] font-black uppercase tracking-[0.4em] rounded-full bg-neon/5">
          Available for Hire Now
        </span>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black leading-[0.85] tracking-tighter text-white mb-10">
          Visual <br />
          <span className="text-neon neon-glow">Disruption.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed font-medium">
          Premium graphic design for the digital-first generation. Elevating Facebook, Instagram, and YouTube brands with surgical precision.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => onNavigate('work')}
            className="w-full sm:w-auto px-10 py-5 bg-neon text-black font-black rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(57,255,20,0.2)] uppercase text-[11px] tracking-widest"
          >
            Portfolio
          </button>
          <button 
            onClick={() => onNavigate('contact')}
            className="w-full sm:w-auto px-10 py-5 border border-zinc-700 text-white font-black rounded-2xl hover:border-neon hover:text-neon transition-all uppercase text-[11px] tracking-widest bg-zinc-900/30 backdrop-blur-sm"
          >
            Hire Me
          </button>
          <button 
            onClick={handleCall}
            className="w-full sm:w-auto px-10 py-5 border border-white/20 text-white font-black rounded-2xl hover:bg-white hover:text-black transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            Call Me
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

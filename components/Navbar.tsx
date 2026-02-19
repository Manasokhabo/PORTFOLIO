
import React, { useState, useEffect } from 'react';
import { NAV_LINKS } from '../constants';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (view: ViewState) => {
    onViewChange(view);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-black/95 py-4 border-b border-zinc-900' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 items-center">
        {/* Left: Brand */}
        <button 
          onClick={() => handleNavClick('home')}
          className="text-xl font-display font-black tracking-tighter text-white text-left group"
        >
          C<span className="text-neon group-hover:text-white transition-colors">V.</span>
        </button>
        
        {/* Center: Portfolio Link (Highlighted) */}
        <div className="flex justify-center">
          <button 
            onClick={() => handleNavClick('work')}
            className={`text-sm md:text-lg font-black uppercase tracking-[0.3em] transition-all transform hover:scale-105 ${currentView === 'work' ? 'text-neon neon-glow' : 'text-zinc-500 hover:text-white'}`}
          >
            PORTFOLIO
          </button>
        </div>

        {/* Right: Other Links & Admin */}
        <div className="hidden md:flex gap-8 items-center justify-end">
          <button onClick={() => handleNavClick('home')} className={`text-[10px] font-bold uppercase tracking-widest ${currentView === 'home' ? 'text-neon' : 'text-zinc-500 hover:text-white'}`}>Home</button>
          <button onClick={() => handleNavClick('about')} className={`text-[10px] font-bold uppercase tracking-widest ${currentView === 'about' ? 'text-neon' : 'text-zinc-500 hover:text-white'}`}>Expert</button>
          <button onClick={() => handleNavClick('contact')} className={`px-4 py-2 border border-neon text-neon text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-neon hover:text-black transition-all`}>Hire</button>
          <button onClick={() => handleNavClick('admin')} className="text-zinc-800 hover:text-zinc-500 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.533 1.533 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.533 1.533 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white flex justify-end" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-black transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-screen py-8 border-t border-zinc-900' : 'max-h-0'}`}>
        <div className="flex flex-col gap-6 px-6">
          {NAV_LINKS.map(link => (
            <button key={link.name} onClick={() => handleNavClick(link.view as ViewState)} className={`text-sm font-black uppercase tracking-widest text-left ${currentView === link.view ? 'text-neon' : 'text-zinc-500'}`}>{link.name}</button>
          ))}
          <button onClick={() => handleNavClick('admin')} className="text-zinc-800 text-left text-xs uppercase tracking-widest font-bold">Admin Panel</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

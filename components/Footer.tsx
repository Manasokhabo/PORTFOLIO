
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-20 bg-black border-t border-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-display font-black mb-2">CREATIVE<span className="text-neon">CANVAS.</span></h3>
            <p className="text-zinc-500 text-sm max-w-xs uppercase tracking-widest text-[9px] font-bold">Premium Visual Design Laboratory</p>
          </div>
          
          <div className="flex gap-10">
            {['Instagram', 'Facebook', 'YouTube'].map(social => (
              <a key={social} href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-neon transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-zinc-900 gap-6">
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">© 2024 CreativeCanvas Studio. Digital Disruptor.</p>
          <button onClick={() => window.scrollTo(0,0)} className="text-zinc-600 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

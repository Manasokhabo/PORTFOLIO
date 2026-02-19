
import React from 'react';

const About: React.FC = () => {
  const handleCall = () => {
    window.location.href = "tel:+1234567890"; // Placeholder number
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/1234567890", "_blank");
  };

  return (
    <section className="py-24 bg-black min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Photo & Basic Details */}
          <div className="space-y-8">
            <div className="rounded-[40px] overflow-hidden aspect-square border-2 border-zinc-800 shadow-[0_0_40px_rgba(57,255,20,0.05)]">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" 
                alt="Graphic Designer" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-black text-neon neon-glow">Expert Designer</h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                Master of visual communication with a decade of experience in the digital advertising landscape. Specialist in Facebook ads, Instagram branding, and YouTube content optimization.
              </p>
              <div className="pt-4 space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-600">Primary Hub</p>
                <p className="text-zinc-300 font-bold">123 Design Studio, Creative Quarter, NY 10001</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                onClick={handleWhatsApp}
                className="flex-1 px-8 py-4 bg-neon text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)]"
              >
                WhatsApp Me
              </button>
              <button 
                onClick={handleCall}
                className="flex-1 px-8 py-4 border border-zinc-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:border-neon hover:text-neon transition-all"
              >
                Direct Call
              </button>
            </div>
          </div>

          {/* Map & Additional Info */}
          <div className="space-y-8 h-full">
            <div className="rounded-[40px] overflow-hidden border border-zinc-800 h-[400px] lg:h-full min-h-[400px]">
              <iframe 
                title="Office Location"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=New%20York%20Design%20District+(Design%20Studio)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

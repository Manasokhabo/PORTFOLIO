
import React, { useState } from 'react';
import { Project } from '../types';

interface PortfolioProps {
  projects: Project[];
  categories: string[];
}

const Portfolio: React.FC<PortfolioProps> = ({ projects, categories }) => {
  const [filter, setFilter] = useState('All');

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <section id="work" className="py-24 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center mb-16">
          <span className="text-neon text-[10px] font-black uppercase tracking-[0.4em] mb-4">Crafting the Future</span>
          <h2 className="text-4xl md:text-6xl font-display font-black mb-12 tracking-tighter text-center text-white uppercase">Visual Impact.</h2>
          
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${filter === cat ? 'bg-neon text-black border-neon shadow-[0_0_20px_rgba(57,255,20,0.4)]' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.slice().reverse().map((project) => (
              <div 
                key={project.id} 
                className="group relative bg-zinc-950 border border-zinc-900 transition-all duration-700 hover:border-neon/40 shadow-2xl"
              >
                <div className="aspect-video overflow-hidden bg-zinc-900 relative">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-neon text-[7px] font-black uppercase rounded-none mb-2 inline-block">
                      {project.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-display font-black text-white mb-2 tracking-tight group-hover:text-neon transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-zinc-500 text-[11px] leading-relaxed font-medium">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-zinc-700 italic text-sm">No assets currently indexed in this section.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;

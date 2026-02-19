
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import { ViewState, Project } from './types';
import { PROJECTS as INITIAL_PROJECTS } from './constants';

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', 'Facebook', 'Instagram', 'YouTube', 'Branding', 'Print']);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        // Map _id from mongo to id for frontend compatibility if needed
        const mappedData = data.map((p: any) => ({ ...p, id: p._id || p.id }));
        setProjects(mappedData);
      } else {
        const savedProjects = localStorage.getItem('cc_projects');
        setProjects(savedProjects ? JSON.parse(savedProjects) : INITIAL_PROJECTS);
      }
    } catch (error) {
      console.error("Backend fetch failed:", error);
      const savedProjects = localStorage.getItem('cc_projects');
      setProjects(savedProjects ? JSON.parse(savedProjects) : INITIAL_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCats = localStorage.getItem('cc_categories');
    if (savedCats) setCategories(JSON.parse(savedCats));

    const authStatus = localStorage.getItem('cc_admin_auth');
    if (authStatus === 'true') setIsAdminAuthenticated(true);

    fetchProjects();
  }, []);

  const handleUpdateProjects = async (newProjects: Project[]) => {
    // If the last item is new (doesn't have a Mongo-like ID or is recently added in local state)
    const latestProject = newProjects[newProjects.length - 1];
    
    // Check if we are adding or deleting
    if (newProjects.length > projects.length) {
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(latestProject),
        });
        if (response.ok) {
          fetchProjects(); // Refresh from DB to get real IDs
        }
      } catch (e) {
        console.error("Failed to sync project to DB:", e);
      }
    } else {
      // For a real app, you'd add a DELETE endpoint. 
      // For now, we update local state and localStorage as fallback.
      setProjects(newProjects);
      localStorage.setItem('cc_projects', JSON.stringify(newProjects));
    }
  };

  const handleUpdateCategories = (newCats: string[]) => {
    setCategories(newCats);
    localStorage.setItem('cc_categories', JSON.stringify(newCats));
  };

  const handleAdminLogin = (status: boolean) => {
    setIsAdminAuthenticated(status);
    localStorage.setItem('cc_admin_auth', status.toString());
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Thank you! Your inquiry has been saved.");
        (e.target as HTMLFormElement).reset();
      } else {
        alert("Submission failed. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/1234567890?text=Hello! I'm interested in your design services.`, '_blank');
  };

  const handleCall = () => {
    window.location.href = "tel:+1234567890";
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-neon selection:text-black">
      <Navbar currentView={view} onViewChange={setView} />
      
      <main className="pt-20">
        {view === 'home' && <Hero onNavigate={setView} />}
        
        {view === 'work' && <Portfolio projects={projects} categories={categories} />}
        
        {view === 'about' && <About />}
        
        {view === 'contact' && (
          <section className="min-h-screen py-24 px-6 bg-black">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-neon text-[11px] font-black uppercase tracking-[0.3em] mb-4 block">Direct Outreach</span>
                <h2 className="text-5xl md:text-7xl font-display font-black mb-6 tracking-tighter neon-glow uppercase">Start a Project.</h2>
              </div>

              <div className="space-y-12">
                <div className="bg-zinc-900/30 p-8 md:p-12 border border-zinc-800 rounded-[40px]">
                  <h3 className="text-white font-black uppercase text-[10px] tracking-widest mb-8 text-center">Project Inquiry</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-neon text-[9px] font-black uppercase tracking-widest block mb-2">Your Name</label>
                        <input name="name" required type="text" className="w-full bg-black border border-zinc-800 rounded-xl px-6 py-4 text-sm focus:border-neon outline-none transition-all text-white" placeholder="Name" />
                      </div>
                      <div>
                        <label className="text-neon text-[9px] font-black uppercase tracking-widest block mb-2">Email Address</label>
                        <input name="email" required type="email" className="w-full bg-black border border-zinc-800 rounded-xl px-6 py-4 text-sm focus:border-neon outline-none transition-all text-white" placeholder="Email" />
                      </div>
                    </div>
                    <div>
                      <label className="text-neon text-[9px] font-black uppercase tracking-widest block mb-2">Detailed Brief</label>
                      <textarea name="message" required rows={4} className="w-full bg-black border border-zinc-800 rounded-xl px-6 py-4 text-sm focus:border-neon outline-none transition-all text-white" placeholder="Tell me about your brand goals..."></textarea>
                    </div>
                    <button disabled={isSubmitting} type="submit" className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neon transition-all disabled:opacity-50">
                      {isSubmitting ? 'Sending...' : 'Submit Brief'}
                    </button>
                  </form>
                </div>

                <div className="flex justify-center">
                  <button onClick={handleCall} className="group w-full max-w-md py-6 border border-white/10 hover:border-neon/50 text-white font-black uppercase tracking-widest rounded-[30px] transition-all flex items-center justify-center gap-4 bg-zinc-950 shadow-xl">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-neon group-hover:text-black transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    Phone Consultation
                  </button>
                </div>

                <div className="flex justify-center">
                   <div className="w-full max-w-md p-8 rounded-[40px] border border-zinc-800 bg-zinc-900/50 text-center">
                    <h4 className="text-neon font-black text-xs uppercase tracking-widest mb-4">Instant Chat</h4>
                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Let's discuss your project right now on WhatsApp.</p>
                    <button onClick={handleWhatsApp} className="w-full py-5 bg-neon text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Contact via WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'admin' && (
          <AdminPanel 
            projects={projects} 
            onUpdateProjects={handleUpdateProjects} 
            categories={categories}
            onUpdateCategories={handleUpdateCategories}
            isAuthenticated={isAdminAuthenticated}
            onLogin={handleAdminLogin}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;

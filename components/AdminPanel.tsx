import React, { useState, useEffect } from 'react';
import { Project } from '../types';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface AdminPanelProps {
  projects: Project[];
  onUpdateProjects: (projects: Project[]) => void;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
  isAuthenticated: boolean;
  onLogin: (status: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  projects, 
  onUpdateProjects, 
  categories, 
  onUpdateCategories,
  isAuthenticated,
  onLogin
}) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [newProject, setNewProject] = useState({ title: '', category: categories[1] || 'Facebook', image: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'messages' | 'profile'>('projects');
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState('');

  // Cloudinary Upload Logic
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); 

    const res = await fetch(`https://api.cloudinary.com/v1_1/doatrm4lc/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error("Cloudinary Upload Failed");
    const data = await res.json();
    return data.secure_url;
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'messages') fetchInquiries();
      if (activeTab === 'profile') fetchProfileSettings();
    }
  }, [isAuthenticated, activeTab]);

  const fetchInquiries = async () => {
    try {
      setIsLoadingMessages(true);
      const res = await fetch('/api/contact');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load inquiries.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchProfileSettings = async () => {
    try {
      const res = await fetch('/api/settings?key=expert_photo');
      if (res.ok) {
        const data = await res.json();
        if (data && data.value) setCurrentProfilePhoto(data.value);
      }
    } catch (err) {
      console.warn("Profile settings not available.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === 'admin' && password === 'creative123') {
      onLogin(true);
      setError('');
    } else {
      setError('Authorization Denied: Check Operator ID/Access Key.');
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !selectedFile) {
      alert("Validation Error: Title and asset file are mandatory.");
      return;
    }
    
    try {
      setIsUploading(true);
      const secureUrl = await uploadToCloudinary(selectedFile);

      const apiRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProject, image: secureUrl })
      });

      if (apiRes.ok) {
        const responseData = await apiRes.json();
        onUpdateProjects([...projects, responseData]);
        setNewProject({ title: '', category: categories[1] || 'Facebook', image: '', description: '' });
        setSelectedFile(null);
        alert("Success: Asset fully deployed.");
      }
    } catch (err: any) {
      alert(`Critical Fault: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfilePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileFile) return;

    try {
      setIsUpdatingProfile(true);
      const secureUrl = await uploadToCloudinary(selectedProfileFile);

      const apiRes = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'expert_photo', value: secureUrl })
      });

      if (apiRes.ok) {
        setCurrentProfilePhoto(secureUrl);
        setSelectedProfileFile(null);
        alert("Identity Portrait updated.");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeleteLocal = (id: string) => {
    if (confirm("Authorize removal?")) {
      onUpdateProjects(projects.filter(p => p.id !== id));
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="w-full max-w-md p-10 bg-zinc-900 border border-zinc-800 rounded-[40px] shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-black text-white mb-2 uppercase tracking-tighter">Command Login</h2>
            <p className="text-neon text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">Restricted Access Zone</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-zinc-500 text-[9px] font-black uppercase tracking-widest block mb-2">Operator ID</label>
              <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:border-neon outline-none text-white transition-all" placeholder="ID" required />
            </div>
            <div>
              <label className="text-zinc-500 text-[9px] font-black uppercase tracking-widest block mb-2">Access Key</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:border-neon outline-none text-white transition-all" placeholder="••••••••" required />
            </div>
            {error && <p className="text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}
            <button className="w-full py-5 bg-neon text-black font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]">Authenticate</button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-zinc-950 min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div>
            <h2 className="text-3xl font-display font-black text-neon neon-glow uppercase tracking-tighter">Control Hub</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Cloudinary & MongoDB Active</p>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900 p-1 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
             <button onClick={() => setActiveTab('projects')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'projects' ? 'bg-neon text-black' : 'text-zinc-500 hover:text-white'}`}>Assets</button>
             <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-neon text-black' : 'text-zinc-500 hover:text-white'}`}>Identity</button>
             <button onClick={() => setActiveTab('messages')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-neon text-black' : 'text-zinc-500 hover:text-white'}`}>Inquiries</button>
             <button onClick={() => onLogin(false)} className="text-[10px] font-black uppercase text-rose-500 px-4 hover:text-rose-400">Exit</button>
          </div>
        </div>

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl sticky top-28 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-neon">Ingest Asset</h3>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <input type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full bg-black border border-zinc-800 px-4 py-3 text-xs outline-none focus:border-neon rounded-xl text-white" placeholder="Project Title" required />
                  <select value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} className="w-full bg-black border border-zinc-800 px-4 py-3 text-xs outline-none focus:border-neon rounded-xl text-white">
                    {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full bg-black border border-zinc-800 px-4 py-3 text-xs outline-none focus:border-neon rounded-xl text-white h-24" placeholder="Description"></textarea>
                  <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-[10px] text-zinc-500 file:bg-zinc-800 file:text-neon file:border-0 file:rounded-xl file:px-4 file:py-2 file:mr-4 file:font-black file:uppercase file:cursor-pointer" required />
                  <button disabled={isUploading} className="w-full py-5 mt-4 bg-neon text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white transition-all shadow-xl disabled:opacity-50">
                    {isUploading ? 'Uploading to Cloudinary...' : 'Deploy to Portfolio'}
                  </button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {projects.slice().reverse().map((project, idx) => (
                <div key={project.id || idx} className="p-5 bg-zinc-900 border border-zinc-800 flex items-center gap-6 rounded-3xl hover:border-neon/30 transition-all group">
                  <img src={project.image} className="w-16 h-16 object-cover rounded-xl bg-black border border-zinc-800" alt="" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-black uppercase text-xs truncate tracking-wider mb-1">{project.title}</h4>
                    <span className="text-neon text-[8px] font-black uppercase tracking-widest bg-black px-2 py-0.5 rounded border border-neon/10">{project.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map(msg => (
              <div key={msg._id} className="p-8 bg-zinc-900 border border-zinc-800 rounded-[30px] shadow-xl">
                <h4 className="text-white font-black uppercase text-sm mb-1">{msg.name}</h4>
                <p className="text-neon/70 text-[10px] font-mono mb-4">{msg.email}</p>
                <div className="p-5 bg-black/40 rounded-2xl text-zinc-400 text-xs italic">"{msg.message}"</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPanel;

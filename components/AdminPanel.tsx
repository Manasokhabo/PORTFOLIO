
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

  const [newProject, setNewProject] = useState({ title: '', category: categories[1] || 'Facebook', image: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'categories' | 'messages'>('projects');

  useEffect(() => {
    if (isAuthenticated && activeTab === 'messages') {
      fetchMessages();
    }
  }, [isAuthenticated, activeTab]);

  const fetchMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Authentication logic
    if (loginId === 'admin' && password === 'creative123') {
      onLogin(true);
      setError('');
    } else {
      setError('Invalid ID or Password');
    }
  };

  const handleLogout = () => {
    onLogin(false);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !selectedFile) {
      alert("Error: Title and image selection are mandatory.");
      return;
    }
    
    try {
      setIsUploading(true);
      
      // 1. Upload to Cloudinary first to get the URL
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'ml_default'); // Ensure "Unsigned" upload is enabled in Cloudinary

      const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/doatrm4lc/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        throw new Error(`Cloudinary Error: ${errorData.error.message}`);
      }

      const uploadData = await cloudinaryResponse.json();
      const secureUrl = uploadData.secure_url;

      // 2. Save project data to MongoDB via API (sending the URL, not the file)
      const projectPayload = {
        ...newProject,
        image: secureUrl
      };
      
      const apiResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload)
      });

      if (apiResponse.ok) {
        const savedProject = await apiResponse.json();
        onUpdateProjects([...projects, savedProject]);
        setNewProject({ title: '', category: categories[1] || 'Facebook', image: '', description: '' });
        setSelectedFile(null);
        alert("Success: Asset deployed to Cloudinary and MongoDB.");
      } else {
        throw new Error('Database Error: Failed to synchronize metadata to MongoDB');
      }

    } catch (err: any) {
      console.error(err);
      alert(`Deployment Failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName || categories.includes(newCategoryName)) return;
    onUpdateCategories([...categories, newCategoryName]);
    setNewCategoryName('');
  };

  const handleDeleteProject = (id: string) => {
    onUpdateProjects(projects.filter(p => p.id !== id));
  };

  const handleDeleteCategory = (cat: string) => {
    if (cat === 'All') return;
    onUpdateCategories(categories.filter(c => c !== cat));
    onUpdateProjects(projects.map(p => p.category === cat ? { ...p, category: categories[1] || 'Facebook' } : p));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="w-full max-w-md p-10 bg-zinc-900 rounded-[40px] border border-zinc-800 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-black text-white mb-2 uppercase tracking-tighter">HQ Access</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Restricted Administrative Zone</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-neon text-[9px] font-black uppercase tracking-widest block mb-2">Operator ID</label>
              <input 
                type="text" 
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:border-neon outline-none transition-all text-white" 
                placeholder="ID"
                required
              />
            </div>
            <div>
              <label className="text-neon text-[9px] font-black uppercase tracking-widest block mb-2">Access Key</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:border-neon outline-none transition-all text-white" 
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}
            <button className="w-full py-5 bg-neon text-black font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)]">
              Authorize Login
            </button>
          </form>
          {/* Default credentials text removed for a professional finish */}
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-zinc-950 min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-display font-black text-neon neon-glow uppercase tracking-tighter">Command Center</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Asset Sync & Inquiry Management</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl overflow-x-auto">
              <button 
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'projects' ? 'bg-neon text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                Assets
              </button>
              <button 
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'categories' ? 'bg-neon text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                Sections
              </button>
              <button 
                onClick={() => setActiveTab('messages')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-neon text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                Inquiries
              </button>
            </div>
            <button onClick={handleLogout} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-400 transition-colors tracking-widest px-2">Exit</button>
          </div>
        </div>

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="p-8 bg-zinc-900 border border-zinc-800 sticky top-28">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-neon">Cloud Ingest</h3>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Project Title</label>
                    <input 
                      type="text" 
                      value={newProject.title}
                      onChange={e => setNewProject({...newProject, title: e.target.value})}
                      className="w-full bg-black border border-zinc-800 rounded-none px-4 py-3 text-xs outline-none focus:border-neon transition-all"
                      placeholder="e.g. Neon Social Pack"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Section / Category</label>
                    <select 
                      value={newProject.category}
                      onChange={e => setNewProject({...newProject, category: e.target.value})}
                      className="w-full bg-black border border-zinc-800 rounded-none px-4 py-3 text-xs outline-none focus:border-neon transition-all"
                    >
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Source Image</label>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-[9px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-[9px] file:font-black file:bg-zinc-800 file:text-neon hover:file:bg-zinc-700"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Description</label>
                    <textarea 
                      value={newProject.description}
                      onChange={e => setNewProject({...newProject, description: e.target.value})}
                      rows={3}
                      className="w-full bg-black border border-zinc-800 rounded-none px-4 py-3 text-xs outline-none focus:border-neon transition-all"
                      placeholder="Technical specs..."
                    ></textarea>
                  </div>
                  <button 
                    disabled={isUploading}
                    className="w-full py-4 bg-neon text-black font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(57,255,20,0.1)]"
                  >
                    {isUploading ? 'Uploading to Cloud...' : 'Deploy to Portfolio'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
               {projects.length === 0 && <p className="text-zinc-600 text-center py-20 italic">No assets detected.</p>}
               {projects.slice().reverse().map(project => (
                 <div key={project.id} className="p-4 bg-zinc-900 border border-zinc-800 flex items-center gap-6 group hover:border-neon/30 transition-all">
                    <img src={project.image} className="w-20 h-20 object-cover bg-black flex-shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold text-sm truncate">{project.title}</span>
                        <span className="px-2 py-0.5 bg-black text-neon text-[7px] font-black uppercase rounded-none border border-neon/20">{project.category}</span>
                      </div>
                      <p className="text-zinc-500 text-[10px] line-clamp-2 leading-relaxed">{project.description}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-3 text-zinc-700 hover:text-rose-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="max-w-2xl mx-auto">
            <div className="p-8 bg-zinc-900 border border-zinc-800 mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-neon">Create New Section</h3>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-black border border-zinc-800 rounded-none px-4 py-3 text-xs outline-none focus:border-neon transition-all"
                  placeholder="e.g. Motion Design"
                />
                <button 
                  onClick={handleAddCategory}
                  className="px-8 py-3 bg-neon text-black font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(57,255,20,0.1)]"
                >
                  Create
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat} className="p-4 bg-zinc-900 border border-zinc-800 flex justify-between items-center group">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${cat === 'All' ? 'text-zinc-600' : 'text-zinc-300'}`}>{cat}</span>
                  {cat !== 'All' && (
                    <button 
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-zinc-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-neon">Client Inquiries</h3>
              <button onClick={fetchMessages} className="text-[10px] font-bold text-zinc-500 hover:text-neon uppercase tracking-widest flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Sync Data
              </button>
            </div>
            {isLoadingMessages ? (
              <p className="text-center py-20 text-zinc-600 animate-pulse uppercase text-[10px] tracking-widest font-black">Connecting to Secure Vault...</p>
            ) : messages.length === 0 ? (
              <p className="text-center py-20 text-zinc-600 italic">No inquiries recorded yet.</p>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg._id} className="p-8 bg-zinc-900 border border-zinc-800 rounded-none hover:border-neon/30 transition-all">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                      <div>
                        <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1">{msg.name}</h4>
                        <p className="text-neon text-[10px] font-bold">{msg.email}</p>
                      </div>
                      <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-4 bg-black border border-zinc-800/50 text-zinc-400 text-xs leading-relaxed italic">
                      "{msg.message}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPanel;

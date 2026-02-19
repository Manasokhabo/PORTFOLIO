
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { initializeApp, getApps, getApp } from 'https://esm.sh/firebase@10.8.1/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://esm.sh/firebase@10.8.1/storage';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyALTwIfX0TcABVk6hH2CYbVEf3VTsisewA",
  authDomain: "rushi-83249.firebaseapp.com",
  projectId: "rushi-83249",
  storageBucket: "rushi-83249.firebasestorage.app",
  messagingSenderId: "644715981919",
  appId: "1:644715981919:web:1a183b3e398a653688ffea",
  measurementId: "G-6QP1GFF766"
};

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

  const getStorageInstance = () => {
    const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
    return getStorage(app);
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

  const uploadToFirebase = async (file: File, folder: string) => {
    try {
      const storage = getStorageInstance();
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.error("Firebase Storage Error:", err);
      throw new Error("Could not upload to Firebase Storage. Check Storage bucket rules.");
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
      const secureUrl = await uploadToFirebase(selectedFile, 'portfolio');

      const apiRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProject, image: secureUrl })
      });

      if (apiRes.ok) {
        const responseData = await apiRes.json();
        onUpdateProjects([...projects, { ...responseData, id: responseData.id }]);
        setNewProject({ title: '', category: categories[1] || 'Facebook', image: '', description: '' });
        setSelectedFile(null);
        alert("Success: Asset fully deployed to Firebase Vault.");
      } else {
        throw new Error("System synchronization failure.");
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
      const secureUrl = await uploadToFirebase(selectedProfileFile, 'profiles');

      const apiRes = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'expert_photo', value: secureUrl })
      });

      if (apiRes.ok) {
        setCurrentProfilePhoto(secureUrl);
        setSelectedProfileFile(null);
        alert("Identity Portrait updated in Firebase.");
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
            <h2 className="text-3xl font-display font-black text-neon neon-glow uppercase tracking-tighter">Firebase Control Hub</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Real-time Asset Management</p>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900 p-1 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
             <button onClick={() => setActiveTab('projects')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'projects' ? 'bg-neon text-black' : 'text-zinc-500 hover:text-white'}`}>Assets</button>
             <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-neon text-black' : 'text-zinc-500 hover:text-white'}`}>Expert Identity</button>
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
                  <div>
                    <input type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full bg-black border border-zinc-800 px-4 py-3 text-xs outline-none focus:border-neon rounded-xl text-white" placeholder="Project Title" required />
                  </div>
                  <div>
                    <select value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} className="w-full bg-black border border-zinc-800 px-4 py-3 text-xs outline-none focus:border-neon rounded-xl text-white">
                      {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full bg-black border border-zinc-800 px-4 py-3 text-xs outline-none focus:border-neon rounded-xl text-white h-24" placeholder="Brief Description"></textarea>
                  </div>
                  <div className="pt-2">
                    <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-[10px] text-zinc-500 file:bg-zinc-800 file:text-neon file:border-0 file:rounded-xl file:px-4 file:py-2 file:mr-4 file:font-black file:uppercase file:cursor-pointer" required />
                  </div>
                  <button disabled={isUploading} className="w-full py-5 mt-4 bg-neon text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white transition-all shadow-xl disabled:opacity-50">
                    {isUploading ? 'Syncing to Firebase...' : 'Deploy to Portfolio'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 px-2 mb-4">Firestore Project Repository ({projects.length})</p>
              {projects.length === 0 ? (
                <div className="p-20 text-center bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                  <p className="text-zinc-600 italic">No assets detected.</p>
                </div>
              ) : (
                projects.slice().reverse().map((project, idx) => (
                  <div key={project.id || idx} className="p-5 bg-zinc-900 border border-zinc-800 flex items-center gap-6 rounded-3xl hover:border-neon/30 transition-all group">
                    <img src={project.image} className="w-16 h-16 object-cover rounded-xl bg-black border border-zinc-800" alt="" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-black uppercase text-xs truncate tracking-wider mb-1">{project.title}</h4>
                      <span className="text-neon text-[8px] font-black uppercase tracking-widest bg-black px-2 py-0.5 rounded border border-neon/10">{project.category}</span>
                    </div>
                    <button onClick={() => handleDeleteLocal(project.id)} className="p-3 text-zinc-700 hover:text-rose-500 transition-colors bg-black/50 rounded-xl">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto">
            <div className="p-10 bg-zinc-900 border border-zinc-800 rounded-[40px] shadow-2xl">
               <h3 className="text-xl font-display font-black text-neon uppercase tracking-widest mb-8 text-center">Identity Management</h3>
               <div className="flex justify-center mb-10">
                  <div className="w-48 h-48 rounded-[30px] overflow-hidden border-2 border-zinc-800 bg-black relative group shadow-2xl">
                    <img src={currentProfilePhoto || 'https://via.placeholder.com/400?text=Profile+Photo'} className="w-full h-full object-cover" alt="Profile" />
                    {isUpdatingProfile && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
               </div>
               <form onSubmit={handleUpdateProfilePhoto} className="space-y-6">
                 <div>
                    <label className="text-zinc-500 text-[9px] font-black uppercase tracking-widest block mb-4 text-center">New Expert Portrait</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => setSelectedProfileFile(e.target.files?.[0] || null)}
                      className="w-full text-[10px] text-zinc-500 file:bg-zinc-800 file:text-neon file:border-0 file:rounded-xl file:px-6 file:py-3 file:mr-4 file:font-black file:uppercase file:cursor-pointer transition-all"
                    />
                 </div>
                 <button 
                  disabled={isUpdatingProfile || !selectedProfileFile} 
                  className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-neon transition-all shadow-xl disabled:opacity-50"
                 >
                   {isUpdatingProfile ? 'Processing Identity Update...' : 'Commit Portrait Change'}
                 </button>
               </form>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-neon mb-6 px-4">Incoming Client Briefs</h3>
            {isLoadingMessages ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-zinc-500 uppercase tracking-widest text-[9px]">Scanning Firebase Vault...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-20 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800">
                <p className="text-zinc-600 italic">No incoming briefs found.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg._id} className="p-8 bg-zinc-900 border border-zinc-800 rounded-[30px] shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-white font-black uppercase text-sm mb-1">{msg.name}</h4>
                      <p className="text-neon/70 text-[10px] font-mono">{msg.email}</p>
                    </div>
                    <span className="text-zinc-600 text-[8px] uppercase font-black">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="p-5 bg-black/40 rounded-2xl text-zinc-400 text-xs italic leading-relaxed">
                    "{msg.message}"
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPanel;

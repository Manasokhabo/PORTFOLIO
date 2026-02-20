import React, { useState, useEffect } from 'react';
import { Project } from '../types';
// ফায়ারবেস ইম্পোর্ট সব বাদ

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

  // ১. তোর Cloudinary আপলোড ফাংশন (তোর Cloud Name ও Preset দিয়ে সেট করা)
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // তোর স্ক্রিনশটের Unsigned Preset

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

  // ২. প্রোজেক্ট সেভ করার লজিক (Firebase-এর বদলে Cloudinary লিঙ্ক নিয়ে MongoDB-তে যাবে)
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !selectedFile) {
      alert("Validation Error: Title and asset file are mandatory.");
      return;
    }
    
    try {
      setIsUploading(true);
      const secureUrl = await uploadToCloudinary(selectedFile); // ছবি ক্লাউডিনারিতে গেল

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
        alert("Success: Asset fully deployed to Cloudinary & MongoDB.");
      }
    } catch (err: any) {
      alert(`Critical Fault: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // ৩. প্রোফাইল ফটো আপলোড লজিক
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

  // ডিজাইন পার্ট (তোর অরিজিনাল কোডের ডিজাইন - ১০০% সেম রাখা হয়েছে)
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
      {/* এখানে তোর সব ট্যাব এবং ফর্মের কোড থাকতে হবে */}
      {activeTab === 'projects' && ( <div> ... </div> )}
    </div>
  </section>
);

export default AdminPanel;


import { Project } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'fb-1',
    title: 'Growth Accelerator',
    category: 'Facebook',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600',
    description: 'Data-driven visual sets for high-spend Facebook ad campaigns focusing on ROI.'
  },
  {
    id: 'ig-1',
    title: 'Aesthetic Flow',
    category: 'Instagram',
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=600',
    description: 'Curated minimalist grid layouts for premium lifestyle and fashion influencers.'
  },
  {
    id: 'yt-1',
    title: 'Creator Identity',
    category: 'YouTube',
    image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&q=80&w=600',
    description: 'High-CTR thumbnail designs and cohesive channel branding for tech creators.'
  },
  {
    id: 'br-1',
    title: 'Visual Core',
    category: 'Branding',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600',
    description: 'Comprehensive brand architecture including custom iconography and color systems.'
  }
];

export const NAV_LINKS = [
  { name: 'Home', view: 'home' },
  { name: 'Portfolio', view: 'work' },
  { name: 'Expert', view: 'about' },
  { name: 'Hire', view: 'contact' }
];

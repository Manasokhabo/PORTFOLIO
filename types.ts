
export type Category = 'Facebook' | 'Instagram' | 'YouTube' | 'Branding' | 'Print' | string;

export interface Project {
  id: string;
  title: string;
  category: Category;
  image: string;
  description: string;
}

export type ViewState = 'home' | 'work' | 'about' | 'contact' | 'admin';

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export interface DesignBrief {
  clientName: string;
  projectType: string;
  objectives: string[];
  targetAudience: string;
  styleKeywords: string[];
}

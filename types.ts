export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  imageUrl?: string; // Base64 or URL
  imagePrompt?: string; // Used to generate the image
}

export interface GeneratorState {
  isActive: boolean;
  isGenerating: boolean;
  lastRunTime: number | null;
  nextRunTime: number | null;
  logs: string[];
  intervalSeconds: number;
}

export interface GeneratedContentResponse {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  author: string;
  readTime: string;
  imagePrompt: string;
}

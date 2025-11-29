import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import AutoPilotStatus from './components/AutoPilotStatus';
import { BlogPost as BlogPostType, GeneratorState } from './types';
import { generateBlogContent, generateBlogImage } from './services/geminiService';
import { initDb, getPosts, createPost } from './services/db';
import { AlertCircle } from 'lucide-react';

const GENERATION_INTERVAL_SECONDS = 30; // 30 seconds for demo purposes
const MAX_LOGS = 20;

const App: React.FC = () => {
  // State
  const [view, setView] = useState<'list' | 'post'>('list');
  const [activePost, setActivePost] = useState<BlogPostType | null>(null);
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  
  const [genState, setGenState] = useState<GeneratorState>({
    isActive: false,
    isGenerating: false,
    lastRunTime: null,
    nextRunTime: null,
    logs: ["Initializing Look Trending..."],
    intervalSeconds: GENERATION_INTERVAL_SECONDS
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize DB and load posts on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        addLog("Connecting to Database...");
        await initDb();
        addLog("Fetching latest trends...");
        const dbPosts = await getPosts();
        setPosts(dbPosts);
        addLog(`Loaded ${dbPosts.length} articles.`);
      } catch (e) {
        console.error("Failed to load from DB", e);
        addLog(`DB Error: ${(e as Error).message}`);
      }
    };
    initialize();
  }, []);

  // Logging Helper
  const addLog = useCallback((msg: string) => {
    setGenState(prev => ({
      ...prev,
      logs: [...prev.logs, msg].slice(-MAX_LOGS)
    }));
  }, []);

  // Generation Logic
  const generatePost = useCallback(async () => {
    if (genState.isGenerating) return;

    setGenState(prev => ({ ...prev, isGenerating: true }));
    addLog("Starting news research cycle...");

    try {
      addLog("Scouring Google Search for trending topics...");
      // Pass existing titles to avoid duplicates
      const existingTitles = posts.map(p => p.title);
      const content = await generateBlogContent(existingTitles);
      
      addLog(`Trend found: "${content.title}"`);
      addLog("Generating editorial image...");
      
      let imageUrl: string | undefined = undefined;
      if (content.imagePrompt) {
         imageUrl = await generateBlogImage(content.imagePrompt);
      }
      
      if (imageUrl) {
        addLog("Image acquired.");
      } else {
        addLog("Image generation returned no data, using fallback.");
      }

      const newPost: BlogPostType = {
        id: Date.now().toString(),
        title: content.title,
        content: content.content,
        excerpt: content.excerpt,
        author: content.author,
        readTime: content.readTime,
        tags: content.tags,
        date: new Date().toISOString(),
        imagePrompt: content.imagePrompt,
        imageUrl: imageUrl
      };

      addLog("Publishing article to database...");
      await createPost(newPost);
      
      setPosts(prev => [newPost, ...prev]);
      addLog("Article published successfully.");
      
    } catch (error) {
      console.error(error);
      addLog(`Error: ${(error as Error).message}`);
    } finally {
      setGenState(prev => {
        const now = Date.now();
        return {
          ...prev,
          isGenerating: false,
          lastRunTime: now,
          nextRunTime: prev.isActive ? now + (prev.intervalSeconds * 1000) : null
        };
      });
    }
  }, [addLog, genState.isGenerating, posts]);

  // Cron Simulation Effect
  useEffect(() => {
    if (genState.isActive && !genState.isGenerating) {
      // If we just activated, or after a generation finished
      if (!genState.nextRunTime) {
        // Initial run logic: run immediately if list is empty, else schedule
        const delay = posts.length === 0 ? 0 : genState.intervalSeconds * 1000;
        
        setGenState(prev => ({
          ...prev,
          nextRunTime: Date.now() + delay
        }));
      }

      // Set up the interval checker
      timerRef.current = setInterval(() => {
        const now = Date.now();
        if (genState.nextRunTime && now >= genState.nextRunTime) {
           generatePost();
        }
      }, 1000); // Check every second
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [genState.isActive, genState.isGenerating, genState.nextRunTime, generatePost, posts.length, genState.intervalSeconds]);


  // Handlers
  const toggleAutoPilot = () => {
    setGenState(prev => {
      const newState = !prev.isActive;
      addLog(newState ? "News Agent ENABLED." : "News Agent PAUSED.");
      return {
        ...prev,
        isActive: newState,
        nextRunTime: newState ? Date.now() + (prev.intervalSeconds * 1000) : null
      };
    });
  };

  const forceRun = () => {
    addLog("Manual research triggered.");
    generatePost();
  };

  const handleSelectPost = (post: BlogPostType) => {
    setActivePost(post);
    setView('post');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActivePost(null);
    setView('list');
  };

  // Helper to find related posts based on tags
  const getRelatedPosts = (current: BlogPostType, allPosts: BlogPostType[]) => {
    const currentTags = new Set(current.tags.map(t => t.toLowerCase()));
    return allPosts
      .filter(p => p.id !== current.id)
      .map(p => ({
        post: p,
        // Calculate number of matching tags
        score: p.tags.filter(t => currentTags.has(t.toLowerCase())).length
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score) // Sort by most matches
      .map(result => result.post)
      .slice(0, 3); // Take top 3
  };

  // View
  if (view === 'post' && activePost) {
    const relatedPosts = getRelatedPosts(activePost, posts);
    return (
      <div className="bg-gray-50 min-h-screen">
        <BlogPost 
          post={activePost} 
          relatedPosts={relatedPosts}
          onBack={handleBack}
          onSelectPost={handleSelectPost} 
        />
        <AutoPilotStatus 
            state={genState} 
            onToggle={toggleAutoPilot} 
            onForceRun={forceRun} 
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          {!process.env.API_KEY && (
             <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center justify-center gap-2">
               <AlertCircle size={20} />
               <span>Missing API Key. Please configure process.env.API_KEY to start.</span>
             </div>
          )}
        </div>

        <BlogList posts={posts} onSelectPost={handleSelectPost} />
      </main>

      <AutoPilotStatus 
        state={genState} 
        onToggle={toggleAutoPilot} 
        onForceRun={forceRun} 
      />
    </div>
  );
};

export default App;
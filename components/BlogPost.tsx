import React from 'react';
import { BlogPost as BlogPostType } from '../types';
import { ArrowLeft, Calendar, Clock, User, Share2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BlogPostProps {
  post: BlogPostType;
  relatedPosts: BlogPostType[];
  onBack: () => void;
  onSelectPost: (post: BlogPostType) => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, relatedPosts, onBack, onSelectPost }) => {

  return (
    <article className="bg-white min-h-screen pb-20">
      {/* Hero Image */}
      <div className="w-full h-[50vh] relative bg-gray-900">
        {post.imageUrl && (
            <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-full object-cover opacity-80"
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute top-6 left-6 z-10">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full transition-all text-sm font-medium border border-white/20"
            >
                <ArrowLeft size={16} />
                Back to Feed
            </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap gap-3 mb-6">
                    {post.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-indigo-500/80 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
                    {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-gray-200 text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                        <User size={18} />
                        <span className="font-medium">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span>{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span>{post.readTime}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
        <div className="markdown-content font-serif">
            <ReactMarkdown
              components={{
                a: (props) => (
                  <a 
                    {...props} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 hover:text-indigo-800 underline break-all" 
                  />
                )
              }}
            >
              {post.content}
            </ReactMarkdown>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Written By</span>
                <span className="font-bold text-gray-900 text-lg">{post.author}</span>
            </div>
            <button className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                <Share2 size={18} />
                Share Post
            </button>
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-8">Related Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <div 
                  key={related.id} 
                  onClick={() => onSelectPost(related)}
                  className="group cursor-pointer flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-[3/2] overflow-hidden bg-gray-100">
                    {related.imageUrl ? (
                      <img 
                        src={related.imageUrl} 
                        alt={related.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                       {related.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                              {tag}
                          </span>
                       ))}
                    </div>
                    <h4 className="font-serif font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {related.title}
                    </h4>
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500">
                       <span>{new Date(related.date).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform text-gray-900">
                          Read <ArrowRight size={12} />
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogPost;
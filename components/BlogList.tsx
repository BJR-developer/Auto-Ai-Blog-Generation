import React from 'react';
import { BlogPost } from '../types';
import { Clock, User, ArrowRight } from 'lucide-react';

interface BlogListProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
}

const BlogList: React.FC<BlogListProps> = ({ posts, onSelectPost }) => {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <Clock className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
        <p className="text-gray-500 mt-2 max-w-sm">
          Activate Auto-Pilot or click "Generate Now" to let Gemini AI start writing your blog.
        </p>
      </div>
    );
  }

  // Featured Post (Most Recent)
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="space-y-12">
      {/* Featured Post */}
      <div 
        onClick={() => onSelectPost(featuredPost)}
        className="group relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center cursor-pointer"
      >
        <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
          {featuredPost.imageUrl ? (
            <img 
              src={featuredPost.imageUrl} 
              alt={featuredPost.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-200">
                No Image
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center space-y-4">
            <div className="flex flex-wrap gap-2">
                {featuredPost.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
                        {tag}
                    </span>
                ))}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors font-serif leading-tight">
                {featuredPost.title}
            </h2>
            <p className="text-gray-600 text-lg line-clamp-3 leading-relaxed">
                {featuredPost.excerpt}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                <div className="flex items-center gap-1.5">
                    <User size={16} />
                    {featuredPost.author}
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    {featuredPost.readTime}
                </div>
            </div>
        </div>
      </div>

      {/* Grid of Other Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {otherPosts.map((post) => (
          <div 
            key={post.id} 
            onClick={() => onSelectPost(post)}
            className="group cursor-pointer flex flex-col h-full"
          >
            <div className="aspect-[3/2] overflow-hidden rounded-xl bg-gray-100 mb-4 shadow-sm border border-gray-100">
               {post.imageUrl ? (
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gray-100" />
              )}
            </div>
            <div className="flex-1 flex flex-col">
                <div className="flex gap-2 mb-3">
                    {post.tags.slice(0, 1).map(tag => (
                        <span key={tag} className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors font-serif">
                    {post.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                    {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-400 font-medium">
                        {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 group-hover:translate-x-1 transition-transform">
                        Read <ArrowRight size={14} />
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogList;

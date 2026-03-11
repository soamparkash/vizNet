import React from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blogs'; // ✅ IMPORT DATA

const BlogPreview = () => {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-indigo-600 font-bold uppercase tracking-wider text-sm">From the Journal</span>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mt-2">Design Inspiration</h2>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {BLOG_POSTS.map((post) => (
            <Link to={`/blog/${post.id}`} key={post.id} className="group cursor-pointer flex flex-col h-full">
              
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl mb-5 aspect-[4/3]">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide">
                  {post.category}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14}/> {post.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-auto">
                   <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {post.author.charAt(0)}
                   </div>
                   <span className="text-sm font-medium text-gray-900">{post.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogPreview;
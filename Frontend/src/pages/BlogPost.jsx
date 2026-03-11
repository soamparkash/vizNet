import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogs'; // Import shared data

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the post that matches the ID from the URL
  const post = BLOG_POSTS.find(p => p.id === parseInt(id));

  // Handle case where post doesn't exist
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-bold hover:underline">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white pb-20">
      
      {/* Hero Image */}
      <div className="w-full h-[50vh] relative">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        
        {/* Back Button */}
        <Link to="/" className="absolute top-8 left-8 z-20 bg-white/90 backdrop-blur p-3 rounded-full hover:bg-white transition shadow-lg text-gray-900">
           <ArrowLeft size={24} />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-20">
        
        {/* Title Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-10">
           <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider mb-3">
              <span className="bg-indigo-50 px-3 py-1 rounded-full">{post.category}</span>
           </div>
           
           <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
             {post.title}
           </h1>

           <div className="flex items-center gap-6 text-gray-500 text-sm border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                    {post.author.charAt(0)}
                 </div>
                 <span className="font-medium text-gray-900">{post.author}</span>
              </div>
              <span className="flex items-center gap-1"><Calendar size={16}/> {post.date}</span>
              <span className="flex items-center gap-1"><Clock size={16}/> {post.readTime}</span>
           </div>
        </div>

        {/* Content Body */}
        <div 
          className="prose prose-lg prose-indigo text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 mt-16 pt-10 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Enjoyed this article?</h3>
            <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition">
               <ArrowLeft size={18} /> Back to Home
            </Link>
        </div>

      </div>
    </article>
  );
};

export default BlogPost;
import React, { useState, useMemo } from 'react';
import { Star, User, Edit2 } from 'lucide-react';

const ReviewSection = ({ product, currentUser, onSubmitReview, onEditReview }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const [filterStar, setFilterStar] = useState('All');
  const [visibleCount, setVisibleCount] = useState(3);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // 1. Get Reviews Safely
  const reviews = product.reviews || [];
  const totalReviews = reviews.length;

  // 2. Identify User's Review
  const userReview = currentUser ? reviews.find(r => r.user === currentUser._id || r.user?._id === currentUser._id) : null;
  const hasReviewed = !!userReview;

  // 3. Time Ago Helper
  const timeAgo = (dateParam) => {
    if (!dateParam) return null;
    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
    const today = new Date();
    const seconds = Math.round((today - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30);
    const years = Math.round(days / 365);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 30) return `${days} days ago`;
    if (months < 12) return `${months} months ago`;
    return `${years} years ago`;
  };

  // 4. Breakdown Logic
  const breakdown = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percent = totalReviews === 0 ? 0 : (count / totalReviews) * 100;
    return { star, count, percent };
  });

  // 5. SORTING & FILTERING
  const displayReviews = useMemo(() => {
    let filtered = filterStar === 'All' ? [...reviews] : reviews.filter(r => r.rating === filterStar);
    
    // Sort: Current User's review first, then by date (newest first)
    filtered.sort((a, b) => {
      // Rule 1: Current user always on top
      const aIsUser = currentUser && (a.user === currentUser._id || a.user?._id === currentUser._id);
      const bIsUser = currentUser && (b.user === currentUser._id || b.user?._id === currentUser._id);
      
      if (aIsUser) return -1;
      if (bIsUser) return 1;

      // Rule 2: Sort by date (Newest first)
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });

    return filtered;
  }, [reviews, filterStar, currentUser]);

  // 6. Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingReviewId) {
        onEditReview(editingReviewId, { rating, comment });
        setEditingReviewId(null);
        setComment('');
        setRating(5);
    } else {
        onSubmitReview({ rating, comment });
        setComment('');
        setRating(5);
    }
  };

  const startEdit = (review) => {
      if (!review) return;
      setEditingReviewId(review._id);
      setRating(review.rating);
      setComment(review.comment);
      // Scroll to form
      setTimeout(() => {
        document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  const cancelEdit = () => {
      setEditingReviewId(null);
      setRating(5);
      setComment('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      {/* LEFT: RATINGS SUMMARY */}
      <div className="lg:col-span-1">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl font-bold text-gray-900">{product.rating || 0}</span>
          <div>
             <div className="flex text-yellow-400"><Star fill="currentColor" /></div>
             <p className="text-gray-500 text-sm">{totalReviews} Ratings</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
           {breakdown.map((item) => (
             <button 
               key={item.star} 
               onClick={() => setFilterStar(filterStar === item.star ? 'All' : item.star)}
               className={`w-full flex items-center gap-3 group ${filterStar === item.star ? 'ring-2 ring-indigo-100 rounded p-1' : 'opacity-80'}`}
             >
                <span className="text-sm font-bold w-3">{item.star}</span>
                <Star size={14} className="text-gray-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-yellow-400" style={{ width: `${item.percent}%` }}></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{item.count}</span>
             </button>
           ))}
        </div>

        {/* WRITE / EDIT REVIEW FORM */}
        {(!hasReviewed || editingReviewId) && (
            <div id="review-form" className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="font-bold mb-4">{editingReviewId ? 'Edit Your Review' : 'Write a Review'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button type="button" key={star} onClick={() => setRating(star)} className={`transition ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        <Star fill="currentColor" size={24} />
                        </button>
                    ))}
                </div>
                <textarea 
                    className="w-full border p-3 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    rows="4" 
                    placeholder="Share your thoughts..." 
                    value={comment} 
                    onChange={e => setComment(e.target.value)}
                    required
                />
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700">
                        {editingReviewId ? 'Update Review' : 'Submit Review'}
                    </button>
                    {editingReviewId && (
                        <button type="button" onClick={cancelEdit} className="px-3 bg-gray-200 rounded-lg text-sm">Cancel</button>
                    )}
                </div>
            </form>
            </div>
        )}
        
        {hasReviewed && !editingReviewId && (
            <button 
                onClick={() => startEdit(userReview)}
                className="w-full py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition flex items-center justify-center gap-2"
            >
                <Edit2 size={16} /> Edit Your Review
            </button>
        )}

      </div>

      {/* RIGHT: REVIEWS LIST */}
      <div className="lg:col-span-2">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">
                {filterStar === 'All' ? 'All Reviews' : `${filterStar}-Star Reviews`} 
                <span className="text-gray-400 ml-2 text-sm">({displayReviews.length})</span>
            </h3>
            {filterStar !== 'All' && <button onClick={() => setFilterStar('All')} className="text-indigo-600 text-sm hover:underline">Clear Filter</button>}
         </div>

         {displayReviews.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl">
               <p className="text-gray-500">No reviews found with this rating.</p>
            </div>
         ) : (
            <div className="space-y-6">
               {displayReviews.slice(0, visibleCount).map((review) => {
                  const isOwnReview = currentUser && (review.user === currentUser._id || review.user?._id === currentUser._id);
                  
                  return (
                    <div key={review._id} className={`border-b border-gray-100 pb-6 last:border-0 relative group ${isOwnReview ? 'bg-indigo-50/50 p-4 rounded-xl border-indigo-100' : ''}`}>
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-2">
                            {/* User Info */}
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isOwnReview ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                                    <User size={14} />
                                </div>
                                <div>
                                    <span className={`font-bold text-sm block ${isOwnReview ? 'text-indigo-900' : 'text-gray-900'}`}>
                                        {isOwnReview ? "You" : (review.name || "Anonymous")}
                                    </span>
                                </div>
                            </div>

                            {/* Date & Edit Button Container */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(review.createdAt)}</span>
                                    {/* ✅ NEW: Edited Indicator */}
                                    {review.isEdited && (
                                        <span className="text-xs text-gray-400 italic ml-1 opacity-70">(edited)</span>
                                    )}
                                </div>
                                
                                {isOwnReview && (
                                    <button 
                                        onClick={() => startEdit(review)} 
                                        className="text-gray-400 hover:text-indigo-600 transition p-1"
                                        title="Edit Review"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stars */}
                        <div className="flex text-yellow-400 mb-2 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                            ))}
                        </div>

                        {/* Comment */}
                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  );
               })}

               {visibleCount < displayReviews.length && (
                  <button onClick={() => setVisibleCount(prev => prev + 5)} className="w-full py-3 bg-gray-50 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-100">
                      Load More Reviews
                  </button>
               )}
            </div>
         )}
      </div>
    </div>
  );
};

export default ReviewSection;
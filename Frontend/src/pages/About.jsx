import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-serif font-bold text-gray-900 mb-8">About VizNest</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-12">
          VizNest is more than a store — it's a sanctuary for those who believe a home should feel like a reflection of the soul.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          We curate timeless pieces that blend comfort, craftsmanship, and quiet luxury. 
          Every chair, lamp, and textile is chosen to help you create spaces that inspire calm, warmth, and joy — 
          day after day, season after season.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mt-8 max-w-2xl mx-auto">
          Welcome home.
        </p>
      </div>
    </div>
  );
};

export default About;
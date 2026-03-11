import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const EnhancedHero = () => {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000",
      title: "Craft Your Sanctuary",
      subtitle: "Where timeless design meets everyday comfort."
    },
    {
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=2000",
      title: "Textures That Breathe",
      subtitle: "Layer luxury into every corner of your home."
    },
    {
      image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=2000",
      title: "Light the Way Home",
      subtitle: "Illuminate spaces that inspire and soothe."
    }
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-rose-500/20" />

      <div className="relative z-10 flex items-center h-full px-8 lg:px-20">
        <div className="max-w-3xl text-white">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            {slides[current].title}
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-100">
            {slides[current].subtitle}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-4 bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition shadow-2xl"
          >
            Explore Collection <ArrowRight size={24} />
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition ${
              i === current ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default EnhancedHero;
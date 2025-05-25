"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <motion.div 
      className="fixed inset-0 bg-indigo-900 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="text-center"
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-white"
          animate={{ 
            y: [0, -20, 0], 
            textShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 40px rgba(255,255,255,0.8)", "0px 0px 0px rgba(255,255,255,0)"] 
          }}
          transition={{ duration: 2, times: [0, 0.5, 1] }}
        >
          Dhaneja
        </motion.h1>
        
        <motion.p
          className="text-lg md:text-xl text-indigo-200 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Elevate Your Style
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

const categories = [
  {
    id: 'saree',
    name: 'Sarees',
    image: 'https://images.unsplash.com/photo-1610189018414-7301bd85dd5e',
    description: 'Elegant and traditional sarees for every occasion',
  },
  {
    id: 'mens',
    name: "Men's Clothing",
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59',
    description: 'Stylish and comfortable clothing for men',
  },
  {
    id: 'kids',
    name: 'Kids Wear',
    image: 'https://images.unsplash.com/photo-1543363136-3fdb62e11be5',
    description: 'Adorable and durable clothing for your little ones',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1512163143273-bde0e3cc7407',
    description: 'Complete your outfit with our unique accessories',
  },
];

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);
  
  useEffect(() => {
    // Check if user has already visited the site in this session
    const visited = sessionStorage.getItem('visited');
    if (visited) {
      setShowIntro(false);
      setHasVisited(true);
    } else {
      sessionStorage.setItem('visited', 'true');
    }
  }, []);
  
  const handleIntroComplete = () => {
    setShowIntro(false);
    setHasVisited(true);
  };
  
  return (
    <main>
      <AnimatePresence>
        {showIntro && !hasVisited && (
          <IntroAnimation onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: hasVisited ? 0 : 3.5, duration: 1 }}
        className="relative h-[70vh] bg-gradient-to-r from-indigo-500 to-purple-600"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <Image 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-lg">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: hasVisited ? 0.2 : 3.7, duration: 0.8 }}
            >
              Discover Timeless Elegance
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white mb-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: hasVisited ? 0.4 : 3.9, duration: 0.8 }}
            >
              Explore our handcrafted collection of premium clothing and accessories.
            </motion.p>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: hasVisited ? 0.6 : 4.1, duration: 0.8 }}
            >
              <Link href="/products" className="bg-white text-indigo-600 px-6 py-3 rounded-md font-medium text-lg hover:bg-gray-100 transition-colors inline-block">
                Shop Now
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Browse By Category
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/products/category/${category.id}`} className="block group">
                  <div className="relative h-72 rounded-lg overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={500}
                      height={500}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition-opacity"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-center text-sm">{category.description}</p>
                      <span className="mt-4 px-4 py-2 border border-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        Shop Now
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="bg-indigo-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-indigo-100 mb-8">
              Stay updated with the latest trends and exclusive offers.
            </p>
            <form className="flex flex-wrap">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-l-md focus:outline-none min-w-0"
              />
              <button
                type="submit"
                className="bg-gray-900 text-white px-6 py-3 rounded-r-md font-medium hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { IProduct } from '@/models/Product';

function ProductsList() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
    
    fetchProducts(categoryParam || 'all');
  }, [categoryParam]);
  
  const fetchProducts = async (category: string) => {
    try {
      setLoading(true);
      const url = category === 'all' 
        ? '/api/products'
        : `/api/products?category=${category}`;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    fetchProducts(category);
  };
  
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'saree', name: 'Sarees' },
    { id: 'mens', name: 'Men\'s Clothing' },
    { id: 'kids', name: 'Kids Wear' },
    { id: 'accessories', name: 'Accessories' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      {/* Categories navigation */}
      <div className="flex flex-wrap gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-md ${
              activeCategory === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600">No products found in this category.</h2>
          <p className="mt-2 text-gray-500">Please check back later or explore other categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsList />
    </Suspense>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  discount?: number;
}

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.stock) {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
          <p className="text-red-700">{error || 'Product not found'}</p>
        </div>
        <Link href="/products" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Products
        </Link>
      </div>
    );
  }
  
  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <div className="relative h-96 md:h-[600px] rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
            {product.discount && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-md">
                {product.discount}% OFF
              </div>
            )}
          </div>
        </div>
        
        <div className="md:w-1/2">
          <nav className="flex mb-4 text-sm">
            <Link href="/products" className="text-gray-500 hover:text-indigo-600">
              Products
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href={`/products/category/${product.category}`} className="text-gray-500 hover:text-indigo-600 capitalize">
              {product.category}
            </Link>
          </nav>
          
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center mb-6">
            <span className="text-2xl font-bold text-gray-900 mr-3">
              ₹{discountedPrice.toFixed(2)}
            </span>
            
            {product.discount && (
              <span className="text-lg text-gray-500 line-through">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="prose max-w-none mb-8">
            <p>{product.description}</p>
          </div>
          
          <div className="mb-8">
            <p className="mb-2">
              <span className="font-semibold">Availability:</span>{' '}
              {product.stock > 0 ? (
                <span className="text-green-600">In Stock ({product.stock} items)</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </p>
            <p>
              <span className="font-semibold">Category:</span>{' '}
              <span className="capitalize">{product.category}</span>
            </p>
          </div>
          
          <div className="flex items-center mb-6">
            <label htmlFor="quantity" className="mr-4 font-medium">
              Quantity:
            </label>
            <div className="flex items-center">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="bg-gray-200 px-3 py-1 rounded-l-md hover:bg-gray-300"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={product.stock}
                className="w-16 text-center border-y border-gray-300 py-1 focus:outline-none"
              />
              <button
                onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                className="bg-gray-200 px-3 py-1 rounded-r-md hover:bg-gray-300"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              Add to Cart
            </button>
            
            <button className="border border-gray-300 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { IProduct } from '@/models/Product';

interface ProductCardProps {
  product: IProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  
  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;
    
  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-md transition-shadow hover:shadow-xl">
      <Link href={`/products/${product._id}`}>
        <div className="relative h-64 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              {product.discount}% OFF
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="text-lg font-medium text-gray-800 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-center">
          <span className="text-lg font-bold text-gray-900">
            ₹{discountedPrice.toFixed(2)}
          </span>
          
          {product.discount && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              ₹{product.price.toFixed(2)}
            </span>
          )}
        </div>
        
        <button
          onClick={() => addToCart(product, 1)}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

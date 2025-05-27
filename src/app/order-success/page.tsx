"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OrderSuccessPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  if (!user) return null;
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-green-600">Order Placed Successfully!</h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for your order. We&apos;ve received your order and will begin processing it right away.
          You will receive an email confirmation shortly.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/orders" className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors">
            View My Orders
          </Link>
          
          <Link href="/products" className="border border-gray-300 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

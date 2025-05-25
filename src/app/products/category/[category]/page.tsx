"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import ProductsPage from '../../page';

export default function CategoryPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  
  if (!category) {
    redirect('/products');
  }
  
  return <ProductsPage />;
}

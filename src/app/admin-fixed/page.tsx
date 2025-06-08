"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  images?: string[];
  stock: number;
  discount?: number;
  position?: number;
}

export default function AdminFixed() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'saree',
    imageUrl: '/uploads/sample1.jpg',
    images: ['/uploads/sample1.jpg'],
    stock: 0,
    discount: 0,
    position: 0
  });

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/');
      return;
    } else if (!user) {
      router.push('/login');
      return;
    }
    
    if (token && user && user.isAdmin) {
      fetchProducts();
    }
  }, [user, token, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.sort((a: Product, b: Product) => 
        (a.position || 0) - (b.position || 0)
      ));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' || name === 'discount' || name === 'position'
        ? parseFloat(value) || 0
        : value
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      console.log('Uploading single image:', file.name);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: uploadFormData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const result = await response.json();
      console.log('Image uploaded successfully:', result.filePath);
      
      // Update form with new image
      setFormData(prev => ({
        ...prev,
        imageUrl: result.filePath,
        images: [result.filePath]
      }));
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Image upload error:', errorMessage);
      setError(`Image upload failed: ${errorMessage}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log('Already submitting, ignoring...');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    console.log('🚀 ADMIN FIXED: Starting form submission...');
    console.log('📋 Form data:', formData);
    console.log('👤 User:', user);
    console.log('🔑 Token present:', !!token);
    
    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      setIsSubmitting(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Product description is required');
      setIsSubmitting(false);
      return;
    }
    if (formData.price <= 0) {
      setError('Product price must be greater than 0');
      setIsSubmitting(false);
      return;
    }
    if (formData.stock < 0) {
      setError('Stock cannot be negative');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📤 Making API call...');
      
      const dataToSubmit = {
        ...formData,
        position: products.length // Set position at the end
      };
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dataToSubmit)
      });

      console.log('📥 Response received:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create product');
      }

      const newProduct = await response.json();
      console.log('✅ Product created:', newProduct);
      
      setProducts([...products, newProduct]);                  setSuccess(`Product "${newProduct.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'saree',
        imageUrl: '/uploads/sample1.jpg',
        images: ['/uploads/sample1.jpg'],
        stock: 0,
        discount: 0,
        position: 0
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Form submission error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard (Fixed)</h1>
      
      <div className="mb-4 p-4 bg-blue-100 rounded">
        <h3 className="font-bold">Status:</h3>
        <p>✅ User: {user.name} ({user.email})</p>
        <p>✅ Admin: {user.isAdmin.toString()}</p>
        <p>✅ Token: Present</p>
        <p>🔄 Submitting: {isSubmitting.toString()}</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ Error: {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✅ {success}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                <option value="saree">Saree</option>
                <option value="mens">Men&apos;s Clothing</option>
                <option value="kids">Kids Wear</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                step="0.01"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                max="100"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              {formData.imageUrl && (
                <p className="text-sm text-gray-500 mt-1">Current: {formData.imageUrl}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md font-medium ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Products ({products.length})</h2>
        
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid gap-4">
            {products.slice(-5).map((product) => (
              <div key={product._id} className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.description.substring(0, 100)}...</p>
                <p className="text-lg font-bold">₹{product.price}</p>
                <p className="text-sm text-gray-500">Stock: {product.stock} | Category: {product.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h3 className="font-bold">Fixed Issues:</h3>
        <ul className="list-disc list-inside">
          <li>Removed complex dropzone that might conflict with form submission</li>
          <li>Added form submission state to prevent double submissions</li>
          <li>Simplified image upload to single file</li>
          <li>Added more detailed console logging</li>
          <li>Fixed form reset logic</li>
        </ul>
      </div>
    </div>
  );
}

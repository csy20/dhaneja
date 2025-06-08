"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminTest() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: 'Test Product Debug',
    description: 'Testing frontend form submission',
    price: 999,
    category: 'saree',
    imageUrl: '/uploads/sample1.jpg',
    images: ['/uploads/sample1.jpg'],
    stock: 5,
    discount: 0,
    position: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('1. Form Data:', formData);
    console.log('2. User:', user);
    console.log('3. Token:', token);
    console.log('4. User is admin:', user?.isAdmin);
    
    if (!user || !user.isAdmin) {
      setError('User is not admin');
      console.log('ERROR: User is not admin');
      return;
    }
    
    if (!token) {
      setError('No authentication token');
      console.log('ERROR: No authentication token');
      return;
    }
    
    try {
      console.log('5. Making API call...');
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      console.log('6. Response status:', response.status);
      console.log('7. Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('8. Error data:', errorData);
        throw new Error(errorData.error || 'Failed to create product');
      }
      
      const newProduct = await response.json();
      console.log('9. Success! New product:', newProduct);
      setSuccess(`Product created successfully: ${newProduct.name}`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('10. Catch error:', errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Auth State:</h3>
        <p>User: {user ? user.name : 'Not logged in'}</p>
        <p>Email: {user ? user.email : 'N/A'}</p>
        <p>Is Admin: {user ? user.isAdmin.toString() : 'N/A'}</p>
        <p>Token: {token ? 'Present' : 'Missing'}</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Test Product Creation</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test Create Product
        </button>
      </form>
      
      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h3 className="font-bold">Instructions:</h3>
        <p>1. Login with admin@test.com / password</p>
        <p>2. Come to this page (/admin-test)</p>
        <p>3. Click &quot;Test Create Product&quot; and check browser console</p>
      </div>
    </div>
  );
}

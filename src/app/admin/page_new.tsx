"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';

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

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  total: number;
  isPaid: boolean;
  isDelivered: boolean;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  
  // Form state for adding/editing products
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'saree',
    imageUrl: '',
    images: [] as string[],
    stock: 0,
    discount: 0,
    position: 0
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Define resetForm before it's used in handleSubmit
  const resetForm = useCallback(() => {
    setIsEditing(false);
    setCurrentProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'saree',
      imageUrl: '',
      images: [],
      stock: 0,
      discount: 0,
      position: products.length // Set new products at the end of the list
    });
  }, [products.length]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // If no imageUrl but has images, use the first image as the main imageUrl
      const dataToSubmit = {...formData};
      if (!dataToSubmit.imageUrl && dataToSubmit.images.length > 0) {
        dataToSubmit.imageUrl = dataToSubmit.images[0];
      }
      
      if (isEditing && currentProduct) {
        // Update existing product
        const response = await fetch(`/api/products/${currentProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dataToSubmit)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update product');
        }
        
        const updatedProduct = await response.json();
        setProducts(products.map(p => 
          p._id === currentProduct._id ? updatedProduct : p
        ));
      } else {
        // Create new product
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dataToSubmit)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create product');
        }
        
        const newProduct = await response.json();
        setProducts([...products, newProduct]);
      }
      
      // Reset form
      resetForm();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    }
  }, [formData, isEditing, currentProduct, token, products, resetForm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      // Sort products by position if available
      const sortedProducts = data.sort((a: Product, b: Product) => 
        (a.position || 0) - (b.position || 0)
      );
      setProducts(sortedProducts);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  useEffect(() => {
    // Redirect if not admin
    if (user && !user.isAdmin) {
      setRedirecting(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return; // Early return to prevent API calls
    } else if (!user) {
      setRedirecting(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return; // Early return to prevent API calls
    }
    
    // Fetch products and orders only if user is admin
    if (token && user && user.isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [user, token, router, fetchOrders]);
  
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete product');
        }
        
        // Update products list after deletion
        setProducts(products.filter(product => product._id !== id));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
      }
    }
  };
  
  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      images: product.images || [],
      stock: product.stock,
      discount: product.discount || 0,
      position: product.position || 0
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' || name === 'discount' || name === 'position'
        ? parseFloat(value) 
        : value
    });
  };
  
  // File upload handling with react-dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Upload each file
    setUploadingImage(true);
    try {
      const uploadedImages: string[] = [];
      
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        const result = await response.json();
        uploadedImages.push(result.filePath);
      }
      
      // Update form with new images
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
        // If no main image URL, use the first uploaded image
        imageUrl: prev.imageUrl || uploadedImages[0] || ''
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  }, [token]);
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    }
  });
  
  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      
      // If the main image was removed, update the main image URL
      let newImageUrl = prev.imageUrl;
      if (prev.imageUrl === prev.images[index]) {
        newImageUrl = newImages.length > 0 ? newImages[0] : '';
      }
      
      return {
        ...prev,
        images: newImages,
        imageUrl: newImageUrl
      };
    });
  };
  
  const setMainImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }));
  };
  
  // Handle product reordering (simplified version without drag and drop)
  const moveProductUp = async (index: number) => {
    if (index === 0) return;
    
    const items = Array.from(products);
    const [item] = items.splice(index, 1);
    items.splice(index - 1, 0, item);
    
    // Update positions
    const updatedItems = items.map((item, idx) => ({
      ...item,
      position: idx
    }));
    
    setProducts(updatedItems);
    
    // Save new positions to the database
    try {
      const movedItem = updatedItems[index - 1];
      await fetch(`/api/products/${movedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ position: index - 1 })
      });
    } catch {
      setError("Failed to update product position");
    }
  };

  const moveProductDown = async (index: number) => {
    if (index === products.length - 1) return;
    
    const items = Array.from(products);
    const [item] = items.splice(index, 1);
    items.splice(index + 1, 0, item);
    
    // Update positions
    const updatedItems = items.map((item, idx) => ({
      ...item,
      position: idx
    }));
    
    setProducts(updatedItems);
    
    // Save new positions to the database
    try {
      const movedItem = updatedItems[index + 1];
      await fetch(`/api/products/${movedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ position: index + 1 })
      });
    } catch {
      setError("Failed to update product position");
    }
  };
  
  if (redirecting) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg text-center max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="mb-4">You don&apos;t have permission to access the admin dashboard.</p>
          <p className="mb-4">You will be redirected to the {!user ? 'login page' : 'home page'} momentarily.</p>
          <div className="animate-pulse mt-4">
            <div className="h-1 w-full bg-red-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user || !user.isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'products'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'orders'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Orders
        </button>
      </div>
      
      {activeTab === 'products' && (
        <div>
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="saree">Saree</option>
                    <option value="mens">Men&apos;s Clothing</option>
                    <option value="kids">Kids Wear</option>
                    <option value="accessories">Accessories</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                    required
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
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Product Images</label>
                  <div 
                    {...getRootProps()} 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                  >
                    <input {...getInputProps()} />
                    {uploadingImage ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-500">Drag &apos;n&apos; drop some images here, or click to select files</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Supported formats: JPEG, PNG, WebP
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Preview of uploaded images */}
                {formData.images.length > 0 && (
                  <div className="md:col-span-2 mt-2">
                    <label className="block text-gray-700 mb-2">Product Images</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group border rounded p-1">
                          <div className="aspect-square overflow-hidden relative">
                            <Image 
                              src={img} 
                              alt={`Product image ${index + 1}`}
                              className="object-cover"
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                            />
                            
                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-1">
                              <button 
                                type="button"
                                onClick={() => setMainImage(img)}
                                className={`text-xs px-2 py-1 rounded ${formData.imageUrl === img ? 'bg-green-500' : 'bg-blue-500'} text-white`}
                              >
                                {formData.imageUrl === img ? 'Main Image' : 'Set as Main'}
                              </button>
                              <button 
                                type="button"
                                onClick={() => removeImage(index)}
                                className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-gray-700 mb-2">Main Image URL (Optional)</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Will use first uploaded image if left empty"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {isEditing ? 'Update Product' : 'Add Product'}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Products List</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="py-3 px-4 text-left">Order</th>
                    <th className="py-3 px-4 text-left">Image</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-left">Price</th>
                    <th className="py-3 px-4 text-left">Stock</th>
                    <th className="py-3 px-4 text-left">Discount</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        No products found. Add your first product above.
                      </td>
                    </tr>
                  ) : (
                    products.map((product, index) => (
                      <tr key={product._id} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => moveProductUp(index)}
                              disabled={index === 0}
                              className={`text-xs px-2 py-1 rounded ${
                                index === 0 
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveProductDown(index)}
                              disabled={index === products.length - 1}
                              className={`text-xs px-2 py-1 rounded ${
                                index === products.length - 1
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              ↓
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="w-12 h-12 relative rounded overflow-hidden">
                            <Image
                              src={product.imageUrl || '/placeholder.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4 capitalize">{product.category}</td>
                        <td className="py-3 px-4">₹{product.price.toFixed(2)}</td>
                        <td className="py-3 px-4">{product.stock}</td>
                        <td className="py-3 px-4">{product.discount ? `${product.discount}%` : '—'}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Orders List</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="py-3 px-4 text-left">Order ID</th>
                    <th className="py-3 px-4 text-left">Customer</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Total</th>
                    <th className="py-3 px-4 text-left">Payment</th>
                    <th className="py-3 px-4 text-left">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">{order._id.substring(order._id.length - 8)}</td>
                        <td className="py-3 px-4">{order.user.name}</td>
                        <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">₹{order.total.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.isPaid 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.isDelivered 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.isDelivered ? 'Delivered' : 'Processing'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

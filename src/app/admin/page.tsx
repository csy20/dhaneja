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
    setError(null); // Clear any previous errors
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Product description is required');
      return;
    }
    if (formData.price <= 0) {
      setError('Product price must be greater than 0');
      return;
    }
    if (formData.stock < 0) {
      setError('Stock cannot be negative');
      return;
    }
    
    try {
      // If no imageUrl but has images, use the first image as the main imageUrl
      const dataToSubmit = {...formData};
      if (!dataToSubmit.imageUrl && dataToSubmit.images.length > 0) {
        dataToSubmit.imageUrl = dataToSubmit.images[0];
      }
      
      console.log('Submitting product data:', dataToSubmit);
      console.log('Is editing:', isEditing);
      console.log('Token available:', !!token);
      
      if (isEditing && currentProduct) {
        // Update existing product
        console.log('Updating product:', currentProduct._id);
        const response = await fetch(`/api/products/${currentProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dataToSubmit)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Update failed:', errorData);
          throw new Error(errorData.error || 'Failed to update product');
        }
        
        const updatedProduct = await response.json();
        console.log('Product updated successfully:', updatedProduct);
        setProducts(products.map(p => 
          p._id === currentProduct._id ? updatedProduct : p
        ));
      } else {
        // Create new product
        console.log('Creating new product...');
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dataToSubmit)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Create failed:', errorData);
          throw new Error(errorData.error || 'Failed to create product');
        }
        
        const newProduct = await response.json();
        console.log('Product created successfully:', newProduct);
        setProducts([...products, newProduct]);
      }
      
      // Reset form
      resetForm();
      console.log('Form reset successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Form submission error:', errorMessage);
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
    if (acceptedFiles.length === 0) {
      setError('No valid image files selected. Please select JPEG, PNG, or WebP files.');
      return;
    }

    // Upload each file
    setUploadingImage(true);
    setError(null); // Clear any previous errors
    
    try {
      const uploadedImages: string[] = [];
      
      for (const file of acceptedFiles) {
        console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
        
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
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }
        
        const result = await response.json();
        console.log(`Upload successful: ${result.filePath}`);
        uploadedImages.push(result.filePath);
      }
      
      // Update form with new images
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
        // If no main image URL, use the first uploaded image
        imageUrl: prev.imageUrl || uploadedImages[0] || ''
      }));

      console.log(`Successfully uploaded ${uploadedImages.length} images`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Upload error:', errorMessage);
      setError(`Upload failed: ${errorMessage}`);
    } finally {
      setUploadingImage(false);
    }
  }, [token]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true, // Explicitly enable multiple file selection
    maxSize: 10 * 1024 * 1024, // 10MB max file size
    onDropRejected: (fileRejections) => {
      const rejectedReasons = fileRejections.map(rejection => 
        `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
      );
      setError(`File(s) rejected: ${rejectedReasons.join('; ')}`);
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
                  <label className="block text-gray-700 mb-2 font-medium">Product Images (Multiple Selection)</label>
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    } ${uploadingImage ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <input {...getInputProps()} />
                    {uploadingImage ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Uploading images...</p>
                      </div>
                    ) : (
                      <div>
                        <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        {isDragActive ? (
                          <p className="text-lg text-indigo-600 font-medium">Drop the images here...</p>
                        ) : (
                          <>
                            <p className="text-lg text-gray-700 font-medium mb-2">
                              Click to select multiple images or drag & drop
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                              You can select multiple images at once (Ctrl/Cmd + Click)
                            </p>
                            <p className="text-xs text-gray-400">
                              Supported formats: JPEG, PNG, WebP, GIF • Max size: 10MB per file
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Traditional file input as fallback */}
                  <div className="mt-4">
                    <label className="block text-sm text-gray-600 mb-2">
                      Or use traditional file selector:
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          await onDrop(files);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
                
                {/* Preview of uploaded images */}
                {formData.images.length > 0 && (
                  <div className="md:col-span-2 mt-4">
                    <label className="block text-gray-700 mb-3 font-medium">
                      Uploaded Images ({formData.images.length})
                      <span className="text-sm text-gray-500 font-normal ml-2">
                        Click on an image to set it as the main product image
                      </span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group border-2 rounded-lg p-1 hover:border-indigo-300 transition-colors">
                          <div className="aspect-square overflow-hidden relative rounded">
                            <Image 
                              src={img} 
                              alt={`Product image ${index + 1}`}
                              className="object-cover cursor-pointer"
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                              onClick={() => setMainImage(img)}
                            />
                            
                            {/* Main image indicator */}
                            {formData.imageUrl === img && (
                              <div className="absolute top-1 left-1">
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                  Main
                                </span>
                              </div>
                            )}
                            
                            {/* Image number */}
                            <div className="absolute top-1 right-1">
                              <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                                {index + 1}
                              </span>
                            </div>
                            
                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMainImage(img);
                                }}
                                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                                  formData.imageUrl === img 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                              >
                                {formData.imageUrl === img ? '✓ Main Image' : 'Set as Main'}
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Bulk actions */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, images: [], imageUrl: '' }))}
                        className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Clear All Images
                      </button>
                      <span className="text-sm text-gray-500 py-1">
                        Total: {formData.images.length} image{formData.images.length !== 1 ? 's' : ''}
                      </span>
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
                      <td colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No products yet</h3>
                            <p className="text-gray-500">Add your first product using the form above. You can upload multiple images for each product!</p>
                          </div>
                        </div>
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
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 relative rounded overflow-hidden border">
                              <Image
                                src={product.imageUrl || '/placeholder.jpg'}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            {product.images && product.images.length > 1 && (
                              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                +{product.images.length - 1} more
                              </div>
                            )}
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
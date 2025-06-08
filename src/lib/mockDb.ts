import fs from 'fs';
import path from 'path';
import { IUser } from '@/models/User';
import { IProduct } from '@/models/Product';
import bcrypt from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'data');
const usersFile = path.join(dataDir, 'users.json');
const productsFile = path.join(dataDir, 'products.json');

// Make sure data directory exists
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Create empty users file if it doesn't exist
if (!fs.existsSync(usersFile)) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  } catch (error) {
    console.error('Error creating users file:', error);
  }
}

// Create empty products file if it doesn't exist
if (!fs.existsSync(productsFile)) {
  try {
    fs.writeFileSync(productsFile, JSON.stringify([], null, 2));
  } catch (error) {
    console.error('Error creating products file:', error);
  }
}

// User mock database operations
export const userDb = {
  findOne: async (query: { email?: string; _id?: string }): Promise<(IUser & { _id: string }) | null> => {
    try {
      const users: (IUser & { _id: string })[] = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      if (query.email) {
        return users.find(user => user.email === query.email) || null;
      }
      if (query._id) {
        return users.find(user => user._id === query._id) || null;
      }
      return null;
    } catch (error) {
      console.error('Error reading users:', error);
      return null;
    }
  },
  
  create: async (userData: Partial<IUser>): Promise<IUser & { _id: string }> => {
    try {
      const users: (IUser & { _id: string })[] = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      
      // Create new user with generated ID
      const newUser: IUser & { _id: string } = {
        _id: `user_${Date.now()}`,
        name: userData.name || '',
        email: userData.email || '',
        password: userData.password || '',
        isAdmin: userData.isAdmin || false,
        createdAt: new Date()
      };
      
      users.push(newUser);
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  save: async (user: Partial<IUser> & { _id: string }) => {
    try {
      const users: IUser[] = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      const index = users.findIndex(u => u._id === user._id);
      
      if (index !== -1) {
        users[index] = { ...users[index], ...user };
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        return users[index];
      }
      
      // If user doesn't exist, create it
      return await userDb.create(user);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }
};

// Product mock database operations
export const productDb = {
  find: async (query: Record<string, unknown> = {}): Promise<(IProduct & { _id: string })[]> => {
    try {
      const products: (IProduct & { _id: string })[] = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      
      if (Object.keys(query).length === 0) {
        return products;
      }
      
      // Simple query filtering
      return products.filter(product => {
        return Object.keys(query).every(key => {
          return product[key as keyof IProduct] === query[key];
        });
      });
    } catch (error) {
      console.error('Error reading products:', error);
      return [];
    }
  },

  findById: async (id: string): Promise<(IProduct & { _id: string }) | null> => {
    try {
      const products: (IProduct & { _id: string })[] = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      return products.find(product => product._id === id) || null;
    } catch (error) {
      console.error('Error reading products:', error);
      return null;
    }
  },
  
  create: async (productData: Partial<IProduct>): Promise<IProduct & { _id: string }> => {
    try {
      const products: (IProduct & { _id: string })[] = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      
      // Create new product with generated ID
      const newProduct: IProduct & { _id: string } = {
        _id: `product_${Date.now()}`,
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || 0,
        category: productData.category || 'other',
        imageUrl: productData.imageUrl || '',
        images: productData.images || [],
        stock: productData.stock || 0,
        discount: productData.discount || 0,
        position: productData.position || products.length,
        createdAt: new Date()
      };
      
      products.push(newProduct);
      fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
      
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  findByIdAndUpdate: async (id: string, updateData: Partial<IProduct>): Promise<(IProduct & { _id: string }) | null> => {
    try {
      const products: (IProduct & { _id: string })[] = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      const index = products.findIndex(p => p._id === id);
      
      if (index !== -1) {
        products[index] = { 
          ...products[index], 
          ...updateData
        };
        fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
        return products[index];
      }
      
      return null;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  findByIdAndDelete: async (id: string): Promise<(IProduct & { _id: string }) | null> => {
    try {
      const products: (IProduct & { _id: string })[] = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      const index = products.findIndex(p => p._id === id);
      
      if (index !== -1) {
        const deletedProduct = products[index];
        products.splice(index, 1);
        fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
        return deletedProduct;
      }
      
      return null;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

// Helper to initialize mock admin user
export async function initializeAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'jageshwarsahu910@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'default_secure_password';
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  
  const existingAdmin = await userDb.findOne({ email: adminEmail });
  
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    await userDb.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
    });
    
    console.log('Admin user created successfully');
  }
}

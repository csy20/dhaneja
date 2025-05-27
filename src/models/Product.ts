import { Schema, model, models } from 'mongoose';

export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string; // Maintain for backward compatibility
  images: string[]; // Array of image URLs
  stock: number;
  discount?: number;
  createdAt: Date;
  position?: number; // For drag and drop ordering
}

const productSchema = new Schema<IProduct>({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['saree', 'mens', 'kids', 'accessories', 'other']
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  images: { 
    type: [String],
    default: [] 
  },
  position: {
    type: Number,
    default: 0
  },
  stock: { 
    type: Number, 
    required: true,
    default: 0
  },
  discount: { 
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default models.Product || model<IProduct>('Product', productSchema);

import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id?: string;  // MongoDB ID field, optional in the interface as it's generated
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default models.User || model<IUser>('User', userSchema);

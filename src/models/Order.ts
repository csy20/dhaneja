import mongoose, { Schema, model, models } from 'mongoose';
import { IProduct } from './Product';
import { IUser } from './User';

interface IOrderItem {
  product: mongoose.Types.ObjectId | IProduct;
  quantity: number;
  price: number;
}

export interface IOrder {
  user: mongoose.Types.ObjectId | IUser;
  items: IOrderItem[];
  total: number;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  items: [{ 
    product: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product',
      required: true
    },
    quantity: { 
      type: Number, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    }
  }],
  total: { 
    type: Number, 
    required: true 
  },
  shippingAddress: {
    address: { 
      type: String, 
      required: true 
    },
    city: { 
      type: String, 
      required: true 
    },
    postalCode: { 
      type: String, 
      required: true 
    },
    country: { 
      type: String, 
      required: true 
    }
  },
  paymentMethod: { 
    type: String, 
    required: true,
    default: 'Cash on Delivery'
  },
  isPaid: { 
    type: Boolean, 
    required: true,
    default: false
  },
  paidAt: { 
    type: Date
  },
  isDelivered: { 
    type: Boolean, 
    required: true,
    default: false
  },
  deliveredAt: { 
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default models.Order || model<IOrder>('Order', orderSchema);

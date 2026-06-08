import mongoose, { Schema, model, models } from 'mongoose';

export interface IProduct {
  productName: string;
  description: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  category: string;
  images: string[];
  benefits: string[];
  isSubscriptionEnabled: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: { type: String, default: 'Pooja Kit' },
    images: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    isSubscriptionEnabled: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Product || model<IProduct>('Product', ProductSchema);

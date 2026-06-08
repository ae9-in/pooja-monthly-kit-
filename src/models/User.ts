import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  fullName: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: 'customer' | 'admin' | 'superadmin';
  status: 'active' | 'suspended';
  referralCode: string;
  referredBy?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    referralCode: { type: String, unique: true },
    referredBy: { type: String },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.User || model<IUser>('User', UserSchema);

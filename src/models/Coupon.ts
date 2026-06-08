import mongoose, { Schema, model, models } from 'mongoose';

export interface ICoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrder: number;
  expiryDate: Date;
  usageLimit: number;
  active: boolean;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    minimumOrder: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1000 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Coupon || model<ICoupon>('Coupon', CouponSchema);

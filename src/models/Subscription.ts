import mongoose, { Schema, model, models } from 'mongoose';

export interface ISubscription {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  planType: 'Monthly' | '3 Month' | '6 Month';
  amount: number;
  startDate: Date;
  nextRenewalDate: Date;
  renewalCount: number;
  autoRenew: boolean;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    planType: { type: String, enum: ['Monthly', '3 Month', '6 Month'], required: true },
    amount: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    nextRenewalDate: { type: Date, required: true },
    renewalCount: { type: Number, default: 0 },
    autoRenew: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'paused', 'cancelled', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

export default models.Subscription || model<ISubscription>('Subscription', SubscriptionSchema);

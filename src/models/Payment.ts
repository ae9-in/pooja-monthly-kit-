import mongoose, { Schema, model, models } from 'mongoose';

export interface IPayment {
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'success' | 'failed' | 'refunded';
  transactionDate: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    amount: { type: Number, required: true },
    paymentMethod: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Payment || model<IPayment>('Payment', PaymentSchema);

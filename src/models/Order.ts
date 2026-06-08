import mongoose, { Schema, model, models } from 'mongoose';

export interface IOrder {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  addressId: mongoose.Types.ObjectId;
  orderType: 'one-time' | 'subscription';
  subscriptionId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  subtotal: number;
  discount: number;
  finalAmount: number;
  shippingCost: number;
  orderStatus: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    addressId: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
    orderType: { type: String, enum: ['one-time', 'subscription'], required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryStatus: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>('Order', OrderSchema);

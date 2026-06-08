import mongoose, { Schema, model, models } from 'mongoose';

export interface IKitItem {
  productId: mongoose.Types.ObjectId;
  itemName: string;
  quantity: number;
  unit: string;
  image?: string;
  benefits?: string[];
}

const KitItemSchema = new Schema<IKitItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  image: { type: String },
  benefits: { type: [String], default: [] },
});

export default models.KitItem || model<IKitItem>('KitItem', KitItemSchema);

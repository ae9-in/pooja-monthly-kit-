import mongoose, { Schema, model, models } from 'mongoose';

export interface IReferral {
  referrerUserId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  rewardAmount: number;
  rewardStatus: 'pending' | 'credited';
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rewardAmount: { type: Number, required: true },
    rewardStatus: { type: String, enum: ['pending', 'credited'], default: 'pending' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Referral || model<IReferral>('Referral', ReferralSchema);

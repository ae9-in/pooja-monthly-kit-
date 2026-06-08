import mongoose, { Schema, model, models } from 'mongoose';

export interface ITestimonial {
  customerName: string;
  city: string;
  rating: number;
  review: string;
  image?: string;
  approved: boolean;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true },
    city: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    image: { type: String },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Testimonial || model<ITestimonial>('Testimonial', TestimonialSchema);

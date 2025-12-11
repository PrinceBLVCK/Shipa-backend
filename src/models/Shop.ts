import mongoose, { Document, Schema } from 'mongoose';

export interface IShop extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  image?: string;
  coverImage?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone: string;
  email?: string;
  openingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  categories?: string[];
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  deactivatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    openingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    categories: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
ShopSchema.index({ location: '2dsphere' });
// Index for cleanup queries
ShopSchema.index({ isActive: 1, deactivatedAt: 1 });

export default mongoose.model<IShop>('Shop', ShopSchema);

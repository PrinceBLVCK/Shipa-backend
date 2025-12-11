import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'shop_owner' | 'admin';
  profileImage?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  isVerified: boolean;
  isActive: boolean;
  deactivatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'shop_owner', 'admin'],
      default: 'customer',
    },
    profileImage: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
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

// Index for cleanup queries
UserSchema.index({ isActive: 1, deactivatedAt: 1 });

export default mongoose.model<IUser>('User', UserSchema);

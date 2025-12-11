import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  shop: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  isAvailable: boolean;
  preparationTime?: number; // in minutes
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  customizations?: {
    name: string;
    options: {
      name: string;
      price: number;
    }[];
  }[];
  deactivatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema: Schema = new Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      min: 0,
    },
    ingredients: [String],
    allergens: [String],
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    customizations: [
      {
        name: String,
        options: [
          {
            name: String,
            price: Number,
          },
        ],
      },
    ],
    deactivatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for shop to optimize queries
MenuItemSchema.index({ shop: 1 });
MenuItemSchema.index({ category: 1 });
// Index for cleanup queries
MenuItemSchema.index({ isAvailable: 1, deactivatedAt: 1 });

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

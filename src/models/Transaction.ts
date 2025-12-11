import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  wallet: mongoose.Types.ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: 'pending' | 'success' | 'failed';
  paymentMethod?: 'paystack' | 'wallet' | 'cash';
  metadata?: Record<string, any>;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'ZAR',
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['paystack', 'wallet', 'cash'],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for queries
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ wallet: 1, createdAt: -1 });
TransactionSchema.index({ reference: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);

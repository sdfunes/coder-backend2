import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
productSchema.plugin(mongoosePaginate);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    code: { type: String, unique: true },
    price: { type: Number, required: true },
    status: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    category: String,
    thumbnails: [String],
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);

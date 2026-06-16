import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 1000 },
    category: { type: String, required: true, enum: ["plant", "seeds", "fertilizer", "accessory"] },
    priceCents: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: null },
    stock: { type: Number, default: 100, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);

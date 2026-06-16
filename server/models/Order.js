import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceCents: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    totalCents: { type: Number, required: true, min: 0 },
    status: { type: String, default: "paid", enum: ["pending", "paid", "shipped", "delivered", "cancelled"] },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

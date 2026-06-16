import mongoose from "mongoose";

const plantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, maxlength: 80 },
    species: { type: String, default: null, maxlength: 80 },
    imageUrl: { type: String, default: null, maxlength: 500 },
    notes: { type: String, default: null, maxlength: 500 },
    healthStatus: { type: String, default: "healthy", enum: ["healthy", "stressed", "diseased"] },
    waterIntervalDays: { type: Number, default: 3, min: 1, max: 60 },
    lastWateredAt: { type: Date, default: null },
    fertilizeIntervalDays: { type: Number, default: 30, min: 1, max: 365 },
    lastFertilizedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Plant", plantSchema);

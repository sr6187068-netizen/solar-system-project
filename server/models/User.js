import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 255 },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

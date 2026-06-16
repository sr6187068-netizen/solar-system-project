import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";
import User from "./models/User.js";

const seedProducts = [
  { name: "Monstera Deliciosa", description: "Lush split-leaf tropical statement plant.", category: "plant", priceCents: 349900, imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800", stock: 25 },
  { name: "Snake Plant", description: "Low-light, air-purifying classic.", category: "plant", priceCents: 199900, imageUrl: "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=800", stock: 40 },
  { name: "Fiddle Leaf Fig", description: "Bold architectural indoor tree.", category: "plant", priceCents: 549900, imageUrl: "https://images.unsplash.com/photo-1597055181300-e3633a917a8b?w=800", stock: 12 },
  { name: "Organic Compost 5kg", description: "Premium nutrient-rich plant food.", category: "fertilizer", priceCents: 129900, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800", stock: 80 },
  { name: "Heirloom Seed Pack", description: "Curated mix of 12 herb varieties.", category: "seeds", priceCents: 89900, imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800", stock: 150 },
  { name: "Terracotta Planter", description: "Hand-thrown breathable pot, 6in.", category: "accessory", priceCents: 159900, imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800", stock: 60 },
];

await connectDB(process.env.MONGO_URI);

// Seed admin user
const adminEmail = "admin@plantery.local";
const existing = await User.findOne({ email: adminEmail });
if (!existing) {
  const passwordHash = await bcrypt.hash("admin123", 10);
  await User.create({
    fullName: "PLANTERY Admin",
    email: adminEmail,
    passwordHash,
    role: "admin",
  });
  console.log(`✅ Admin user created → ${adminEmail} / admin123`);
} else {
  // ensure role is admin
  if (existing.role !== "admin") {
    existing.role = "admin";
    await existing.save();
  }
  console.log(`ℹ️  Admin user already exists → ${adminEmail}`);
}

await Product.deleteMany({});
await Product.insertMany(seedProducts);
console.log(`✅ Seeded ${seedProducts.length} products`);
process.exit(0);

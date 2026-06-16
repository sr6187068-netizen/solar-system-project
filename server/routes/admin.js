import express from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { authRequired, adminRequired } from "../middleware/auth.js";

const router = express.Router();
router.use(authRequired, adminRequired);

// ---------- PRODUCTS ----------
router.get("/products", async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

router.post("/products", async (req, res) => {
  try {
    const { name, description, category, priceCents, imageUrl, stock } = req.body || {};
    if (!name || !category || priceCents == null) {
      return res.status(400).json({ error: "name, category, priceCents required" });
    }
    if (!["plant", "seeds", "fertilizer", "accessory"].includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    const p = await Product.create({
      name, description: description || "", category,
      priceCents: Number(priceCents),
      imageUrl: imageUrl || null,
      stock: stock != null ? Number(stock) : 100,
    });
    res.status(201).json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const allowed = ["name", "description", "category", "priceCents", "imageUrl", "stock"];
    const updates = {};
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
    const p = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/products/:id", async (req, res) => {
  const r = await Product.findByIdAndDelete(req.params.id);
  if (!r) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

// ---------- ORDERS ----------
router.get("/orders", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const orders = await Order.find()
    .populate("user", "fullName email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!["pending", "paid", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const o = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("user", "fullName email");
    if (!o) return res.status(404).json({ error: "Not found" });
    res.json(o);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ---------- USERS ----------
router.get("/users", async (req, res) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json(users);
});

router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!["user", "admin"].includes(role)) return res.status(400).json({ error: "Invalid role" });
    if (req.params.id === req.user._id.toString() && role !== "admin") {
      return res.status(400).json({ error: "Cannot demote yourself" });
    }
    const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-passwordHash");
    if (!u) return res.status(404).json({ error: "Not found" });
    res.json(u);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ---------- STATS ----------
router.get("/stats", async (_req, res) => {
  const [productCount, orderCount, userCount, revenueAgg] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments(),
    Order.aggregate([
      { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
      { $group: { _id: null, total: { $sum: "$totalCents" } } },
    ]),
  ]);
  res.json({
    productCount,
    orderCount,
    userCount,
    revenueCents: revenueAgg[0]?.total || 0,
  });
});

export default router;

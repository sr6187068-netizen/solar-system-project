import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();
router.use(authRequired);

router.get("/", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.post("/", async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "No items" });
    const products = await Product.find({ _id: { $in: items.map(i => i.productId) } });
    const enriched = items.map(i => {
      const p = products.find(pp => pp._id.toString() === i.productId);
      if (!p) throw new Error("Invalid product");
      const qty = Math.max(1, Number(i.quantity) || 1);
      return { product: p._id, name: p.name, quantity: qty, unitPriceCents: p.priceCents };
    });
    const totalCents = enriched.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
    const order = await Order.create({ user: req.user._id, items: enriched, totalCents, status: "paid" });
    res.status(201).json(order);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;

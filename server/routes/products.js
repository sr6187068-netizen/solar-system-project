import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

export default router;

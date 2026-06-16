import express from "express";
import Plant from "../models/Plant.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();
router.use(authRequired);

router.get("/", async (req, res) => {
  const plants = await Plant.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(plants);
});

router.post("/", async (req, res) => {
  try {
    const { name, species, imageUrl, notes, waterIntervalDays, fertilizeIntervalDays } = req.body || {};
    if (!name) return res.status(400).json({ error: "Name required" });
    const plant = await Plant.create({
      user: req.user._id, name, species, imageUrl, notes,
      waterIntervalDays: waterIntervalDays ?? 3,
      fertilizeIntervalDays: fertilizeIntervalDays ?? 30,
    });
    res.status(201).json(plant);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.patch("/:id", async (req, res) => {
  const plant = await Plant.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
  if (!plant) return res.status(404).json({ error: "Not found" });
  res.json(plant);
});

router.post("/:id/water", async (req, res) => {
  const plant = await Plant.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { lastWateredAt: new Date() }, { new: true });
  if (!plant) return res.status(404).json({ error: "Not found" });
  res.json(plant);
});

router.post("/:id/fertilize", async (req, res) => {
  const plant = await Plant.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { lastFertilizedAt: new Date() }, { new: true });
  if (!plant) return res.status(404).json({ error: "Not found" });
  res.json(plant);
});

router.delete("/:id", async (req, res) => {
  const r = await Plant.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;

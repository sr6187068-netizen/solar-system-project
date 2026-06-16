import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();
const sign = (id) => jwt.sign({ sub: id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u._id, fullName: u.fullName, email: u.email, role: u.role });

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body || {};
    if (!fullName || !email || !password) return res.status(400).json({ error: "Missing fields" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 chars" });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    // First registered user becomes admin automatically
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";
    const user = await User.create({ fullName, email: email.toLowerCase(), passwordHash, role });
    res.status(201).json({ token: sign(user._id), user: publicUser(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ token: sign(user._id), user: publicUser(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/me", authRequired, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;

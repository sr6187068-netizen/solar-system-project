import { useEffect, useState } from "react";
import {
  Package, ShoppingBag, Users, BarChart3, Plus, Pencil, Trash2,
  Upload, X, ShieldCheck, IndianRupee, Boxes
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { formatPrice } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = ["plant", "seeds", "fertilizer", "accessory"];
const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function Admin() {
  const [tab, setTab] = useState("products");

  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent">
          <ShieldCheck className="h-4 w-4" /> Admin Panel
        </div>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">Control Center</h1>
        <p className="mt-2 text-muted-foreground">
          Manage products, orders, and users for the PLANTERY storefront.
        </p>

        <StatsRow />

        <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {tab === "products" && <ProductsAdmin />}
          {tab === "orders" && <OrdersAdmin />}
          {tab === "users" && <UsersAdmin />}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

/* -------------------- STATS -------------------- */
function StatsRow() {
  const [s, setS] = useState(null);
  useEffect(() => {
    api.get("/admin/stats").then(r => setS(r.data)).catch(() => {});
  }, []);

  const cards = [
    { label: "Products", value: s?.productCount ?? "—", icon: Package },
    { label: "Orders", value: s?.orderCount ?? "—", icon: ShoppingBag },
    { label: "Users", value: s?.userCount ?? "—", icon: Users },
    { label: "Revenue", value: s ? formatPrice(s.revenueCents) : "—", icon: IndianRupee },
  ];

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(c => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
              <span className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-accent">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 font-display text-2xl font-bold">{c.value}</div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------- PRODUCTS -------------------- */
function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState(null); // null | "new" | product
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/products");
      setProducts(data);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to load");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing("new"); setOpen(true); }
  function openEdit(p) { setEditing(p); setOpen(true); }

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.delete(`/admin/products/${p._id}`);
      toast.success("Deleted");
      load();
    } catch (e) { toast.error(e?.response?.data?.error || "Failed"); }
  }

  const filtered = cat === "all" ? products : products.filter(p => p.category === cat);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                cat === c
                  ? "border-accent bg-lime-gradient text-lime-foreground"
                  : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}>{c}</button>
          ))}
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-md bg-lime-gradient px-3 py-1.5 text-sm font-medium text-lime-foreground shadow-glow hover:opacity-90">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      {loading ? (
        <div className="mt-12 text-center text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <Boxes className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No products in this category yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} className="border-t border-border hover:bg-secondary/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="line-clamp-2 max-w-md text-xs text-muted-foreground">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium">{formatPrice(p.priceCents)}</td>
                  <td className="p-3 text-right">{p.stock}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(p)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <ProductModal
          product={editing === "new" ? null : editing}
          onClose={() => { setOpen(false); setEditing(null); }}
          onSaved={() => { setOpen(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSaved }) {
  const isNew = !product;
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "plant",
    priceRupees: product ? (product.priceCents / 100).toString() : "",
    stock: product?.stock?.toString() || "100",
    imageUrl: product?.imageUrl || "",
  });
  const [saving, setSaving] = useState(false);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be < 2MB");
    const reader = new FileReader();
    reader.onload = () => update("imageUrl", reader.result);
    reader.readAsDataURL(file);
  }

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name required");
    const priceCents = Math.round(parseFloat(form.priceRupees || "0") * 100);
    if (!priceCents || priceCents < 0) return toast.error("Valid price required");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      priceCents,
      stock: Math.max(0, parseInt(form.stock || "0", 10)),
      imageUrl: form.imageUrl || null,
    };
    setSaving(true);
    try {
      if (isNew) await api.post("/admin/products", payload);
      else await api.patch(`/admin/products/${product._id}`, payload);
      toast.success(isNew ? "Product created" : "Product updated");
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Save failed");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-card"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-xl font-semibold">
            {isNew ? "Add Product" : "Edit Product"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={e => update("name", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={e => update("description", e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              value={form.category}
              onChange={e => update("category", e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>Price (₹)</Label>
            <Input type="number" min="0" step="0.01" value={form.priceRupees} onChange={e => update("priceRupees", e.target.value)} />
          </div>
          <div>
            <Label>Stock</Label>
            <Input type="number" min="0" value={form.stock} onChange={e => update("stock", e.target.value)} />
          </div>
          <div>
            <Label>Image URL (or upload below)</Label>
            <Input value={form.imageUrl?.startsWith("data:") ? "" : form.imageUrl} placeholder="https://…" onChange={e => update("imageUrl", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Upload image (max 2MB)</Label>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-input/40 p-3 text-sm text-muted-foreground hover:border-accent/40">
              <Upload className="h-4 w-4" /> Choose file…
              <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            </label>
            {form.imageUrl && (
              <div className="mt-3 flex items-center gap-3">
                <img src={form.imageUrl} alt="preview" className="h-20 w-20 rounded-lg border border-border object-cover" />
                <button type="button" onClick={() => update("imageUrl", "")} className="text-xs text-muted-foreground hover:text-destructive">
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-secondary/30 p-4">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-lime-gradient px-4 py-2 text-sm font-medium text-lime-foreground shadow-glow hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Label({ children }) {
  return <div className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">{children}</div>;
}
function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

/* -------------------- ORDERS -------------------- */
function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/orders?t=${Date.now()}`);
      setOrders(data);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to load");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function changeStatus(id, status) {
    try {
      setUpdatingId(id);
      const { data } = await api.patch(`/admin/orders/${id}`, { status });
      setOrders(prev => prev.map(order => order._id === id ? { ...order, ...data } : order));
      toast.success("Status updated");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed");
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <div className="mt-12 text-center text-muted-foreground">Loading…</div>;
  if (!orders.length) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map(o => (
        <div key={o._id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-display text-base font-semibold">
                #{o._id.slice(-6).toUpperCase()}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {o.user?.fullName || "—"} · {o.user?.email || ""} · {new Date(o.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-display text-lg font-bold">{formatPrice(o.totalCents)}</div>
              <select
                value={o.status}
                disabled={updatingId === o._id}
                onChange={e => changeStatus(o._id, e.target.value)}
                className="rounded-md border border-border bg-input px-2 py-1.5 text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {o.items.map((it, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm">
                <span>{it.name} <span className="text-muted-foreground">× {it.quantity}</span></span>
                <span className="text-muted-foreground">{formatPrice(it.unitPriceCents * it.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------- USERS -------------------- */
function UsersAdmin() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to load");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function toggleRole(u) {
    const next = u.role === "admin" ? "user" : "admin";
    try {
      await api.patch(`/admin/users/${u._id}/role`, { role: next });
      toast.success(`Role updated → ${next}`);
      load();
    } catch (e) { toast.error(e?.response?.data?.error || "Failed"); }
  }

  if (loading) return <div className="mt-12 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <table className="w-full text-sm">
        <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Joined</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const isMe = me?.id === u._id;
            return (
              <tr key={u._id} className="border-t border-border hover:bg-secondary/30">
                <td className="p-3 font-medium">{u.fullName} {isMe && <span className="ml-1 text-xs text-accent">(you)</span>}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                    u.role === "admin" ? "border-accent text-accent" : "border-border text-muted-foreground"
                  }`}>{u.role}</span>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={isMe && u.role === "admin"}
                    className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-40"
                  >
                    {u.role === "admin" ? "Make user" : "Make admin"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

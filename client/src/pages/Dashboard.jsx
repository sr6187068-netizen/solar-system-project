import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Droplets, Sprout, Trash2, Leaf, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

const daysUntilNext = (last, interval) => {
  if (!last) return 0;
  return Math.ceil((new Date(last).getTime() + interval * 86400000 - Date.now()) / 86400000);
};

export default function Dashboard() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = () =>
    api.get("/plants")
      .then(r => setPlants(r.data))
      .catch(() => toast.error("Could not load your plants."))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const water = (id) => api.post(`/plants/${id}/water`).then(() => { toast.success("Watered ✓"); load(); }).catch(() => toast.error("Could not update plant."));
  const fert = (id) => api.post(`/plants/${id}/fertilize`).then(() => { toast.success("Fertilized ✓"); load(); }).catch(() => toast.error("Could not update plant."));
  const del = (id) => api.delete(`/plants/${id}`).then(() => { toast.success("Plant removed"); load(); }).catch(() => toast.error("Could not remove plant."));

  const needsAttention = plants.filter(p => daysUntilNext(p.lastWateredAt, p.waterIntervalDays) <= 0).length;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-accent">Plant Health Care</div>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">My Plants</h1>
            <p className="mt-2 text-muted-foreground">
              {plants.length} plant{plants.length === 1 ? "" : "s"} tracked
              {needsAttention > 0 && <> · <span className="text-accent">{needsAttention} need attention</span></>}
            </p>
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-lime-gradient px-4 py-2 font-medium text-lime-foreground shadow-glow hover:opacity-90">
            <Plus className="h-4 w-4" /> Add plant
          </button>
        </div>

        {loading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading plants…</div>
        ) : plants.length === 0 ? (
          <EmptyState onAdd={() => setOpen(true)} />
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plants.map(p => <PlantCard key={p._id} plant={p} onWater={() => water(p._id)} onFert={() => fert(p._id)} onDelete={() => del(p._id)} />)}
          </div>
        )}
      </main>
      <SiteFooter />
      {open && <AddDialog onClose={() => setOpen(false)} onSaved={load} />}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-lime-gradient text-lime-foreground shadow-glow">
        <Leaf className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold">No plants yet</h3>
      <p className="mt-2 text-muted-foreground">Add your first plant to start tracking its care schedule.</p>
      <button onClick={onAdd} className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-lime-gradient px-4 py-2 font-medium text-lime-foreground hover:opacity-90">
        <Plus className="h-4 w-4" /> Add a plant
      </button>
      <div className="mt-6 text-sm text-muted-foreground">
        Or <Link to="/products" className="text-accent hover:underline">browse the shop</Link>.
      </div>
    </div>
  );
}

function PlantCard({ plant, onWater, onFert, onDelete }) {
  const waterDays = daysUntilNext(plant.lastWateredAt, plant.waterIntervalDays);
  const fertDays = daysUntilNext(plant.lastFertilizedAt, plant.fertilizeIntervalDays);
  const due = waterDays <= 0;
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-accent/40 hover:shadow-glow">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {plant.imageUrl ? (
          <img src={plant.imageUrl} alt={plant.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground"><Leaf className="h-10 w-10" /></div>
        )}
        <div className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur ${due ? "bg-destructive/80 text-destructive-foreground" : "bg-background/70 text-accent"}`}>
          {due ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
          {due ? "Water due" : "Healthy"}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold">{plant.name}</h3>
            {plant.species && <p className="text-xs text-muted-foreground">{plant.species}</p>}
          </div>
          <button onClick={onDelete} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-secondary/60 p-2">
            <div className="text-muted-foreground">Water</div>
            <div className="mt-0.5 font-medium">{plant.lastWateredAt ? (waterDays <= 0 ? "Overdue" : `in ${waterDays}d`) : "Never"}</div>
          </div>
          <div className="rounded-lg bg-secondary/60 p-2">
            <div className="text-muted-foreground">Fertilize</div>
            <div className="mt-0.5 font-medium">{plant.lastFertilizedAt ? (fertDays <= 0 ? "Overdue" : `in ${fertDays}d`) : "Never"}</div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onWater} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-lime-gradient px-3 py-1.5 text-sm font-medium text-lime-foreground hover:opacity-90">
            <Droplets className="h-3.5 w-3.5" /> Water
          </button>
          <button onClick={onFert} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary">
            <Sprout className="h-3.5 w-3.5" /> Feed
          </button>
        </div>
      </div>
    </div>
  );
}

function AddDialog({ onClose, onSaved }) {
  const [f, setF] = useState({ name: "", species: "", imageUrl: "", notes: "", waterIntervalDays: 3, fertilizeIntervalDays: 30 });
  const [busy, setBusy] = useState(false);
  const inputCls = "w-full rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  async function submit(e) {
    e.preventDefault();
    if (!f.name.trim()) return toast.error("Name required");
    setBusy(true);
    try { await api.post("/plants", f); toast.success("Plant added"); onSaved(); onClose(); }
    catch (err) { toast.error(err?.response?.data?.error || "Could not save plant."); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-xl font-semibold">Add a new plant</h3>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <input className={inputCls} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Living room monstera" maxLength={80} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Species</label>
            <input className={inputCls} value={f.species} onChange={e => setF({ ...f, species: e.target.value })} placeholder="Monstera deliciosa" maxLength={80} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <input className={inputCls} value={f.imageUrl} onChange={e => setF({ ...f, imageUrl: e.target.value })} placeholder="https://…" maxLength={500} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Water every (days)</label>
              <input type="number" min={1} max={60} className={inputCls} value={f.waterIntervalDays} onChange={e => setF({ ...f, waterIntervalDays: +e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Feed every (days)</label>
              <input type="number" min={1} max={365} className={inputCls} value={f.fertilizeIntervalDays} onChange={e => setF({ ...f, fertilizeIntervalDays: +e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea className={inputCls} rows={3} maxLength={500} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} placeholder="Sunlight, soil, anything…" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-md border border-border px-4 py-2 hover:bg-secondary">Cancel</button>
            <button disabled={busy} className="flex-1 rounded-md bg-lime-gradient px-4 py-2 font-medium text-lime-foreground hover:opacity-90 disabled:opacity-60">
              {busy ? "Saving…" : "Save plant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

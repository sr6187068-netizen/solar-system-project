import { useEffect, useState } from "react";
import { ShoppingCart, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { useCart, formatPrice } from "../context/CartContext.jsx";

const CATS = ["all", "plant", "seeds", "fertilizer", "accessory"];
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function Products() {
  const { add } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    api.get("/products")
      .then(r => setProducts(r.data))
      .catch(() => toast.error("Could not load products."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    (cat === "all" || p.category === cat) &&
    (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  async function handleAddToCart(product) {
    if (addingId) return;
    setAddingId(product._id);
    try {
      await wait(650);
      add({ id: product._id, name: product.name, price_cents: product.priceCents, image_url: product.imageUrl });
      toast.success(`${product.name} added to cart`);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="text-xs uppercase tracking-wider text-accent">Plant-Based Products</div>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">The PLANTERY shop</h1>
        <p className="mt-2 text-muted-foreground">Plants, seeds, fertilizers, and accessories curated for green living.</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-md border border-border bg-input py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${cat === c ? "border-accent bg-lime-gradient text-lime-foreground" : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading products...</div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(p => (
              <div key={p._id} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-accent/40 hover:shadow-glow">
                <div className="aspect-square overflow-hidden bg-secondary">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-wider text-accent">{p.category}</div>
                  <h3 className="mt-1 font-display text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="font-display text-xl font-bold">{formatPrice(p.priceCents)}</div>
                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={addingId === p._id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-lime-gradient px-3 py-1.5 text-sm font-medium text-lime-foreground hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
                    >
                      <ShoppingCart className={`h-3.5 w-3.5 ${addingId === p._id ? "animate-pulse" : ""}`} />
                      {addingId === p._id ? "Adding..." : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

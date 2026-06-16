import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { formatPrice } from "../context/CartContext.jsx";

const statusTone = {
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  paid: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  shipped: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  delivered: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  cancelled: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadOrders({ silent = false } = {}) {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const { data } = await api.get(`/orders?t=${Date.now()}`);
      setOrders(data);
    } catch {
      if (!silent) toast.error("Could not load your orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();

    const intervalId = window.setInterval(() => {
      loadOrders({ silent: true });
    }, 5000);

    const handleFocus = () => loadOrders({ silent: true });
    const handleVisibility = () => {
      if (document.visibilityState === "visible") loadOrders({ silent: true });
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">My Orders</h1>
            <p className="mt-2 text-muted-foreground">Your purchase history updates automatically when status changes.</p>
          </div>
          <button
            type="button"
            onClick={() => loadOrders({ silent: true })}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-2xl font-semibold">No orders yet</h2>
            <Link to="/products" className="mt-4 inline-block text-accent hover:underline">Browse the shop -&gt;</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map(o => (
              <div key={o._id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Order</div>
                    <div className="font-mono text-sm">{o._id.slice(-8)}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</div>
                  <div className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${statusTone[o.status] || "border-border bg-secondary text-foreground"}`}>
                    {o.status}
                  </div>
                  <div className="font-display text-lg font-bold">{formatPrice(o.totalCents)}</div>
                </div>
                <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-muted-foreground">
                      <span>{it.name} x {it.quantity}</span>
                      <span>{formatPrice(it.unitPriceCents * it.quantity)}</span>
                    </div>
                  ))}
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

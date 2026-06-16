import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Droplets, ShoppingBag, Bell, Activity, Sparkles } from "lucide-react";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import heroImg from "../assets/hero-leaves.jpg";

const features = [
  { icon: Activity, title: "Plant Health Care", desc: "Log every plant, track its health status, and never lose a leaf to neglect again." },
  { icon: Bell, title: "Smart Reminders", desc: "Watering and fertilizing schedules computed automatically from each plant's needs." },
  { icon: ShoppingBag, title: "Plant-Based Products", desc: "Browse a curated catalog of plants, seeds, fertilizers, and accessories." },
  { icon: Droplets, title: "One-Tap Care Logging", desc: "Mark watered or fertilized in a single tap — your timeline updates instantly." },
];

const stats = [
  { v: "6", l: "Core Modules" },
  { v: "100%", l: "Eco-Focused" },
  { v: "1", l: "Unified Platform" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-32 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-accent" />
              Smart plantation, reimagined
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance md:text-7xl">
              Grow smarter.<br />
              <span style={{ background: "linear-gradient(to right, var(--accent), var(--leaf))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Live greener.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
              PLANTERY unifies plant health monitoring, care reminders, and a plant-based product marketplace into one elegant platform — built for home gardeners, offices, and nurseries.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-md bg-lime-gradient px-5 py-2.5 font-medium text-lime-foreground shadow-glow hover:opacity-90">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/products" className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-foreground hover:bg-secondary">Browse shop</Link>
            </div>
            <div className="mt-12 flex gap-10">
              {stats.map(s => (
                <div key={s.l}>
                  <div className="font-display text-3xl font-bold text-accent">{s.v}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-lime-gradient opacity-20 blur-3xl" />
            <img src={heroImg} alt="Lush green plants" className="relative w-full rounded-2xl border border-border shadow-card" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-accent">The platform</div>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">Everything your green life needs.</h2>
          <p className="mt-4 text-muted-foreground">Six modular systems working together — from authentication to plant care to checkout.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(f => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-accent/40 hover:shadow-glow">
              <div className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl bg-secondary text-accent transition-colors group-hover:bg-lime-gradient group-hover:text-lime-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-card md:p-16">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <Leaf className="mb-4 h-8 w-8 text-accent" />
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Bring nature into your routine.</h2>
              <p className="mt-3 text-muted-foreground">Sign up free and start tracking your first plant in under 30 seconds.</p>
            </div>
            <div className="flex md:justify-end">
              <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-md bg-lime-gradient px-5 py-2.5 font-medium text-lime-foreground shadow-glow hover:opacity-90">
                Create your account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

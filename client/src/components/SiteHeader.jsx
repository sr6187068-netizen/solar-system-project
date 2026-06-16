import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, ShoppingCart, LogOut, User as UserIcon, Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function SiteHeader() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const links = [
    { to: "/", label: "Home", end: true },
    { to: "/products", label: "Shop" },
    { to: "/dashboard", label: "My Plants" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const linkCls = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm transition-colors ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-lime-gradient text-lime-foreground shadow-glow">
            <Leaf className="h-4 w-4" />
          </span>
          PLANTERY
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
              {l.label === "Admin" ? (
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent" />{l.label}</span>
              ) : l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-lime-gradient px-1 text-[10px] font-bold text-lime-foreground">{count}</span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hidden rounded-md p-2 text-muted-foreground hover:bg-secondary sm:inline-flex">
                <UserIcon className="h-5 w-5" />
              </Link>
              <button onClick={() => { signOut(); nav("/"); }} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="rounded-md bg-lime-gradient px-3 py-1.5 text-sm font-medium text-lime-foreground hover:opacity-90">Sign in</Link>
          )}
          <button onClick={() => setOpen(o => !o)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">{l.label}</NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

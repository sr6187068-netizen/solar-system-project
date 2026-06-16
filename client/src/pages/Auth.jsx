import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Auth() {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav("/dashboard"); }, [user, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Invalid email");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (mode === "signup" && !name.trim()) return toast.error("Full name required");
    setLoading(true);
    try {
      if (mode === "signup") { await register(name.trim(), email, password); toast.success("Account created!"); }
      else { await login(email, password); toast.success("Welcome back."); }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Authentication failed");
    } finally { setLoading(false); }
  }

  const inputCls = "w-full rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-hero lg:block">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-lime-gradient text-lime-foreground"><Leaf className="h-4 w-4" /></span>
            PLANTERY
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">Your green life,<br />one calm dashboard.</h2>
            <p className="mt-3 max-w-md text-muted-foreground">Track every plant. Get smart reminders. Shop curated essentials.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-lime-gradient text-lime-foreground"><Leaf className="h-4 w-4" /></span>
              PLANTERY
            </Link>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to manage your plants and orders." : "Start tracking plants in under a minute."}
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Full name</label>
                <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Jane Gardener" maxLength={100} required />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@plantery.app" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input type="password" minLength={6} className={inputCls} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-md bg-lime-gradient px-4 py-2 font-medium text-lime-foreground shadow-glow hover:opacity-90 disabled:opacity-60">
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "No account?" : "Already have one?"}{" "}
            <button onClick={() => setMode(m => m === "signin" ? "signup" : "signin")} className="font-medium text-accent hover:underline">
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

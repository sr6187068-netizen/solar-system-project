import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";
import Orders from "./pages/Orders.jsx";
import Admin from "./pages/Admin.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  return user ? children : <Navigate to="/auth" replace />;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/products" element={<Products />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      <Route path="/orders" element={<Private><Orders /></Private>} />
      <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
      <Route path="*" element={
        <div className="grid min-h-screen place-items-center text-center">
          <div>
            <h1 className="font-display text-7xl font-bold">404</h1>
            <p className="mt-2 text-muted-foreground">Page not found</p>
          </div>
        </div>
      } />
    </Routes>
  );
}

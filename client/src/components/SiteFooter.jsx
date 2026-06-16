import { Leaf } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-lime-gradient text-lime-foreground"><Leaf className="h-4 w-4" /></span>
            PLANTERY
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Smart plantation, plant health care, and plant-based product management — all in one platform.</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 font-semibold">Platform</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Plant Health Care</li>
            <li>Care Reminders</li>
            <li>Product Catalog</li>
            <li>Order Management</li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 font-semibold">About</h4>
          <p className="text-muted-foreground">A modular smart-plantation platform built for home gardeners, offices, and nurseries.</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PLANTERY. Cultivated with care.
      </div>
    </footer>
  );
}

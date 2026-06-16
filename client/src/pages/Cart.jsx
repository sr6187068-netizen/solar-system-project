import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, CircleDot, Smartphone, Landmark } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client.js";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart, formatPrice } from "../context/CartContext.jsx";

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const paymentSteps = [
  "Securing your payment session",
  "Verifying bank response",
  "Confirming order inventory",
];
const paymentOptions = [
  { id: "upi", label: "UPI", meta: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Card", meta: "Visa, Mastercard, RuPay" },
  { id: "cod", label: "Cash on delivery", meta: "Pay when your order arrives" },
];

export default function Cart() {
  const { items, remove, setQty, total, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentStep, setPaymentStep] = useState(-1);
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  function updateDetails(field, value) {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  }

  function getPaymentError() {
    if (paymentMethod === "upi") {
      return /^[\w.-]+@[\w.-]+$/.test(paymentDetails.upiId.trim()) ? "" : "Enter a valid UPI ID";
    }
    if (paymentMethod === "card") {
      const cardNumber = paymentDetails.cardNumber.replace(/\s+/g, "");
      if (paymentDetails.cardName.trim().length < 3) return "Enter the card holder name";
      if (!/^\d{16}$/.test(cardNumber)) return "Enter a valid 16-digit card number";
      if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiry)) return "Use expiry in MM/YY format";
      if (!/^\d{3}$/.test(paymentDetails.cvv)) return "Enter a valid 3-digit CVV";
    }
    return "";
  }

  async function checkout() {
    if (!user) return nav("/auth");
    if (!items.length) return;
    const paymentError = getPaymentError();
    if (paymentError) return toast.error(paymentError);
    setBusy(true);
    try {
      for (let step = 0; step < paymentSteps.length; step += 1) {
        setPaymentStep(step);
        await wait(step === paymentSteps.length - 1 ? 900 : 700);
      }
      await api.post("/orders", { items: items.map(i => ({ productId: i.id, quantity: i.qty })) });
      toast.success("Order placed!");
      clear();
      nav("/orders");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Checkout failed");
    } finally {
      setBusy(false);
      setPaymentStep(-1);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Cart</h1>
        <p className="mt-2 text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</p>

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Browse the shop to get started.</p>
            <Link to="/products" className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-lime-gradient px-4 py-2 font-medium text-lime-foreground hover:opacity-90">
              Shop now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {items.map(i => (
                <div key={i.id} className="flex gap-4 rounded-xl border border-border bg-card p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {i.image_url && <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium">{i.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(i.price_cents)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={i.qty}
                        onChange={e => setQty(i.id, +e.target.value)}
                        className="w-16 rounded-md border border-border bg-input px-2 py-1 text-center text-sm"
                      />
                      <button onClick={() => remove(i.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold">Summary</h2>
              <div className="mt-4 flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="mt-2 flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="text-accent">Free</span></div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Payment method</h3>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    Secure checkout
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {paymentOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={busy}
                      onClick={() => setPaymentMethod(option.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed ${paymentMethod === option.id ? "border-accent bg-secondary" : "border-border hover:border-accent/40"}`}
                    >
                      <CircleDot className={`mt-0.5 h-4 w-4 shrink-0 ${paymentMethod === option.id ? "text-accent" : "text-muted-foreground"}`} />
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.meta}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border border-border bg-background/40 p-3">
                  {paymentMethod === "upi" && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Smartphone className="h-4 w-4 text-accent" />
                        UPI verification
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">We will request approval from your UPI app after order review.</p>
                      <input
                        type="text"
                        value={paymentDetails.upiId}
                        onChange={e => updateDetails("upiId", e.target.value.toLowerCase())}
                        placeholder="name@bank"
                        className="mt-3 w-full rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CreditCard className="h-4 w-4 text-accent" />
                        Card details
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">256-bit encrypted. Card tokenization happens before order capture.</p>
                      <div className="mt-3 space-y-3">
                        <input
                          type="text"
                          value={paymentDetails.cardName}
                          onChange={e => updateDetails("cardName", e.target.value)}
                          placeholder="Card holder name"
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={19}
                          value={paymentDetails.cardNumber}
                          onChange={e => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                            updateDetails("cardNumber", digits.replace(/(\d{4})(?=\d)/g, "$1 "));
                          }}
                          placeholder="1234 5678 9012 3456"
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={5}
                            value={paymentDetails.expiry}
                            onChange={e => {
                              const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                              updateDetails("expiry", digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                            }}
                            placeholder="MM/YY"
                            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={3}
                            value={paymentDetails.cvv}
                            onChange={e => updateDetails("cvv", e.target.value.replace(/\D/g, "").slice(0, 3))}
                            placeholder="CVV"
                            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Landmark className="h-4 w-4 text-accent" />
                        Pay on delivery
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">A delivery partner will collect the exact amount at your doorstep. Cash and supported UPI apps accepted.</p>
                      <div className="mt-3 rounded-lg border border-accent/20 bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                        Orders above {formatPrice(499900)} may require a confirmation call before dispatch.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="my-4 border-t border-border" />
              <div className="flex justify-between font-display text-xl font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>

              {busy && (
                <div className="mt-4 rounded-xl border border-accent/20 bg-secondary/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CreditCard className="h-4 w-4 text-accent" />
                    Processing payment
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-lime-gradient transition-all duration-500"
                      style={{ width: `${((paymentStep + 1) / paymentSteps.length) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                    {paymentSteps.map((step, idx) => (
                      <div key={step} className={idx <= paymentStep ? "text-foreground" : ""}>
                        {idx < paymentStep ? "Done" : idx === paymentStep ? "In progress" : "Pending"} - {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={checkout} disabled={busy} className="mt-6 w-full rounded-md bg-lime-gradient px-4 py-2 font-medium text-lime-foreground shadow-glow hover:opacity-90 disabled:opacity-60">
                {busy ? "Confirming payment..." : user ? "Pay & place order" : "Sign in to checkout"}
              </button>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

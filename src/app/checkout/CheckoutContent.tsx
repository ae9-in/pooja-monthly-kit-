"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

export default function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get("plan") || "one-time";

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [isFormFilled, setIsFormFilled] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderId, setOrderId] = useState("");
  const [showLoaderModal, setShowLoaderModal] = useState(false);

  const plan = planParam.toLowerCase();
  const isSubscription = plan === "monthly" || plan === "quarterly" || plan === "halfyearly";

  let planLabel = "One-time Purchase";
  let itemPrice = 1285;
  let originalPrice = 1500;

  if (plan === "monthly") {
    planLabel = "Monthly Subscription";
    itemPrice = 450;
    originalPrice = 665;
  } else if (plan === "quarterly") {
    planLabel = "3-Month Subscription";
    itemPrice = 1299;
    originalPrice = 1995;
  } else if (plan === "halfyearly") {
    planLabel = "6-Month Subscription";
    itemPrice = 2499;
    originalPrice = 3990;
  }

  const discount = originalPrice - itemPrice;
  const backendPlanType = isSubscription
    ? (plan === "monthly" ? "Monthly" : plan === "quarterly" ? "Quarterly" : "HalfYearly")
    : "one-time";

  useEffect(() => {
    const filled =
      fullName.trim() !== "" &&
      mobile.trim() !== "" &&
      email.trim() !== "" &&
      address.trim() !== "" &&
      pincode.trim() !== "" &&
      city.trim() !== "";
    setIsFormFilled(filled);
    // One-way progression: advance to step 2 once filled, but never regress.
    // Regressing to step 1 mid-fill is jarring UX when the user clears a field.
    if (filled && step === 1) setStep(2);
  }, [fullName, mobile, email, address, pincode, city, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormFilled) {
      setErrorMsg("Please fill in all customer details.");
      return;
    }
    setLoading(true);
    setShowLoaderModal(true);
    setErrorMsg("");
    const startTime = Date.now();
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName, mobile, email,
          addressLine1: address, city, pincode,
          paymentMethod,
          planType: backendPlanType,
          amount: itemPrice,
          subtotal: originalPrice,
          discount: discount,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to process checkout");
      
      // Confirm immediately — no artificial delay
      setStep(3);
      setSuccess(true);
      setOrderId(data.orderNumber);
      setShowLoaderModal(false);
    } catch (err: any) {
      setShowLoaderModal(false);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {showLoaderModal && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-opacity duration-300">
          <div className="flex flex-col items-center max-w-sm text-center p-8 bg-surface-container-lowest rounded-2xl border border-primary-container shadow-2xl space-y-6 mx-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Golden circular spinner */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-secondary/10 animate-pulse" />
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse">spa</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary font-h3 animate-pulse">SacredSamskara</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Preparing your divine Pooja Kit with absolute devotion and packing it securely...
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="top-0 sticky z-50 bg-surface/80 backdrop-blur-md shadow-[0px_10px_40px_rgba(212,160,23,0.1)]">
        <div className="flex justify-between items-center w-full px-4 md:px-gutter max-w-container-max mx-auto h-20">
          <Link href="/" className="text-h3 font-h3 text-primary font-bold text-xl">
            SacredSamskara
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant text-xs">Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="flex-grow py-12 px-4 md:px-gutter">
        <div className="max-w-container-max mx-auto w-full">
          {success ? (
            /* ── Order Confirmation ── */
            <div className="bg-surface-container-lowest rounded-xl p-10 max-w-xl mx-auto luxury-shadow border border-outline-variant/30 text-center space-y-6 my-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
              </div>
              <h2 className="text-h2 font-h2 text-primary text-2xl font-bold">Divine Order Confirmed!</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Thank you for choosing SacredSamskara. Your order has been registered, and
                we are preparing your curated Pooja Kit with devotion.
              </p>
              <div className="px-4 py-3 bg-surface-container rounded-lg font-mono text-sm border border-outline-variant/50 inline-block">
                Order Ref: <span className="font-bold text-primary">{orderId}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href="/" className="bg-primary text-on-primary px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm">
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* ── Left: Form ── */}
              <div className="lg:col-span-8 space-y-8">
                {/* Progress Indicator */}
                <div className="flex items-center justify-between relative mb-12">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-outline-variant z-0" />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-primary z-0 transition-all duration-500"
                    style={{ width: step === 1 ? "20%" : step === 2 ? "60%" : "100%" }}
                  />
                  {[
                    { n: 1, label: "Details" },
                    { n: 2, label: "Payment" },
                    { n: 3, label: "Confirm" },
                  ].map(({ n, label }) => (
                    <div key={n} className="relative z-10 flex flex-col items-center gap-2 bg-background px-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-colors ${
                          step > n
                            ? "bg-primary text-on-primary border-primary"
                            : step === n
                            ? "bg-primary text-on-primary border-primary"
                            : "bg-surface-container-lowest text-outline-variant border-outline-variant"
                        }`}
                      >
                        {step > n ? <span className="material-symbols-outlined text-sm">check</span> : n}
                      </div>
                      <span
                        className={`font-label-sm text-label-sm uppercase text-xs font-semibold ${
                          step >= n ? "text-primary" : "text-outline-variant"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Customer Details */}
                <section className="bg-surface-container-lowest rounded-xl p-8 luxury-shadow border border-outline-variant/30">
                  <h2 className="font-h2 text-primary mb-6 text-2xl font-bold">Customer Details</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Full Name</label>
                        <input className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors outline-none" placeholder="Enter your full name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Mobile Number</label>
                        <input className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors outline-none" placeholder="+91 98765 43210" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Email Address</label>
                      <input className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors outline-none" placeholder="your@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Delivery Address</label>
                      <input className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors outline-none" placeholder="Street address, apartment, suite, etc." type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Pincode</label>
                        <input className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors outline-none" placeholder="6-digit pincode" type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">City</label>
                        <input className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors outline-none" placeholder="City" type="text" value={city} onChange={(e) => setCity(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Payment Methods */}
                <section className={`bg-surface-container-lowest rounded-xl p-8 luxury-shadow border border-outline-variant/30 transition-all duration-300 ${isFormFilled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-h2 text-primary text-2xl font-bold">Payment Method</h2>
                    <div className="flex gap-2 items-center text-on-surface-variant text-xs font-semibold">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      SSL Secure
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: "upi",        icon: "qr_code_scanner", label: "UPI (GPay, PhonePe, Paytm)" },
                      { id: "card",       icon: "credit_card",      label: "Credit / Debit Card" },
                      { id: "netbanking", icon: "account_balance",  label: "Net Banking" },
                    ].map(({ id, icon, label }) => (
                      <label
                        key={id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === id
                            ? "border-primary bg-surface-container-low"
                            : "border-outline-variant hover:border-primary hover:bg-surface-container-low"
                        }`}
                      >
                        <input className="text-primary h-5 w-5" name="payment_method" type="radio" checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} />
                        <div className="ml-4 flex-grow">
                          <span className={`block font-semibold ${paymentMethod === id ? "text-primary" : "text-on-surface"}`}>{label}</span>
                        </div>
                        <span className="material-symbols-outlined text-primary">{icon}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              {/* ── Right: Order Summary ── */}
              <div className="lg:col-span-4">
                <div className="sticky top-28">
                  <div className="bg-surface-container-highest rounded-xl p-6 luxury-shadow border border-outline-variant/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: "150px" }}>spa</span>
                    </div>

                    <h3 className="font-h3 text-primary mb-6 z-10 relative border-b border-outline-variant pb-4 font-bold text-lg">
                      Order Summary
                    </h3>

                    <div className="flex items-start gap-4 mb-6 relative z-10">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-primary/20 shrink-0 bg-surface-container-lowest relative">
                        <Image alt="Monthly Pooja Kit" className="object-cover" src="/pooja_kit.png" width={80} height={80} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface text-sm">Monthly Pooja Kit</h4>
                        <p className="text-xs text-on-surface-variant mt-1">{planLabel}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-primary font-bold">₹{itemPrice}</span>
                          <span className="text-on-surface-variant line-through text-xs">₹{originalPrice}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-on-surface-variant mb-6 border-y border-outline-variant py-4 relative z-10">
                      <div className="flex justify-between"><span>Subtotal</span><span>₹{originalPrice}</span></div>
                      <div className="flex justify-between text-secondary font-semibold"><span>Discount</span><span>-₹{discount}</span></div>
                      <div className="flex justify-between"><span>Shipping</span><span className="text-primary font-semibold">Free</span></div>
                    </div>

                    <div className="flex justify-between items-end mb-6 relative z-10">
                      <span className="font-semibold text-on-surface">Total</span>
                      <div className="text-right">
                        <span className="text-primary font-bold text-2xl block">₹{itemPrice}</span>
                        <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded mt-1 inline-block">You save ₹{discount}</span>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="mb-4 text-error bg-error-container/20 border border-error/20 p-3 rounded-lg text-sm">
                        {errorMsg}
                      </div>
                    )}

                    <div className="space-y-3 relative z-10">
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !isFormFilled}
                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg text-sm"
                      >
                        {loading ? (
                          <>
                            <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                            Processing…
                          </>
                        ) : (
                          isSubscription ? `Subscribe & Save ₹${discount}` : "Buy Now"
                        )}
                      </button>
                      <button
                        onClick={() => router.push(isSubscription ? "/checkout" : "/checkout?plan=Monthly")}
                        className="w-full bg-transparent border border-primary text-primary hover:bg-primary/5 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        {isSubscription ? "Switch to One-time" : "Subscribe Monthly Instead"}
                        <span className="material-symbols-outlined text-sm">swap_horiz</span>
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-1 text-on-surface-variant relative z-10 text-xs">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Secure 256-bit SSL Encryption
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-surface-container-lowest border-t border-outline-variant mt-auto">
        <div className="flex flex-col items-center py-8 px-gutter max-w-container-max mx-auto text-center">
          <p className="text-sm text-on-surface-variant">
            © 2024 SacredSamskara Spiritual Services. Handcrafted with Devotion.
          </p>
        </div>
      </footer>
    </div>
  );
}

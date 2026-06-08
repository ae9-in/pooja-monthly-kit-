import Link from "next/link";
import Image from "next/image";

// ISR: revalidate this page at most every 60 seconds so repeated visits
// are served from the edge cache instead of cold-rendering each time.
export const revalidate = 60;

// Pure Server Component — zero client JS, maximum speed
export default function HomePage() {
  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased relative scroll-smooth overflow-x-hidden">

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <nav className="bg-surface/80 backdrop-blur-md docked full-width top-0 sticky z-50 shadow-[0px_10px_40px_rgba(212,160,23,0.1)]">
        <div className="flex justify-between items-center w-full px-4 md:px-gutter max-w-container-max mx-auto h-20">
          <div className="text-xl md:text-h3 font-h3 text-primary font-bold tracking-tight">SacredSamskara</div>
          <div className="hidden md:flex gap-8 items-center">
            <a className="text-primary font-bold border-b-2 border-primary pb-1" href="#our-kits">Our Kits</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors duration-300" href="#why-us">Why Us</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors duration-300" href="#how-it-works">How It Works</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors duration-300" href="#faq">FAQ</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors duration-300" href="#testimonials">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/checkout" className="hidden md:block font-label-sm text-label-sm text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors">
              Order Now
            </Link>
            <Link href="/checkout?plan=Monthly" className="font-label-sm text-xs md:text-label-sm bg-primary text-on-primary px-4 md:px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-md whitespace-nowrap">
              Subscribe
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[600px] md:min-h-[800px] lg:min-h-[921px] flex items-center justify-center overflow-hidden bg-surface-container-low py-12 md:py-24 lg:py-0">
          <div className="absolute inset-0 z-0">
            {/*
              Hero image — served from local /public so no external DNS lookup.
              `priority` ensures it is preloaded as a high-priority resource,
              eliminating LCP delay. `fetchPriority="high"` reinforces this for
              browsers that support the Fetch Priority API.
            */}
            <Image
              alt="A serene brass diya surrounded by marigold flowers in warm morning sunlight"
              className="object-cover opacity-40"
              src="/hero_bg.jpg"
              fill
              priority
              sizes="100vw"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>
          <div className="relative z-10 w-full max-w-container-max mx-auto px-4 md:px-gutter grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-h1-mobile md:text-h1 font-h1-mobile md:font-h1 text-on-background">
                Monthly Pooja Kit Delivered to Your Doorstep
              </h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-lg mx-auto lg:mx-0">
                All your essential pooja items, sourced with devotion, packed conveniently, and delivered every month to keep your daily practice uninterrupted.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <Link href="/checkout?plan=Monthly" className="bg-primary text-on-primary font-label-sm text-label-sm px-6 md:px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-[0px_10px_40px_rgba(212,160,23,0.1)]">
                  Subscribe Monthly
                </Link>
                <Link href="/checkout" className="border border-primary text-primary font-label-sm text-label-sm px-6 md:px-8 py-3 rounded-lg hover:bg-primary/5 transition-colors">
                  Order Now
                </Link>
              </div>
            </div>
            {/* Pricing Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0px_10px_40px_rgba(212,160,23,0.1)] border border-primary-container max-w-sm w-full relative">
                <div className="absolute -top-3 -right-3 bg-tertiary text-on-tertiary font-label-sm text-label-sm px-3 py-1 rounded-full shadow-md">
                  Save ₹215
                </div>
                <h3 className="text-h3 font-h3 text-primary mb-2">Essential Kit</h3>
                <p className="text-body-md font-body-md text-on-surface-variant mb-6 pb-6 border-b border-outline-variant">
                  Everything you need for a month of daily worship.
                </p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-h2 font-h2 text-on-background">₹450</span>
                  <span className="text-body-md font-body-md text-on-surface-variant line-through">MRP ₹665</span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["Premium Deepa Oil (800ml)", "Hand-rolled Agarbatti", "Pure Camphor"].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-body-md font-body-md text-on-background text-left">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="#our-kits" className="block w-full text-center bg-primary-container text-on-primary-container font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary-container/90 transition-colors">
                  View Full Contents
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Kit Contents ─────────────────────────────────────────────────── */}
        <section className="py-16 md:py-section-padding-lg bg-surface relative" id="our-kits">
          <div className="max-w-container-max mx-auto px-4 md:px-gutter">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-h2 font-h2 text-primary mb-4">Inside Your Monthly Kit</h2>
              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Thoughtfully curated, premium quality essentials to support your daily spiritual practice.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { name: "Premium Deepa Oil",       qty: "800mL", desc: "Specially formulated long-lasting oil for daily lighting.",               icon: "local_fire_department", tag: "Long burning"    },
                { name: "Hand-rolled Agarbatti",   qty: "100g",  desc: "Natural, chemical-free incense sticks with soothing fragrances.",        icon: "air",                   tag: "Calming aroma"  },
                { name: "Pure Camphor",            qty: "100g",  desc: "High-grade camphor that burns completely without residue.",               icon: "lens_blur",             tag: "Smokeless"       },
                { name: "Dhoop Stick",             qty: "100g",  desc: "Traditional dhoop prepared with sacred herbs and resins.",                icon: "spa",                   tag: "Purifying"       },
                { name: "Cotton Wicks",            qty: "40 Nos",desc: "Hand-twisted pure cotton wicks for a steady, bright flame.",             icon: "wb_twilight",           tag: "Steady flame"    },
                { name: "Kumkuma & Shuddodaka",   qty: "Bottle",desc: "Vibrant kumkuma and purified water for auspicious beginnings.",          icon: "water_drop",            tag: "Auspicious"      },
              ].map(({ name, qty, desc, icon, tag }) => (
                <div key={name} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-h3 font-h3 text-on-background text-lg md:text-xl">{name}</h3>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-label-sm font-label-sm">{qty}</span>
                  </div>
                  <p className="text-body-md font-body-md text-on-surface-variant mb-4">{desc}</p>
                  <div className="inline-flex items-center gap-1 text-label-sm font-label-sm text-secondary">
                    <span className="material-symbols-outlined text-[16px]">{icon}</span> {tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section className="py-16 md:py-section-padding-lg bg-surface-container-low" id="how-it-works">
          <div className="max-w-container-max mx-auto px-4 md:px-gutter">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-h2 font-h2 text-primary mb-4">How It Works</h2>
              <p className="text-body-lg font-body-lg text-on-surface-variant">Simple steps to unhindered devotion.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-outline-variant z-0" />
              {[
                { img: "/step_place_order.png", title: "Place Order",       desc: "Select your preferred subscription plan."           },
                { img: "/step_payment.png",     title: "Complete Payment",  desc: "Securely checkout and confirm your order."          },
                { img: "/step_delivery.png",    title: "Receive Delivery",  desc: "Get your kit delivered to your doorstep monthly."   },
                { img: "/step_worship.png",     title: "Continue Worship",  desc: "Focus on your spiritual practice with peace of mind."},
              ].map(({ img, title, desc }) => (
                <div key={title} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-surface-container-lowest border-2 border-primary flex items-center justify-center mb-6 shadow-sm overflow-hidden relative">
                    <Image
                      src={img}
                      alt={title}
                      className="object-cover"
                      width={96}
                      height={96}
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-h3 font-h3 text-on-background mb-2">{title}</h3>
                  <p className="text-body-md text-on-surface-variant max-w-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Plans ────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-section-padding-lg bg-surface" id="plans">
          <div className="max-w-container-max mx-auto px-4 md:px-gutter">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-h2 font-h2 text-primary mb-4">Choose Your Plan</h2>
              <p className="text-body-lg font-body-lg text-on-surface-variant">Flexible subscriptions for your spiritual needs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Monthly */}
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant text-center">
                <h3 className="text-h3 font-h3 text-on-background mb-2">Monthly</h3>
                <p className="text-body-md text-on-surface-variant mb-6 pb-6 border-b border-outline-variant">Pay as you go</p>
                <div className="mb-6">
                  <span className="text-h2 font-h2 text-on-background">₹450</span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant">/month</span>
                </div>
                <Link href="/checkout?plan=Monthly" className="block w-full border border-primary text-primary font-label-sm py-3 rounded-lg hover:bg-primary/5 transition-colors text-center font-semibold">
                  Select Plan
                </Link>
              </div>
              {/* 3-Month — Popular */}
              <div className="bg-primary-container/10 p-8 rounded-xl border-2 border-primary text-center relative transform md:-translate-y-4 my-4 md:my-0 shadow-lg">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-on-primary font-label-sm px-4 py-1 rounded-full text-xs">Most Popular</div>
                <h3 className="text-h3 font-h3 text-primary mb-2">3-Month</h3>
                <p className="text-body-md text-on-surface-variant mb-6 pb-6 border-b border-primary/20">Quarterly commitment</p>
                <div className="mb-6">
                  <span className="text-h2 font-h2 text-on-background">₹1,299</span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant">/3 months</span>
                </div>
                <Link href="/checkout?plan=Quarterly" className="block w-full bg-primary text-on-primary font-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors text-center font-semibold">
                  Select Plan
                </Link>
              </div>
              {/* 6-Month — Best Value */}
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant text-center relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-tertiary text-on-tertiary font-label-sm px-4 py-1 rounded-full text-xs">Best Value</div>
                <h3 className="text-h3 font-h3 text-on-background mb-2">6-Month</h3>
                <p className="text-body-md text-on-surface-variant mb-6 pb-6 border-b border-outline-variant">Half-yearly peace of mind</p>
                <div className="mb-6">
                  <span className="text-h2 font-h2 text-on-background">₹2,499</span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant">/6 months</span>
                </div>
                <Link href="/checkout?plan=HalfYearly" className="block w-full border border-primary text-primary font-label-sm py-3 rounded-lg hover:bg-primary/5 transition-colors text-center font-semibold">
                  Select Plan
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────────── */}
        <section className="py-16 md:py-section-padding-lg bg-surface-container-low" id="testimonials">
          <div className="max-w-container-max mx-auto px-4 md:px-gutter">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-h2 font-h2 text-primary mb-4">What Our Devotees Say</h2>
              <p className="text-body-lg font-body-lg text-on-surface-variant">Join thousands of satisfied families.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                { name: "Rajesh K.",  city: "Bengaluru", quote: "The quality of the deepa oil and agarbatti is exceptional. It has brought a new level of serenity to my daily pooja." },
                { name: "Meena S.",   city: "Chennai",   quote: "Getting this kit every month means I never run out of essentials. The convenience and quality are unmatched."         },
                { name: "Ananya P.", city: "Hyderabad", quote: "Highly recommend SacredSamskara. The packaging is beautiful, and the camphor burns so purely."                      },
              ].map(({ name, city, quote }) => (
                <div key={name} className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant shadow-sm text-left">
                  <div className="flex text-primary mb-4">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-body-md text-on-surface-variant mb-6 italic">&ldquo;{quote}&rdquo;</p>
                  <div>
                    <h4 className="font-h3 text-on-background text-base md:text-lg">{name}</h4>
                    <span className="text-label-sm text-on-surface-variant">{city}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Referral & Coupons ───────────────────────────────────────────── */}
        <section className="py-12 md:py-[60px] bg-primary text-on-primary">
          <div className="max-w-container-max mx-auto px-4 md:px-gutter grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-center md:text-left items-center">
            <div>
              <h3 className="text-h2 font-h2 mb-4 text-2xl md:text-3xl">Refer a Friend</h3>
              <p className="text-body-lg mb-6 text-sm md:text-base">Share the blessing. Refer a friend and you both get ₹100 off your next monthly kit.</p>
              <button className="bg-surface text-primary font-semibold text-label-sm px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors text-sm">Get Referral Link</button>
            </div>
            <div className="md:pl-12 md:border-l border-on-primary/20">
              <h3 className="text-h2 font-h2 mb-4 text-2xl md:text-3xl">Special Offers</h3>
              <p className="text-body-lg mb-6 text-sm md:text-base">
                Use code{" "}
                <span className="font-bold bg-on-primary text-primary px-2 py-1 rounded mx-1">FIRSTMONTH</span>
                {" "}for 10% off your first subscription order.
              </p>
              <button className="border border-surface text-surface font-semibold text-label-sm px-6 py-3 rounded-lg hover:bg-on-primary/10 transition-colors text-sm">Apply Coupon</button>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-section-padding-lg bg-surface" id="faq">
          <div className="max-w-3xl mx-auto px-4 md:px-gutter">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-h2 font-h2 text-primary mb-4">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4 text-left">
              {[
                {
                  q: "What is included in the kit?",
                  a: "The Essential Kit includes Premium Deepa Oil (800ml), Hand-rolled Agarbatti (100g), Pure Camphor (100g), Dhoop Sticks (100g), Cotton Wicks (40 Nos), Kumkuma, and a Shuddodaka Bottle.",
                },
                {
                  q: "When will my kit be delivered?",
                  a: "Your first kit will be dispatched within 2 days of ordering. Subsequent monthly kits will arrive around the same date each month to ensure you never run out.",
                },
                {
                  q: "Can I cancel my subscription?",
                  a: "Yes, you can pause or cancel your monthly subscription at any time through your account dashboard or by contacting our support team via WhatsApp.",
                },
              ].map(({ q, a }) => (
                <details key={q} className="bg-surface-container-lowest border border-outline-variant rounded-lg group">
                  <summary className="font-h3 text-h3 text-base md:text-lg px-6 py-4 cursor-pointer flex justify-between items-center text-on-background list-none font-semibold">
                    {q}
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180 shrink-0">expand_more</span>
                  </summary>
                  <div className="px-6 pb-4 text-body-md text-on-surface-variant text-sm md:text-base">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-surface-container-lowest w-full border-t border-outline-variant flex flex-col items-center py-12 md:py-section-padding-lg px-4 md:px-gutter max-w-container-max mx-auto text-center">
        <div className="text-h2 font-h2 text-primary mb-4 text-2xl md:text-3xl">SacredSamskara</div>
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {["Privacy Policy", "Terms of Service", "Shipping Info", "Returns", "Contact Us"].map((link) => (
            <a key={link} className="text-on-surface-variant text-body-md font-body-md hover:text-secondary-container transition-colors text-sm" href="#">
              {link}
            </a>
          ))}
        </div>
        <p className="text-body-md font-body-md text-on-surface-variant text-xs md:text-sm">
          © 2025 SacredSamskara Spiritual Services. Handcrafted with Devotion.
        </p>
      </footer>

      {/* ── Floating WhatsApp ────────────────────────────────────────────────── */}
      <a
        href="https://wa.me/918431119696"
        rel="noopener noreferrer"
        target="_blank"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-[0px_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform z-50 flex items-center justify-center w-14 h-14"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
      </a>
    </div>
  );
}

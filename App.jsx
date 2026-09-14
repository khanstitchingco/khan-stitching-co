import React, { useState, useMemo, useEffect } from "react";

// ---------------------------------------------------------------------------
// CONFIG — in a real deployment these come from Admin Settings / env vars
// ---------------------------------------------------------------------------
const CONFIG = {
  whatsappNumber: "923001234567",
  brand: "Khan Stitching Co.",
  tagline: "Your Style, Our Craft",
  bank: { name: "Meezan Bank", title: "Khan Stitching Co.", account: "0123-4567-8901", iban: "PK00MEZN0001234567890123" },
  easypaisa: { account: "0300-1234567", title: "Khan Stitching Co." },
  jazzcash: { account: "0301-7654321", title: "Khan Stitching Co." },
  onlineGatewayConfigured: false,
  minDeliveryDays: 10,
  maxDeliveryDays: 14,
  advancePercent: 50,
};

const waLink = (msg) => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;

// ---------------------------------------------------------------------------
// GARMENT / FABRIC / MEASUREMENT DATA
// ---------------------------------------------------------------------------
const GARMENTS = [
  { key: "shalwar-kameez", name: "Shalwar Kameez", desc: "Custom stitched according to your measurements.", base: 6000, img: "https://picsum.photos/seed/ksc-sk/700/900" },
  { key: "waistcoat", name: "Waistcoat", desc: "Classic and modern waistcoat designs.", base: 5000, img: "https://picsum.photos/seed/ksc-vest/700/900" },
  { key: "coat-suit", name: "Coat & Suit", desc: "Professionally tailored formal wear.", base: 16000, img: "https://picsum.photos/seed/ksc-suit/700/900" },
  { key: "kurta", name: "Kurta", desc: "Custom-fit traditional and modern kurtas.", base: 4200, img: "https://picsum.photos/seed/ksc-kurta/700/900" },
];

const FABRICS = [
  { key: "standard", name: "Standard Fabric", quality: "Cotton blend, everyday wear", adjust: 0, img: "https://picsum.photos/seed/ksc-fab1/300/300" },
  { key: "premium", name: "Premium Fabric", quality: "Fine cotton / karandi", adjust: 1500, img: "https://picsum.photos/seed/ksc-fab2/300/300" },
  { key: "luxury", name: "Luxury Fabric", quality: "Imported wool blend / silk touch", adjust: 4000, img: "https://picsum.photos/seed/ksc-fab3/300/300" },
];

const COLORS = [
  { name: "Black", hex: "#171717" }, { name: "White", hex: "#F5F3EE" }, { name: "Navy Blue", hex: "#1E2A44" },
  { name: "Charcoal", hex: "#3A3733" }, { name: "Grey", hex: "#8B877E" }, { name: "Brown", hex: "#5A4632" },
  { name: "Cream", hex: "#E9DFC7" }, { name: "Beige", hex: "#D8C9A8" }, { name: "Maroon", hex: "#5E2028" }, { name: "Dark Green", hex: "#2C3B2A" },
];

const MEASUREMENT_FIELDS = {
  "shalwar-kameez": {
    Kameez: ["Chest", "Waist", "Hip", "Shoulder", "Sleeve Length", "Armhole", "Bicep", "Wrist", "Neck", "Front Length", "Back Length", "Bottom Width"],
    Shalwar: ["Waist", "Hip", "Full Length", "Bottom / Paicha", "Thigh", "Knee", "Belt / Waistband"],
  },
  "waistcoat": { Waistcoat: ["Chest", "Waist", "Shoulder", "Front Length", "Back Length", "Armhole", "Neck", "Bottom Width"] },
  "coat-suit": {
    Coat: ["Chest", "Waist", "Hip", "Shoulder", "Sleeve Length", "Bicep", "Wrist", "Coat Length", "Back Length", "Neck"],
    Trouser: ["Waist", "Hip", "Thigh", "Knee", "Bottom / Paicha", "Trouser Length", "Rise"],
  },
  "kurta": { Kurta: ["Chest", "Waist", "Hip", "Shoulder", "Sleeve Length", "Armhole", "Wrist", "Neck", "Kurta Length", "Bottom Width"] },
};

const STYLE_OPTIONS = {
  "shalwar-kameez": [["Collar Style", ["Standard", "Band", "Chinese"]], ["Cuff Style", ["Standard", "Round", "Straight"]]],
  "waistcoat": [["Style", ["Standard", "Classic", "Modern"]], ["Buttons", ["Standard Buttons", "Premium Buttons"]]],
  "coat-suit": [["Lapel Style", ["Notch", "Peak"]], ["Button Style", ["2 Button", "3 Button"]], ["Fit", ["Regular", "Slim", "Relaxed"]]],
  "kurta": [["Collar Style", ["Standard", "Band", "Chinese"]]],
};

const READY_MADE = [
  { id: "r1", name: "Ivory Embroidered Kurta — Ready to Wear", price: 4200, oldPrice: 4900, rating: 4.6, colors: ["Ivory", "Sky Blue"], sizes: ["S", "M", "L", "XL"], img: "https://picsum.photos/seed/ksc-ready1/700/900", tag: "Ready Stock" },
  { id: "r2", name: "Charcoal Formal Waistcoat — Ready to Wear", price: 5200, oldPrice: null, rating: 4.7, colors: ["Charcoal", "Black"], sizes: ["M", "L", "XL"], img: "https://picsum.photos/seed/ksc-ready2/700/900", tag: "Ready Stock" },
  { id: "r3", name: "Sand Linen Kurta — Ready to Wear", price: 3800, oldPrice: null, rating: 4.5, colors: ["Sand", "Olive"], sizes: ["S", "M", "L", "XL"], img: "https://picsum.photos/seed/ksc-ready3/700/900", tag: null },
];

const REVIEWS = [
  { name: "Ahmed R.", city: "Lahore", rating: 5, text: "Fit was perfect on the first try. Their tailoring team confirmed every measurement over WhatsApp before cutting the fabric.", verified: true },
  { name: "Bilal K.", city: "Karachi", rating: 5, text: "Ordered a custom coat for my wedding. Paid the advance, and everything else was communicated clearly at every stage.", verified: true },
  { name: "Hamza S.", city: "Islamabad", rating: 4, text: "Delivery took a couple of days longer than the estimate, but the finishing quality made up for it completely.", verified: false },
];

const HOW_IT_WORKS = [
  ["Choose Your Garment", "Select Shalwar Kameez, Waistcoat, Coat/Suit or Kurta."],
  ["Customize", "Choose fabric, color and style options."],
  ["Enter Measurements", "Provide your complete tailor measurements, in inches or cm."],
  ["Pay Advance", "Pay 50% advance or 100% full payment to confirm your order."],
  ["Expert Stitching", "Our tailoring team prepares your custom outfit."],
  ["Quality Check", "Every custom order is checked before dispatch."],
  ["Dispatch & Delivery", `Delivered in a minimum of ${CONFIG.minDeliveryDays} days.`],
];

// ---------------------------------------------------------------------------
// SHARED UI PRIMITIVES
// ---------------------------------------------------------------------------
function Stars({ rating }) {
  return (
    <span style={{ color: "var(--gold)", fontSize: 13, letterSpacing: 1 }}>
      {"★".repeat(Math.round(rating))}<span style={{ color: "#DCD3BE" }}>{"★".repeat(5 - Math.round(rating))}</span>
      <span style={{ color: "var(--text-muted)", marginLeft: 6, fontSize: 12 }}>{rating}</span>
    </span>
  );
}
function Money({ amount }) { return <>Rs. {Math.round(amount).toLocaleString("en-PK")}</>; }

function Button({ children, variant = "primary", onClick, type = "button", full, small }) {
  const base = {
    padding: small ? "9px 18px" : "13px 26px", borderRadius: 2, fontFamily: "'Manrope', sans-serif",
    fontSize: small ? 13 : 14.5, fontWeight: 600, cursor: "pointer", border: "1.5px solid transparent",
    transition: "all .2s ease", width: full ? "100%" : "auto", letterSpacing: 0.2,
  };
  const variants = {
    primary: { background: "var(--charcoal)", color: "#FFFDF9", borderColor: "var(--charcoal)" },
    gold: { background: "var(--gold)", color: "var(--charcoal)", borderColor: "var(--gold)" },
    outline: { background: "transparent", color: "var(--charcoal)", borderColor: "var(--charcoal)" },
    whatsapp: { background: "#25D366", color: "#fff", borderColor: "#25D366" },
    ghost: { background: "transparent", color: "var(--text-muted)", borderColor: "#D9CFBB" },
  };
  return (
    <button type={type} onClick={onClick} style={{ ...base, ...variants[variant] }}
      onMouseEnter={(e) => { if (variant === "primary") { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "var(--charcoal)"; e.currentTarget.style.borderColor = "var(--gold)"; } }}
      onMouseLeave={(e) => { if (variant === "primary") { e.currentTarget.style.background = "var(--charcoal)"; e.currentTarget.style.color = "#FFFDF9"; e.currentTarget.style.borderColor = "var(--charcoal)"; } }}>
      {children}
    </button>
  );
}
function Field({ label, hint, children }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)", marginBottom: 6, fontFamily: "'Manrope', sans-serif" }}>
        <span>{label}</span>{hint && <span style={{ fontSize: 11.5, color: "#B7ADA0" }}>{hint}</span>}
      </span>
      {children}
    </label>
  );
}
const inputStyle = { width: "100%", padding: "11px 13px", border: "1.5px solid #D9CFBB", borderRadius: 2, fontSize: 14.5, fontFamily: "'Manrope', sans-serif", color: "var(--charcoal)", background: "#FFFDF9", boxSizing: "border-box" };

function SectionTitle({ eyebrow, title, sub, dark }) {
  return (
    <div style={{ marginBottom: 30 }}>
      {eyebrow && <div style={{ fontSize: 12.5, color: "var(--gold)", fontWeight: 700, letterSpacing: 1, marginBottom: 8, fontFamily: "'Manrope', sans-serif" }}>{eyebrow}</div>}
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 30, color: dark ? "#FFFDF9" : "var(--charcoal)" }}>{title}</div>
      {sub && <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14.5, color: dark ? "#B7ADA0" : "var(--text-muted)", marginTop: 8, maxWidth: 520 }}>{sub}</div>}
    </div>
  );
}

function FloatingWhatsApp() {
  return (
    <a href={waLink("Assalam-o-Alaikum Khan Stitching Co., I need help.")} target="_blank" rel="noreferrer"
      style={{ position: "fixed", bottom: 76, right: 18, width: 52, height: 52, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,.25)", zIndex: 60, textDecoration: "none" }}>
      <span style={{ color: "#fff", fontSize: 24 }}>☎</span>
    </a>
  );
}

function MobileBottomNav({ page, setPage, cartCount }) {
  const items = [["home", "Home"], ["shop", "Shop"], ["custom", "Customize"], ["cart", `Cart${cartCount ? ` (${cartCount})` : ""}`], ["track", "Track"]];
  return (
    <div className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--charcoal)", display: "flex", zIndex: 55, borderTop: "1px solid #2b2b2b" }}>
      {items.map(([key, label]) => (
        <div key={key} onClick={() => setPage(key)} style={{ flex: 1, textAlign: "center", padding: "10px 4px", color: page === key ? "var(--gold)" : "#B7ADA0", fontSize: 11, fontFamily: "'Manrope', sans-serif", fontWeight: page === key ? 700 : 500, cursor: "pointer" }}>
          {label}
        </div>
      ))}
    </div>
  );
}

function Header({ page, setPage, cartCount }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [["home", "Home"], ["shop", "Shop"], ["custom", "Custom Stitching"], ["how", "How It Works"], ["reviews", "Reviews"], ["contact", "Contact"]];
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--charcoal)", borderBottom: "1px solid #2B2B2B", transition: "padding .2s ease" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: scrolled ? "10px 24px" : "18px 24px", transition: "padding .2s ease" }}>
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", fontFamily: "'Fraunces', serif", fontSize: 19, letterSpacing: 0.4, color: "#FFFDF9" }}>
          KHAN <span style={{ color: "var(--gold)" }}>STITCHING CO.</span>
        </div>
        <div className="desktop-nav" style={{ display: "flex", gap: 26, alignItems: "center" }}>
          {links.map(([key, label]) => (
            <span key={key} onClick={() => setPage(key)} style={{ cursor: "pointer", fontSize: 13.5, fontFamily: "'Manrope', sans-serif", color: page === key ? "var(--gold)" : "#D9D3C6", fontWeight: page === key ? 700 : 500 }}>{label}</span>
          ))}
          <span onClick={() => setPage("cart")} style={{ cursor: "pointer", fontSize: 13.5, fontFamily: "'Manrope', sans-serif", color: "#D9D3C6", fontWeight: 600 }}>Cart{cartCount > 0 ? ` (${cartCount})` : ""}</span>
          <Button variant="gold" small onClick={() => setPage("custom")}>Customize Your Suit</Button>
        </div>
      </div>
    </div>
  );
}

function Footer({ setPage }) {
  const cols = [
    { title: "Shop", items: ["Shalwar Kameez", "Waistcoat", "Coat & Suit", "Kurta", "Custom Stitching"] },
    { title: "Customer Care", items: ["Track Order", "Measurement Guide", "FAQ", "Shipping Policy", "Return & Exchange", "Contact Us"] },
    { title: "Company", items: ["About Us", "Our Craft", "Customer Reviews", "Blog / Style Guide"] },
    { title: "Information", items: ["Privacy Policy", "Terms & Conditions", "Payment Policy", "Custom Order Policy"] },
  ];
  return (
    <div style={{ background: "var(--charcoal)", color: "#B7ADA0", marginTop: 60 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 24px 30px", display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr", gap: 30 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: "#FFFDF9" }}>KHAN STITCHING CO.</div>
          <div style={{ fontSize: 13, color: "var(--gold)", marginTop: 4 }}>{CONFIG.tagline}</div>
          <p style={{ fontSize: 13, lineHeight: 1.7, marginTop: 12, maxWidth: 240 }}>Premium custom tailoring designed around your measurements, preferences and personal style.</p>
          <div style={{ display: "flex", gap: 14, marginTop: 18, fontSize: 18 }}>
            {["f", "ig", "tt", "yt", "wa"].map((s) => <span key={s} style={{ color: "var(--gold)", cursor: "pointer" }}>●</span>)}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div style={{ color: "#FFFDF9", fontSize: 13.5, marginBottom: 14, fontWeight: 600 }}>{c.title}</div>
            {c.items.map((t) => <div key={t} style={{ fontSize: 13, marginBottom: 10, cursor: "pointer" }}>{t}</div>)}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 30px" }}>
        <div style={{ borderTop: "1px solid #2B2B2B", paddingTop: 22 }}>
          <div style={{ color: "#FFFDF9", fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>Secure Payment Options</div>
          <div style={{ fontSize: 13, lineHeight: 2 }}>50% Advance Payment · 100% Full Payment · Bank Transfer · Easypaisa · JazzCash · Online Payment Gateway</div>
          <div style={{ fontSize: 12.5, color: "#8A8478", marginTop: 6 }}>Cash on Delivery is not available for custom stitched orders.</div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #2B2B2B", textAlign: "center", padding: "16px", fontSize: 12.5 }}>© 2026 Khan Stitching Co. All Rights Reserved. · Privacy · Terms · Payment Policy</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HOME PAGE SECTIONS
// ---------------------------------------------------------------------------
function Hero({ setPage }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ height: "min(72vh, 620px)", position: "relative", overflow: "hidden" }}>
        <img src="https://picsum.photos/seed/ksc-hero2/1600/1000" alt="Khan Stitching Co. tailored outfit" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(23,23,23,.72) 20%, rgba(23,23,23,.15) 70%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "0 24px" }}>
            <div style={{ maxWidth: 480 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(30px,4.5vw,48px)", lineHeight: 1.1, color: "#FFFDF9" }}>Perfect Fit. Made Just for You.</div>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15.5, color: "#D9D3C6", marginTop: 16, lineHeight: 1.6 }}>Custom stitched clothing crafted according to your measurements, style and choice of fabric.</p>
              <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
                <Button variant="gold" onClick={() => setPage("custom")}>Customize Your Suit</Button>
                <Button variant="outline" onClick={() => setPage("shop")} >
                  <span style={{ color: "#FFFDF9" }}>Explore Collection</span>
                </Button>
              </div>
              <div onClick={() => window.open(waLink("Assalam-o-Alaikum Khan Stitching Co., I'd like to know more."), "_blank")} style={{ marginTop: 16, fontSize: 13, color: "#25D366", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}>Chat on WhatsApp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  const items = ["Custom Measurements", "Premium Fabrics", "Expert Tailoring", `${CONFIG.minDeliveryDays}+ Day Crafting Process`, "Secure Advance Payment"];
  return (
    <div style={{ background: "var(--beige)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        {items.map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Manrope', sans-serif", fontSize: 13, color: "var(--charcoal)", fontWeight: 600 }}>
            <span style={{ color: "var(--gold)" }}>◆</span>{t}
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryCards({ setPage, setWizardGarment }) {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 20px" }}>
      <SectionTitle eyebrow="Made to Measure" title="Featured Custom Categories" />
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
        {GARMENTS.map((g) => (
          <div key={g.key} className="hover-card" style={{ background: "var(--card)", border: "1px solid #E9E1D5" }}>
            <div style={{ overflow: "hidden" }}>
              <img src={g.img} alt={g.name} className="zoom-img" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, color: "var(--charcoal)" }}>{g.name}</div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>{g.desc}</div>
              <div style={{ marginTop: 14 }}>
                <Button variant="outline" small full onClick={() => { setWizardGarment(g.key); setPage("custom"); }}>Customize Now</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomizationSplit({ setPage }) {
  const steps = ["Select Garment", "Choose Fabric & Color", "Enter Measurements", "Pay 50% Advance or 100% Full", "We Stitch & Deliver"];
  return (
    <div style={{ background: "var(--beige)", padding: "64px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        <img src="https://picsum.photos/seed/ksc-custom/800/950" alt="Tailoring" style={{ width: "100%", objectFit: "cover" }} />
        <div>
          <SectionTitle title="Your Measurements. Your Style. Your Fit." sub="Choose your garment, fabric, color and style. Enter your measurements and let Khan Stitching Co. create your custom outfit." />
          <div>
            {steps.map((s, i) => (
              <div key={s} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 0", borderBottom: i < steps.length - 1 ? "1px solid #DED4C0" : "none" }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 15, color: "var(--gold)", width: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14.5, color: "var(--charcoal)", fontWeight: 500 }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}><Button variant="gold" onClick={() => setPage("custom")}>Start Custom Order</Button></div>
        </div>
      </div>
    </div>
  );
}

function FabricColorSection() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 20px" }}>
      <SectionTitle eyebrow="Materials" title="Choose Your Fabric. Define Your Style." />
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 30 }}>
        {FABRICS.map((f) => (
          <div key={f.key} style={{ display: "flex", gap: 14, background: "var(--card)", border: "1px solid #E9E1D5", padding: 14, alignItems: "center" }}>
            <img src={f.img} alt={f.name} style={{ width: 62, height: 62, objectFit: "cover" }} />
            <div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14.5, color: "var(--charcoal)" }}>{f.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{f.quality}</div>
              <div style={{ fontSize: 12.5, color: "var(--gold)", marginTop: 4, fontWeight: 600 }}>{f.adjust === 0 ? "Included" : `+ Rs. ${f.adjust.toLocaleString()}`}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>Available Colors</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {COLORS.map((c) => (
          <div key={c.name} title={c.name} style={{ width: 34, height: 34, borderRadius: "50%", background: c.hex, border: "2px solid #FFFDF9", boxShadow: "0 0 0 1.5px #D9CFBB" }} />
        ))}
      </div>
    </div>
  );
}

function WhyChooseUs() {
  const items = [
    ["Perfect Measurements", "Every custom garment is based on your submitted measurements."],
    ["Premium Craftsmanship", "Careful stitching and finishing."],
    ["Personal Customization", "Choose your fabric, color and style."],
    ["Quality Check", "Every custom order goes through a quality-check stage."],
    ["Secure Payment", "50% advance or 100% full payment."],
    [`Minimum ${CONFIG.minDeliveryDays}-Day Delivery`, "Custom orders require time for proper tailoring and finishing."],
  ];
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 20px" }}>
      <SectionTitle eyebrow="The Difference" title="Why Khan Stitching Co." />
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
        {items.map(([t, d]) => (
          <div key={t} style={{ borderTop: "2px solid var(--gold)", paddingTop: 14 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 17, color: "var(--charcoal)" }}>{t}</div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13.5, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.6 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div style={{ background: "var(--beige)", padding: "64px 24px" }} id="how-it-works">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionTitle eyebrow="The Process" title="How It Works" sub={`Minimum delivery time: ${CONFIG.minDeliveryDays} days`} />
        <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {HOW_IT_WORKS.map(([t, d], i) => (
            <div key={t}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14.5, color: "var(--charcoal)", marginTop: 6 }}>{t}</div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewsSection({ setPage }) {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 20px" }} id="reviews">
      <SectionTitle eyebrow="Testimonials" title="What Our Customers Say" sub="Real experiences from customers who ordered from Khan Stitching Co." />
      <div style={{ fontSize: 12, color: "#B7ADA0", marginTop: -18, marginBottom: 24, fontFamily: "'Manrope', sans-serif" }}>Example content shown for design purposes — live reviews are collected after delivery and published once approved.</div>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {REVIEWS.map((r) => (
          <div key={r.name} style={{ background: "var(--card)", border: "1px solid #E9E1D5", padding: 22 }}>
            <Stars rating={r.rating} />
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: "var(--charcoal)", lineHeight: 1.6, marginTop: 12 }}>{r.text}</p>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              {r.name} — {r.city}
              {r.verified && <span style={{ fontSize: 10.5, color: "var(--gold)", border: "1px solid var(--gold)", padding: "2px 6px" }}>Verified Purchase</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 30 }}><ReviewForm /></div>
    </div>
  );
}

function ReviewForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", order: "", rating: 5, text: "" });
  if (sent) return <div style={{ background: "var(--beige)", padding: 20, fontFamily: "'Manrope', sans-serif", fontSize: 14, color: "var(--charcoal)" }}>Thank you. Your review has been submitted and will be published after approval.</div>;
  return (
    <div style={{ background: "var(--beige)", padding: 24, maxWidth: 520 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: "var(--charcoal)", marginBottom: 14 }}>Share Your Experience</div>
      <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Name"><input required style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="City"><input required style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        </div>
        <Field label="Order Number"><input style={inputStyle} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Field>
        <Field label="Rating">
          <select style={inputStyle} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
          </select>
        </Field>
        <Field label="Review"><textarea required rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></Field>
        <Button type="submit">Submit Review</Button>
      </form>
    </div>
  );
}

function OffersSection() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 20px" }}>
      <div style={{ background: "var(--card)", border: "1px solid #E9E1D5", padding: "36px 30px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: "var(--charcoal)" }}>Made for You. Crafted with Care.</div>
        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13.5, color: "var(--text-muted)", marginTop: 10 }}>First-order discount and seasonal offers — updated by Khan Stitching Co. from time to time.</div>
      </div>
    </div>
  );
}

function FinalCTA({ setPage }) {
  return (
    <div style={{ background: "var(--charcoal)", padding: "56px 24px", marginTop: 20 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "#FFFDF9" }}>Ready for Your Perfect Fit?</div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14.5, color: "#B7ADA0", marginTop: 10 }}>Create your custom outfit with Khan Stitching Co.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
          <Button variant="gold" onClick={() => setPage("custom")}>Customize Your Suit</Button>
          <Button variant="outline" onClick={() => window.open(waLink("Assalam-o-Alaikum Khan Stitching Co., I'd like to place a custom order."), "_blank")}><span style={{ color: "#FFFDF9" }}>Chat on WhatsApp</span></Button>
        </div>
      </div>
    </div>
  );
}

function Home({ setPage, setWizardGarment }) {
  return (
    <div>
      <Hero setPage={setPage} />
      <TrustBar />
      <CategoryCards setPage={setPage} setWizardGarment={setWizardGarment} />
      <CustomizationSplit setPage={setPage} />
      <FabricColorSection />
      <WhyChooseUs />
      <HowItWorks />
      <ReviewsSection setPage={setPage} />
      <OffersSection />
      <FinalCTA setPage={setPage} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// READY-MADE SHOP (secondary business line)
// ---------------------------------------------------------------------------
function ProductCard({ p, onOpen, onAdd }) {
  return (
    <div className="hover-card" style={{ background: "var(--card)", border: "1px solid #E9E1D5" }}>
      <div style={{ position: "relative", cursor: "pointer", overflow: "hidden" }} onClick={onOpen}>
        <img src={p.img} alt={p.name} className="zoom-img" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
        {p.tag && <div style={{ position: "absolute", top: 10, left: 10, background: "var(--gold)", color: "var(--charcoal)", fontSize: 11, fontWeight: 700, padding: "4px 9px" }}>{p.tag}</div>}
      </div>
      <div style={{ padding: 14 }}>
        <div onClick={onOpen} style={{ cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--charcoal)", lineHeight: 1.4, minHeight: 38 }}>{p.name}</div>
        <Stars rating={p.rating} />
        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "baseline" }}>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 15.5, color: "var(--charcoal)" }}><Money amount={p.price} /></span>
          {p.oldPrice && <span style={{ fontSize: 13, color: "#B7ADA0", textDecoration: "line-through" }}><Money amount={p.oldPrice} /></span>}
        </div>
        <div style={{ marginTop: 10 }}><Button variant="outline" full small onClick={onAdd}>Add to Cart</Button></div>
      </div>
    </div>
  );
}

function Shop({ openProduct, addToCart, setPage, setWizardGarment }) {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 20px" }}>
      <SectionTitle eyebrow="Ready to Wear" title="Shop" sub="A small ready-made collection alongside our main custom-stitching service." />
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
        {READY_MADE.map((p) => <ProductCard key={p.id} p={p} onOpen={() => openProduct(p)} onAdd={() => addToCart(p, p.sizes[0], p.colors[0], 1)} />)}
      </div>
      <div style={{ marginTop: 30, background: "var(--beige)", padding: 22, textAlign: "center" }}>
        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: "var(--charcoal)" }}>Want it made exactly to your measurements instead?</div>
        <div style={{ marginTop: 12 }}><Button variant="gold" onClick={() => setPage("custom")}>Customize Your Suit</Button></div>
      </div>
    </div>
  );
}

function ProductDetail({ product, addToCart, setPage }) {
  const [size, setSize] = useState(product?.sizes[0]);
  const [color, setColor] = useState(product?.colors[0]);
  const [qty, setQty] = useState(1);
  if (!product) return null;
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 60px" }}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <img src={product.img} alt={product.name} style={{ width: "100%", objectFit: "cover" }} />
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: "var(--charcoal)" }}>{product.name}</div>
          <div style={{ marginTop: 10 }}><Stars rating={product.rating} /></div>
          <div style={{ marginTop: 14, fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--charcoal)" }}><Money amount={product.price} /></div>
          <Field label="Color">
            <div style={{ display: "flex", gap: 8 }}>{product.colors.map((c) => <span key={c} onClick={() => setColor(c)} style={{ cursor: "pointer", padding: "8px 14px", fontSize: 13.5, border: "1.5px solid " + (color === c ? "var(--charcoal)" : "#D9CFBB"), background: color === c ? "var(--charcoal)" : "transparent", color: color === c ? "#fff" : "var(--charcoal)" }}>{c}</span>)}</div>
          </Field>
          <Field label="Size">
            <div style={{ display: "flex", gap: 8 }}>{product.sizes.map((s) => <span key={s} onClick={() => setSize(s)} style={{ cursor: "pointer", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, border: "1.5px solid " + (size === s ? "var(--charcoal)" : "#D9CFBB"), background: size === s ? "var(--charcoal)" : "transparent", color: size === s ? "#fff" : "var(--charcoal)" }}>{s}</span>)}</div>
          </Field>
          <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <Button onClick={() => addToCart(product, size, color, qty)}>Add to Cart</Button>
            <Button variant="gold" onClick={() => { addToCart(product, size, color, qty); setPage("checkout"); }}>Buy Now</Button>
            <Button variant="whatsapp" onClick={() => window.open(waLink(`Assalam-o-Alaikum, I am interested in ${product.name} (Size: ${size}, Color: ${color}).`), "_blank")}>WhatsApp Order</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CUSTOM ORDER WIZARD — the core of the site
// ---------------------------------------------------------------------------
const WIZARD_STEPS = ["Garment", "Fabric & Color", "Measurements", "Style & Instructions", "Review", "Payment"];

function priceFor(order) {
  const g = GARMENTS.find((x) => x.key === order.garment);
  const f = FABRICS.find((x) => x.key === order.fabric);
  return (g?.base || 0) + (f?.adjust || 0);
}

function CustomOrderWizard({ initialGarment, cameFromCategory, setPage }) {
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState({
    garment: initialGarment || "", fabric: "standard", color: "Charcoal", customColor: "",
    unit: "inches", measurements: {}, style: {}, notes: "", refImage: "", payment: "advance",
    name: "", phone: "", whatsapp: "", email: "", city: "", address: "",
  });
  const [confirmed, setConfirmed] = useState(null);
  const set = (k, v) => setOrder((o) => ({ ...o, [k]: v }));
  const setMeasurement = (k, v) => setOrder((o) => ({ ...o, measurements: { ...o.measurements, [k]: v } }));
  const setStyle = (k, v) => setOrder((o) => ({ ...o, style: { ...o.style, [k]: v } }));

  const garment = GARMENTS.find((g) => g.key === order.garment);
  const total = priceFor(order);
  const advance = Math.round(total * (CONFIG.advancePercent / 100));
  const remaining = total - advance;
  const payNow = order.payment === "advance" ? advance : total;

  const canNext = () => {
    if (step === 0) return !!order.garment;
    if (step === 4 === false) return true;
    return true;
  };

  const submit = () => {
    const number = "KSC-C" + Math.floor(100000 + Math.random() * 900000);
    setConfirmed({ number, order, total, advance, remaining, payNow });
  };

  if (confirmed) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "70px 24px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: "var(--charcoal)" }}>Your Custom Order Has Been Confirmed</div>
          <div style={{ fontFamily: "'Manrope', sans-serif", color: "var(--gold)", fontWeight: 700, marginTop: 8 }}>Order #{confirmed.number}</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid #E9E1D5", padding: 22, marginTop: 26, fontFamily: "'Manrope', sans-serif", fontSize: 14, lineHeight: 2 }}>
          <div><b>Garment:</b> {garment?.name}</div>
          <div><b>Fabric:</b> {FABRICS.find((f) => f.key === order.fabric)?.name}</div>
          <div><b>Color:</b> {order.color === "Custom" ? order.customColor : order.color}</div>
          <div><b>Amount Paid Now:</b> <Money amount={confirmed.payNow} /></div>
          {order.payment === "advance" && <div><b>Remaining Balance:</b> <Money amount={confirmed.remaining} /></div>}
          <div><b>Payment Method:</b> {order.payment === "advance" ? `${CONFIG.advancePercent}% Advance` : "100% Full Payment"}</div>
          <div><b>Estimated Delivery:</b> {CONFIG.minDeliveryDays}–{CONFIG.maxDeliveryDays} days</div>
        </div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13.5, color: "var(--text-muted)", marginTop: 18, lineHeight: 1.7, textAlign: "center" }}>
          Your order has been received and will now proceed through measurement verification and stitching. Minimum delivery time is {CONFIG.minDeliveryDays} days.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "center", flexWrap: "wrap" }}>
          <Button onClick={() => setPage("track")}>Track Order</Button>
          <Button variant="whatsapp" onClick={() => window.open(waLink(`Assalam-o-Alaikum, I just placed custom order #${confirmed.number}.`), "_blank")}>Contact on WhatsApp</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 90px" }}>
      <SectionTitle eyebrow="Custom Order" title="Designed for You. Stitched to Your Measurements." sub="Choose your garment, fabric, color and provide your measurements. Our tailoring team will prepare your custom outfit accordingly." />

      {/* progress */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 34, flexWrap: "wrap", gap: 4 }}>
        {WIZARD_STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div onClick={() => i < step && setStep(i)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: i < step ? "pointer" : "default" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: i <= step ? "var(--gold)" : "var(--beige)", color: i <= step ? "var(--charcoal)" : "#B7ADA0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}>{i + 1}</div>
              <span style={{ fontSize: 12.5, fontFamily: "'Manrope', sans-serif", color: i === step ? "var(--charcoal)" : "#B7ADA0", fontWeight: i === step ? 700 : 500 }}>{s}</span>
            </div>
            {i < WIZARD_STEPS.length - 1 && <div style={{ width: 20, height: 1, background: "#D9CFBB", margin: "0 4px" }} />}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 0: GARMENT */}
      {step === 0 && (
        <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {GARMENTS.map((g) => (
            <div key={g.key} onClick={() => set("garment", g.key)} style={{ cursor: "pointer", border: "2px solid " + (order.garment === g.key ? "var(--gold)" : "#E9E1D5"), background: "var(--card)" }}>
              <img src={g.img} alt={g.name} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
              <div style={{ padding: 12, fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 13.5, color: "var(--charcoal)" }}>{g.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: FABRIC & COLOR */}
      {step === 1 && (
        <div>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--gold)", marginBottom: 12 }}>FABRIC</div>
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 26 }}>
            {FABRICS.map((f) => (
              <div key={f.key} onClick={() => set("fabric", f.key)} style={{ cursor: "pointer", display: "flex", gap: 12, alignItems: "center", padding: 12, border: "2px solid " + (order.fabric === f.key ? "var(--gold)" : "#E9E1D5"), background: "var(--card)" }}>
                <img src={f.img} alt={f.name} style={{ width: 48, height: 48, objectFit: "cover" }} />
                <div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13.5 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: "var(--gold)" }}>{f.adjust === 0 ? "Included" : `+Rs.${f.adjust.toLocaleString()}`}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--gold)", marginBottom: 12 }}>COLOR</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {COLORS.map((c) => (
              <div key={c.name} onClick={() => set("color", c.name)} title={c.name} style={{ width: 40, height: 40, borderRadius: "50%", background: c.hex, cursor: "pointer", boxShadow: order.color === c.name ? "0 0 0 3px var(--gold)" : "0 0 0 1.5px #D9CFBB" }} />
            ))}
            <div onClick={() => set("color", "Custom")} style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, cursor: "pointer", background: "#fff", boxShadow: order.color === "Custom" ? "0 0 0 3px var(--gold)" : "0 0 0 1.5px #D9CFBB" }}>+</div>
          </div>
          {order.color === "Custom" && <div style={{ marginTop: 14, maxWidth: 300 }}><Field label="Describe your color"><input style={inputStyle} value={order.customColor} onChange={(e) => set("customColor", e.target.value)} /></Field></div>}
        </div>
      )}

      {/* STEP 2: MEASUREMENTS */}
      {step === 2 && garment && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: "var(--text-muted)" }}>All measurements in your preferred unit.</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["inches", "cm"].map((u) => <span key={u} onClick={() => set("unit", u)} style={{ cursor: "pointer", padding: "6px 12px", fontSize: 12.5, border: "1.5px solid " + (order.unit === u ? "var(--charcoal)" : "#D9CFBB"), background: order.unit === u ? "var(--charcoal)" : "transparent", color: order.unit === u ? "#fff" : "var(--charcoal)" }}>{u}</span>)}
            </div>
          </div>
          {Object.entries(MEASUREMENT_FIELDS[order.garment] || {}).map(([section, fields]) => (
            <div key={section} style={{ marginBottom: 26 }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--gold)", marginBottom: 12 }}>{section.toUpperCase()}</div>
              <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {fields.map((f) => (
                  <Field key={section + f} label={f} hint={order.unit}>
                    <input type="number" style={inputStyle} value={order.measurements[section + f] || ""} onChange={(e) => setMeasurement(section + f, e.target.value)} />
                  </Field>
                ))}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", fontFamily: "'Manrope', sans-serif" }}>Unsure how to measure? <span style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }} onClick={() => window.open(waLink("Assalam-o-Alaikum, I need help with my measurements."), "_blank")}>Contact Us on WhatsApp</span></div>
        </div>
      )}

      {/* STEP 3: STYLE & INSTRUCTIONS */}
      {step === 3 && (
        <div>
          {(STYLE_OPTIONS[order.garment] || []).map(([label, options]) => (
            <Field key={label} label={label}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {options.map((op) => <span key={op} onClick={() => setStyle(label, op)} style={{ cursor: "pointer", padding: "8px 14px", fontSize: 13, border: "1.5px solid " + (order.style[label] === op ? "var(--charcoal)" : "#D9CFBB"), background: order.style[label] === op ? "var(--charcoal)" : "transparent", color: order.style[label] === op ? "#fff" : "var(--charcoal)" }}>{op}</span>)}
              </div>
            </Field>
          ))}
          <Field label="Reference / Design Image (optional)"><input type="file" accept="image/jpeg,image/png,image/webp" style={inputStyle} onChange={(e) => set("refImage", e.target.files[0]?.name || "")} /></Field>
          <Field label="Special Instructions for Tailor"><textarea rows={3} placeholder="e.g. loose fitting, slim fitting, specific collar/cuff..." style={{ ...inputStyle, resize: "vertical" }} value={order.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
        </div>
      )}

      {/* STEP 4: REVIEW */}
      {step === 4 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <Field label="Full Name"><input required style={inputStyle} value={order.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Phone"><input required style={inputStyle} value={order.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="WhatsApp"><input required style={inputStyle} value={order.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
            <Field label="Email"><input type="email" style={inputStyle} value={order.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="City"><input required style={inputStyle} value={order.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="Address"><input required style={inputStyle} value={order.address} onChange={(e) => set("address", e.target.value)} /></Field>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid #E9E1D5", padding: 20, fontFamily: "'Manrope', sans-serif", fontSize: 14, lineHeight: 2 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>CUSTOM ORDER SUMMARY</div>
            <div><b>Garment:</b> {garment?.name}</div>
            <div><b>Fabric:</b> {FABRICS.find((f) => f.key === order.fabric)?.name}</div>
            <div><b>Color:</b> {order.color === "Custom" ? order.customColor || "Custom" : order.color}</div>
            <div><b>Special Instructions:</b> {order.notes || "None"}</div>
            <div><b>Reference Image:</b> {order.refImage || "Not uploaded"}</div>
            <div style={{ borderTop: "1px solid #E9E1D5", marginTop: 8, paddingTop: 8, fontWeight: 700 }}>Total: <Money amount={total} /></div>
          </div>
        </div>
      )}

      {/* STEP 5: PAYMENT */}
      {step === 5 && (
        <div>
          <div style={{ background: "var(--card)", border: "1px solid #E9E1D5", padding: 20, marginBottom: 22, fontFamily: "'Manrope', sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span>Total Order</span><span><Money amount={total} /></span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span>Estimated Delivery</span><span>{CONFIG.minDeliveryDays}–{CONFIG.maxDeliveryDays} days</span></div>
          </div>

          {[
            { key: "advance", label: `${CONFIG.advancePercent}% Advance`, sub: `Pay Now: Rs. ${advance.toLocaleString()} · Remaining: Rs. ${remaining.toLocaleString()}` },
            { key: "full", label: "100% Full Payment", sub: `Pay Now: Rs. ${total.toLocaleString()}` },
          ].map((opt) => (
            <div key={opt.key} onClick={() => set("payment", opt.key)} style={{ cursor: "pointer", border: "2px solid " + (order.payment === opt.key ? "var(--gold)" : "#E9E1D5"), padding: 16, marginBottom: 12, background: "var(--card)" }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14.5 }}>{opt.label}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>{opt.sub}</div>
            </div>
          ))}

          <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--gold)", margin: "20px 0 10px" }}>PAYMENT METHOD</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'Manrope', sans-serif", lineHeight: 1.9 }}>
            Bank: {CONFIG.bank.name} · {CONFIG.bank.account}<br />
            Easypaisa: {CONFIG.easypaisa.account}<br />
            JazzCash: {CONFIG.jazzcash.account}<br />
            Online Gateway: {CONFIG.onlineGatewayConfigured ? "Available" : "Currently unavailable"}
          </div>
          <div style={{ fontSize: 12.5, color: "#B7ADA0", marginTop: 10, fontFamily: "'Manrope', sans-serif" }}>Custom orders require advance payment. Cash on Delivery is not available.</div>
          <Field label="Transaction ID (after payment)"><input style={{ ...inputStyle, marginTop: 12 }} placeholder="Enter after completing transfer" /></Field>
          <Field label="Payment Screenshot"><input type="file" accept="image/*" style={inputStyle} /></Field>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 34 }}>
        {step > 0 ? <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Back</Button> : <span />}
        {step < WIZARD_STEPS.length - 1 ? (
          <Button variant="gold" onClick={() => canNext() && setStep((s) => s + 1)}>Continue</Button>
        ) : (
          <Button variant="gold" onClick={submit}>Proceed to Payment</Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CART / CHECKOUT (ready-made line — same no-COD policy)
// ---------------------------------------------------------------------------
function Cart({ cart, updateQty, removeItem, setPage }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
      <SectionTitle title="Cart" />
      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", color: "var(--text-muted)" }}>Your cart is empty.</p>
          <div style={{ marginTop: 18 }}><Button onClick={() => setPage("shop")}>Continue Shopping</Button></div>
        </div>
      ) : (
        <>
          {cart.map((item, idx) => (
            <div key={idx} style={{ display: "flex", gap: 16, padding: "18px 0", borderBottom: "1px solid #E9E1D5" }}>
              <img src={item.img} alt={item.name} style={{ width: 84, height: 100, objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14.5 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Size: {item.size} · Color: {item.color}</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
                  <span onClick={() => updateQty(idx, -1)} style={{ cursor: "pointer", width: 30, height: 30, border: "1.5px solid #D9CFBB", display: "flex", alignItems: "center", justifyContent: "center" }}>−</span>
                  <span>{item.qty}</span>
                  <span onClick={() => updateQty(idx, 1)} style={{ cursor: "pointer", width: 30, height: 30, border: "1.5px solid #D9CFBB", display: "flex", alignItems: "center", justifyContent: "center" }}>+</span>
                  <span onClick={() => removeItem(idx)} style={{ cursor: "pointer", fontSize: 13, color: "#B7ADA0", marginLeft: 14, textDecoration: "underline" }}>Remove</span>
                </div>
              </div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}><Money amount={item.price * item.qty} /></div>
            </div>
          ))}
          <div style={{ marginTop: 24, marginLeft: "auto", maxWidth: 300 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 17 }}><span>Total</span><span><Money amount={subtotal} /></span></div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <Button variant="outline" onClick={() => setPage("shop")}>Continue Shopping</Button>
              <Button variant="gold" onClick={() => setPage("checkout")}>Checkout</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Checkout({ cart, setPage, placeOrder }) {
  const [payment, setPayment] = useState("advance");
  const [method, setMethod] = useState("Bank");
  const [form, setForm] = useState({ name: "", phone: "", whatsapp: "", email: "", address: "", city: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const advance = Math.round(total * (CONFIG.advancePercent / 100));
  const payNow = payment === "advance" ? advance : total;

  if (cart.length === 0) return <div style={{ textAlign: "center", padding: "70px 24px" }}><Button onClick={() => setPage("shop")}>Go to Shop</Button></div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
      <SectionTitle title="Checkout" />
      <form onSubmit={(e) => { e.preventDefault(); placeOrder(form, payment, method, total, payNow); }} className="grid-2" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40 }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Full Name"><input required style={inputStyle} value={form.name} onChange={set("name")} /></Field>
            <Field label="Phone"><input required style={inputStyle} value={form.phone} onChange={set("phone")} /></Field>
            <Field label="WhatsApp"><input required style={inputStyle} value={form.whatsapp} onChange={set("whatsapp")} /></Field>
            <Field label="Email"><input type="email" style={inputStyle} value={form.email} onChange={set("email")} /></Field>
          </div>
          <Field label="Address"><input required style={inputStyle} value={form.address} onChange={set("address")} /></Field>
          <Field label="City"><input required style={inputStyle} value={form.city} onChange={set("city")} /></Field>

          <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--gold)", margin: "18px 0 10px" }}>PAYMENT</div>
          {[{ key: "advance", label: `${CONFIG.advancePercent}% Advance` }, { key: "full", label: "100% Full Payment" }].map((o) => (
            <div key={o.key} onClick={() => setPayment(o.key)} style={{ cursor: "pointer", border: "1.5px solid " + (payment === o.key ? "var(--charcoal)" : "#E9E1D5"), padding: 12, marginBottom: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}><input type="radio" checked={payment === o.key} readOnly /><span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14 }}>{o.label}</span></label>
            </div>
          ))}
          <div style={{ fontSize: 12, color: "#B7ADA0", margin: "8px 0 16px", fontFamily: "'Manrope', sans-serif" }}>Cash on Delivery is not available.</div>
          <select style={inputStyle} value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="Bank">Bank Transfer</option>
            <option value="Easypaisa">Easypaisa</option>
            <option value="JazzCash">JazzCash</option>
            <option value="Gateway" disabled={!CONFIG.onlineGatewayConfigured}>Online Payment Gateway {!CONFIG.onlineGatewayConfigured ? "(unavailable)" : ""}</option>
          </select>
        </div>
        <div>
          <div style={{ background: "var(--card)", border: "1px solid #E9E1D5", padding: 20 }}>
            {cart.map((item, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8, fontFamily: "'Manrope', sans-serif" }}><span>{item.name} × {item.qty}</span><span><Money amount={item.price * item.qty} /></span></div>)}
            <div style={{ borderTop: "1px solid #E9E1D5", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}><span>Total</span><span><Money amount={total} /></span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginTop: 8, color: "var(--gold)" }}><span>Pay Now</span><span><Money amount={payNow} /></span></div>
          </div>
          <div style={{ marginTop: 16 }}><Button type="submit" full variant="gold">Place Order</Button></div>
        </div>
      </form>
    </div>
  );
}

function Confirmation({ order, setPage }) {
  if (!order) return <div style={{ padding: 70, textAlign: "center" }}><Button onClick={() => setPage("home")}>Go Home</Button></div>;
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "70px 24px" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: "var(--charcoal)" }}>Thank You for Your Order!</div>
        <div style={{ fontFamily: "'Manrope', sans-serif", color: "var(--gold)", fontWeight: 700, marginTop: 8 }}>Order #{order.number}</div>
      </div>
      <div style={{ background: "var(--card)", border: "1px solid #E9E1D5", padding: 20, marginTop: 24, fontFamily: "'Manrope', sans-serif", fontSize: 14, lineHeight: 2 }}>
        <div><b>Customer:</b> {order.form.name}</div>
        <div><b>Items:</b> {order.cart.map((i) => `${i.name} (×${i.qty})`).join(", ")}</div>
        <div><b>Total:</b> <Money amount={order.total} /></div>
        <div><b>Paid Now:</b> <Money amount={order.payNow} /></div>
        <div><b>Payment Method:</b> {order.method}</div>
        <div><b>Status:</b> Payment Pending</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "center", flexWrap: "wrap" }}>
        <Button onClick={() => setPage("track")}>Track Order</Button>
        <Button variant="whatsapp" onClick={() => window.open(waLink(`Assalam-o-Alaikum, I just placed order #${order.number}.`), "_blank")}>Contact on WhatsApp</Button>
      </div>
    </div>
  );
}

function TrackOrder() {
  const [number, setNumber] = useState("");
  const steps = ["Payment Pending", "Order Confirmed", "Measurement Verification", "Stitching Started", "Stitching in Progress", "Quality Check", "Ready for Dispatch", "Shipped", "Delivered"];
  const [searched, setSearched] = useState(false);
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>
      <SectionTitle title="Track Order" sub="Demo tracking view — enter any order number to preview the status timeline." />
      <form onSubmit={(e) => { e.preventDefault(); setSearched(true); }} style={{ display: "flex", gap: 12 }}>
        <input placeholder="Order Number" style={inputStyle} value={number} onChange={(e) => setNumber(e.target.value)} />
        <Button type="submit">Track</Button>
      </form>
      {searched && (
        <div style={{ marginTop: 30 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: i <= 1 ? "var(--gold)" : "var(--beige)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i <= 1 ? "var(--charcoal)" : "#B7ADA0" }}>{i + 1}</div>
                {i < steps.length - 1 && <div style={{ width: 2, height: 26, background: i < 1 ? "var(--gold)" : "#E9E1D5" }} />}
              </div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13.5, paddingTop: 2, color: i <= 1 ? "var(--charcoal)" : "#B7ADA0", fontWeight: i === 1 ? 700 : 500 }}>{s}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SimplePage({ title, children }) {
  return <div style={{ maxWidth: 780, margin: "0 auto", padding: "50px 24px 80px" }}><SectionTitle title={title} />{children}</div>;
}

// ---------------------------------------------------------------------------
// APP
// ---------------------------------------------------------------------------
export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [wizardGarment, setWizardGarment] = useState("");

  const addToCart = (product, size, color, qty) => setCart((c) => {
    const idx = c.findIndex((i) => i.id === product.id && i.size === size && i.color === color);
    if (idx >= 0) { const copy = [...c]; copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty }; return copy; }
    return [...c, { ...product, size, color, qty }];
  });
  const updateQty = (idx, delta) => setCart((c) => c.map((item, i) => i === idx ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  const removeItem = (idx) => setCart((c) => c.filter((_, i) => i !== idx));
  const openProduct = (p) => { setSelectedProduct(p); setPage("product"); };

  const placeOrder = (form, payment, method, total, payNow) => {
    const number = "KSC" + Math.floor(100000 + Math.random() * 900000);
    setLastOrder({ number, form, payment, method, total, payNow, cart: [...cart] });
    setCart([]);
    setPage("confirmation");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ background: "var(--cream)", minHeight: "100%", fontFamily: "'Manrope', sans-serif", paddingBottom: 56 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap');
        :root {
          --charcoal: #171717;
          --gold: #B89B5E;
          --cream: #F6F1E8;
          --beige: #E9E1D5;
          --card: #FFFDF9;
          --text-muted: #6B6459;
        }
        * { box-sizing: border-box; }
        .hover-card { transition: box-shadow .25s ease, transform .25s ease; }
        .hover-card:hover { box-shadow: 0 10px 24px rgba(23,23,23,.08); transform: translateY(-2px); }
        .zoom-img { transition: transform .4s ease; }
        .hover-card:hover .zoom-img { transform: scale(1.04); }
        .mobile-bottom-nav { display: none; }
        @media (max-width: 860px) {
          .grid-4 { grid-template-columns: repeat(2,1fr) !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .desktop-nav > span:not(:last-child) { display: none; }
          .mobile-bottom-nav { display: flex !important; }
        }
      `}</style>
      <Header page={page} setPage={setPage} cartCount={cartCount} />
      {page === "home" && <Home setPage={setPage} setWizardGarment={setWizardGarment} />}
      {page === "shop" && <Shop openProduct={openProduct} addToCart={addToCart} setPage={setPage} setWizardGarment={setWizardGarment} />}
      {page === "product" && <ProductDetail product={selectedProduct} addToCart={addToCart} setPage={setPage} />}
      {page === "custom" && <CustomOrderWizard initialGarment={wizardGarment} setPage={setPage} />}
      {page === "how" && <SimplePage title="How It Works"><HowItWorks /></SimplePage>}
      {page === "reviews" && <ReviewsSection setPage={setPage} />}
      {page === "contact" && <SimplePage title="Contact Us"><p style={{ fontFamily: "'Manrope', sans-serif", color: "var(--text-muted)", lineHeight: 1.8 }}>Reach us on WhatsApp for the fastest response, or use the details below.</p><div style={{ marginTop: 16 }}><Button variant="whatsapp" onClick={() => window.open(waLink("Assalam-o-Alaikum Khan Stitching Co."), "_blank")}>Chat on WhatsApp</Button></div></SimplePage>}
      {page === "cart" && <Cart cart={cart} updateQty={updateQty} removeItem={removeItem} setPage={setPage} />}
      {page === "checkout" && <Checkout cart={cart} setPage={setPage} placeOrder={placeOrder} />}
      {page === "confirmation" && <Confirmation order={lastOrder} setPage={setPage} />}
      {page === "track" && <TrackOrder />}
      <Footer setPage={setPage} />
      <FloatingWhatsApp />
      <MobileBottomNav page={page} setPage={setPage} cartCount={cartCount} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Campaign = {
  id: number;
  title: string;
  description: string;
  images: string;
  originalPrice: string;
  salePrice: string;
  whatsappMessage: string;
  isOutOfStock: boolean;
  expiresAt: string | null;
  isActive: boolean;
};

function WaIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current shrink-0 ${className}`} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function SavingsPercent({ original, sale }: { original: string; sale: string }) {
  const parse = (s: string) => parseFloat(s.replace(/[^\d.]/g, ""));
  const o = parse(original);
  const s = parse(sale);
  if (!o || !s || o <= s) return null;
  const pct = Math.round(((o - s) / o) * 100);
  return (
    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-[#F5A623] text-[#F5A623] shrink-0">
      <span className="text-xs font-bold leading-none">חסכת</span>
      <span className="text-xl font-black leading-none">{pct}%</span>
    </div>
  );
}

export default function CampaignClient({ campaign }: { campaign: Campaign }) {
  const [currentImg, setCurrentImg] = useState(0);
  const images: string[] = JSON.parse(campaign.images || "[]");
  const isExpired = campaign.expiresAt ? new Date(campaign.expiresAt) < new Date() : false;

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t") ?? undefined;
    fetch("/api/campaign/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => {});
  }, []);

  const waUrl = `https://wa.me/972549603444?text=${encodeURIComponent(
    `${campaign.whatsappMessage}\n\n🔗 ${typeof window !== "undefined" ? window.location.href : ""}`
  )}`;

  return (
    <div
      dir="rtl"
      className="min-h-screen font-[Rubik,sans-serif] relative"
      style={{ background: "linear-gradient(160deg, #0b1628 0%, #1a1a1a 60%, #0f0f0f 100%)" }}
    >
      {/* Expired watermark */}
      {isExpired && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative z-10 rotate-[-30deg] border-4 border-red-500/80 px-10 py-5 rounded-2xl"
            style={{ backdropFilter: "blur(2px)" }}
          >
            <span className="text-4xl sm:text-6xl font-black text-red-500/90 tracking-widest uppercase whitespace-nowrap"
              style={{ textShadow: "0 0 30px rgba(239,68,68,0.5)" }}>
              מבצע הסתיים
            </span>
          </div>
        </div>
      )}

      {/* Ambient glow behind image */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)", filter: "blur(40px)" }}
      />

      <div className="max-w-md mx-auto px-5 pt-8 pb-32">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="רהיטי עוצמה"
            width={160}
            height={68}
            className="h-14 w-auto object-contain brightness-0 invert"
            priority
          />
        </div>

        {/* Campaign badge */}
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white"
            style={{ background: "linear-gradient(90deg, #F5A623, #e8920a)", boxShadow: "0 4px 20px rgba(245,166,35,0.4)" }}
          >
            <span>🔥</span>
            <span className="tracking-wider uppercase">מבצע מיוחד</span>
          </div>
        </div>

        {/* Product title */}
        <h1
          className="text-center text-4xl sm:text-5xl font-black text-white leading-tight mb-6"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
        >
          {campaign.title}
        </h1>

        {/* Product image */}
        {images.length > 0 && (
          <div className="relative mb-6">
            <div
              className="relative aspect-square w-full max-w-sm mx-auto rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                boxShadow: "0 0 60px rgba(245,166,35,0.25), 0 0 0 1px rgba(245,166,35,0.1)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Image
                src={images[currentImg]}
                alt={campaign.title}
                fill
                className="object-contain p-6"
                sizes="(max-width: 512px) 100vw, 384px"
                priority
                style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))" }}
              />

              {/* Gallery nav */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImg(p => (p - 1 + images.length) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold transition"
                    style={{ background: "rgba(245,166,35,0.25)", backdropFilter: "blur(8px)" }}
                  >›</button>
                  <button
                    onClick={() => setCurrentImg(p => (p + 1) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold transition"
                    style={{ background: "rgba(245,166,35,0.25)", backdropFilter: "blur(8px)" }}
                  >‹</button>
                </>
              )}
            </div>

            {/* Dots */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === currentImg ? "24px" : "6px",
                      background: i === currentImg ? "#F5A623" : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {campaign.description && (
          <p className="text-center text-[#94a3b8] text-base leading-relaxed mb-6 px-2">
            {campaign.description}
          </p>
        )}

        {/* Orange divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #F5A623)" }} />
          <span className="text-[#F5A623] text-xs font-bold tracking-widest uppercase">המחיר</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #F5A623, transparent)" }} />
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-[#64748b] text-xs mb-1">מחיר מקורי</div>
            <div className="text-[#64748b] text-2xl font-semibold line-through">{campaign.originalPrice}</div>
          </div>

          <div className="text-[#F5A623] text-3xl">←</div>

          <div className="text-center">
            <div className="text-[#F5A623] text-xs font-bold mb-1 tracking-wider">מחיר מבצע</div>
            <div
              className="font-black leading-none"
              style={{ fontSize: "3.5rem", color: "#F5A623", textShadow: "0 0 30px rgba(245,166,35,0.4)" }}
            >
              {campaign.salePrice}
            </div>
          </div>

          <SavingsPercent original={campaign.originalPrice} sale={campaign.salePrice} />
        </div>

      </div>

      {/* Sticky CTA bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3"
        style={{ background: "linear-gradient(to top, #0f0f0f 60%, transparent)" }}
      >
        <div className="max-w-md mx-auto">
          {campaign.isOutOfStock ? (
            <button
              disabled
              className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.06)", color: "#64748b", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              אזל מהמלאי
            </button>
          ) : (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition active:scale-95"
              style={{
                background: "linear-gradient(135deg, #25D366, #1ebe5d)",
                color: "white",
                boxShadow: "0 8px 32px rgba(37,211,102,0.4), 0 0 0 1px rgba(37,211,102,0.2)",
              }}
            >
              <WaIcon className="w-7 h-7" />
              צור קשר עכשיו
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

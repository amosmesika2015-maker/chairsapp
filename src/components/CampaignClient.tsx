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

function WaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current shrink-0 ${className}`} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PriceDisplay({ original, sale }: { original: string; sale: string }) {
  const parse = (s: string) => parseFloat(s.replace(/[^\d.]/g, ""));
  const o = parse(original);
  const sv = parse(sale);
  const pct = o && sv && o > sv ? Math.round(((o - sv) / o) * 100) : null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.05)" }}
    >
      {/* Original price row */}
      <div
        className="flex items-center justify-center gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}
      >
        <span className="text-gray-400 text-sm">מחיר מקורי:</span>
        <span className="text-gray-400 text-base line-through font-light">{original}</span>
        <span className="text-gray-400 text-xs">ש&quot;ח</span>
      </div>

      {/* Sale price row */}
      <div className="flex items-center justify-between px-5 py-4 gap-3">
        <div>
          <div className="text-xs font-semibold mb-1 tracking-widest" style={{ color: "#C9A84C" }}>
            מחיר מבצע
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-gray-900 leading-none">{sale}</span>
            <span className="text-sm font-medium text-gray-500 leading-tight">
              ש&quot;ח<br />+ מע&quot;מ
            </span>
          </div>
        </div>

        {pct && (
          <div
            className="flex flex-col items-center justify-center rounded-2xl shrink-0"
            style={{
              width: "72px",
              height: "72px",
              background: "linear-gradient(135deg, #C9A84C, #e8c96a)",
              boxShadow: "0 4px 14px rgba(201,168,76,0.35)",
            }}
          >
            <div className="text-white text-xs font-bold">חסכת</div>
            <div className="text-white text-2xl font-black leading-none">{pct}%</div>
          </div>
        )}
      </div>
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
    <div dir="rtl" className="min-h-screen font-[Rubik,sans-serif] relative" style={{ background: "#F0EDE8" }}>

      {/* Expired overlay */}
      {isExpired && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rotate-[-8deg] px-10 py-5 rounded-2xl border-2 text-center"
              style={{ borderColor: "#C9A84C", background: "rgba(255,255,255,0.95)" }}
            >
              <div className="text-3xl sm:text-5xl font-black text-gray-800 tracking-wide">המבצע הסתיים</div>
              <div className="text-sm text-gray-400 mt-1 tracking-widest">OFFER ENDED</div>
            </div>
          </div>
        </div>
      )}

      {/* Card with border frame */}
      <div className="max-w-md mx-auto" style={{ padding: "12px", paddingBottom: "120px" }}>
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "#FAF8F4",
            border: "1.5px solid rgba(201,168,76,0.4)",
            boxShadow: "0 2px 24px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(255,255,255,0.6)",
          }}
        >
          {/* Logo */}
          <div className="flex justify-center pt-8 pb-4 px-6">
            <Image
              src="/logo.png"
              alt="רהיטי עוצמה"
              width={280}
              height={112}
              className="h-24 w-auto object-contain"
              priority
            />
          </div>

          {/* Product image — hero */}
          {images.length > 0 && (
            <div className="relative" style={{ background: "#FAF8F4" }}>

              {/* Circular badge מבצע החודש */}
              <div
                className="absolute top-3 right-3 z-10 flex flex-col items-center justify-center text-center select-none"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "2.5px solid #C9A84C",
                  background: "white",
                  color: "#1a1a1a",
                  transform: "rotate(12deg)",
                  boxShadow: "0 2px 12px rgba(201,168,76,0.25)",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 900, lineHeight: 1.2 }}>מבצע</div>
                <div style={{ fontSize: "16px", fontWeight: 900, lineHeight: 1.2 }}>החודש</div>
              </div>

              <div className="relative w-full" style={{ height: "62vw", maxHeight: "400px", minHeight: "260px" }}>
                <Image
                  src={images[currentImg]}
                  alt={campaign.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 512px) 100vw, 448px"
                  priority
                />
              </div>

              {/* Gallery nav dots */}
              {images.length > 1 && (
                <div className="flex justify-center gap-2 pb-3 pt-1">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImg(i)}
                      className="h-1 rounded-full transition-all"
                      style={{
                        width: i === currentImg ? "28px" : "8px",
                        background: i === currentImg ? "#C9A84C" : "#d1d5db",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gold divider */}
          <div className="mx-6 my-5">
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
          </div>

          {/* Text content */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-3 text-center">
              {campaign.title}
            </h1>

            {campaign.description && (
              <p className="text-gray-500 text-sm leading-relaxed text-center mb-6 max-w-xs mx-auto">
                {campaign.description}
              </p>
            )}

            <div className="mb-2">
              <PriceDisplay original={campaign.originalPrice} sale={campaign.salePrice} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-5 pt-4"
        style={{ background: "linear-gradient(to top, #F0EDE8 65%, transparent)" }}
      >
        <div className="max-w-md mx-auto">
          {campaign.isOutOfStock ? (
            <button
              disabled
              className="w-full py-4 rounded-2xl font-semibold text-base text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "#e5e7eb" }}
            >
              אזל מהמלאי
            </button>
          ) : (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2.5 transition active:scale-95"
              style={{
                background: "#25D366",
                boxShadow: "0 8px 24px rgba(37,211,102,0.3)",
              }}
            >
              <WaIcon className="w-6 h-6" />
              צור קשר עכשיו
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

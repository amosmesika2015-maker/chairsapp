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

  const waMessage = encodeURIComponent(
    `${campaign.whatsappMessage}\n\n${window !== undefined ? window.location.href : ""}`
  );
  const waUrl = `https://wa.me/972549603444?text=${waMessage}`;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-[Rubik,sans-serif]">
      {/* Expired overlay */}
      {isExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="relative z-10 text-center select-none">
            <div
              className="text-4xl sm:text-6xl font-black text-white/90 tracking-widest uppercase rotate-[-20deg] border-4 border-white/70 px-8 py-4 rounded-xl"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
            >
              מבצע זה הסתיים
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-3 tracking-wider uppercase">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            מבצע מיוחד
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">{campaign.title}</h1>
        </div>

        {/* Gallery */}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl bg-white">
              <Image
                src={images[currentImg]}
                alt={campaign.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 512px) 100vw, 512px"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImg((p) => (p - 1 + images.length) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full w-9 h-9 flex items-center justify-center shadow-lg text-slate-600 hover:bg-white transition"
                    aria-label="תמונה קודמת"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setCurrentImg((p) => (p + 1) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full w-9 h-9 flex items-center justify-center shadow-lg text-slate-600 hover:bg-white transition"
                    aria-label="תמונה הבאה"
                  >
                    ‹
                  </button>
                </>
              )}
            </div>
            {/* Dots */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? "bg-blue-600 w-5" : "bg-slate-300"}`}
                    aria-label={`תמונה ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Product Info Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
          {campaign.description && (
            <p className="text-slate-600 text-sm leading-relaxed mb-5">{campaign.description}</p>
          )}

          {/* Pricing */}
          <div className="flex items-center gap-4 mb-6">
            <div>
              <div className="text-xs text-slate-400 mb-0.5">מחיר מקורי</div>
              <div className="text-lg text-slate-400 line-through font-medium">{campaign.originalPrice}</div>
            </div>
            <div className="text-2xl text-slate-300">←</div>
            <div>
              <div className="text-xs text-blue-600 font-bold mb-0.5">מחיר מבצע</div>
              <div className="text-3xl font-black text-blue-600">{campaign.salePrice}</div>
            </div>
            <div className="mr-auto">
              <SavingsBadge original={campaign.originalPrice} sale={campaign.salePrice} />
            </div>
          </div>

          {/* CTA Button */}
          {campaign.isOutOfStock ? (
            <button
              disabled
              className="w-full py-4 rounded-2xl bg-red-100 text-red-500 font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              אזל מהמלאי
            </button>
          ) : (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-lg flex items-center justify-center gap-2 transition shadow-lg shadow-green-200 active:scale-95"
            >
              <WaIcon className="w-6 h-6" />
              צור קשר בוואטסאפ
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 mt-6">
          מבצע זה בתוקף עד למוצא המלאי
        </div>
      </div>
    </div>
  );
}

function SavingsBadge({ original, sale }: { original: string; sale: string }) {
  const parsePrice = (s: string) => {
    const n = parseFloat(s.replace(/[^\d.]/g, ""));
    return isNaN(n) ? null : n;
  };
  const o = parsePrice(original);
  const s = parsePrice(sale);
  if (!o || !s || o <= s) return null;
  const pct = Math.round(((o - s) / o) * 100);
  return (
    <div className="bg-red-500 text-white text-xs font-black px-2.5 py-1.5 rounded-xl text-center">
      <div>חסכת</div>
      <div className="text-lg leading-none">{pct}%</div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/* ─────────────────────────── constants ─────────────────────────── */
const WA_NUMBER = "972549603444";
const WA_BASE   = `https://wa.me/${WA_NUMBER}`;
const waLink    = (msg?: string) => msg ? `${WA_BASE}?text=${encodeURIComponent(msg)}` : WA_BASE;

/* ─────────────────────────── types ─────────────────────────────── */
type Chair = {
  id: string; name: string; price: string;
  imageUrl: string; description: string; details: string;
  status: string;
};

const STATUS_BADGE: Record<string, { color: string; label: string }> = {
  out:  { color: "bg-red-500",    label: "אזל מהמלאי" },
  last: { color: "bg-blue-500",   label: "יחידות אחרונות" },
  new:  { color: "bg-yellow-400", label: "חדש" },
};

/* ─────────────────────────── shared SVGs ───────────────────────── */
function WaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current shrink-0 ${className}`} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─────────────────────────── helpers ───────────────────────────── */
function trackInquiry(chairId: string) {
  const token = new URLSearchParams(window.location.search).get("t") ?? undefined;
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "inquiry", chairId, token }),
  }).catch(() => {});
}

/* ─────────────────────────── Modal ─────────────────────────────── */
function ChairModal({ chair, onClose, dealerMode }: { chair: Chair; onClose: () => void; dealerMode: boolean }) {
  useEffect(() => {
    history.pushState({ modalOpen: true }, '');
    let closedByBack = false;

    const handlePop = () => { closedByBack = true; onClose(); };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };

    window.addEventListener('popstate', handlePop);
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener('popstate', handlePop);
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      if (!closedByBack && history.state?.modalOpen) history.back();
    };
  }, [onClose]);

  const detailLines = chair.details
    ? chair.details.split("\n").filter(Boolean)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm anim-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[88vh] sm:rounded-3xl overflow-hidden shadow-[0_32px_80px_-8px_rgba(0,0,0,.45)] anim-slideBottom flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">פרטי הדגם</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xl leading-none transition-colors"
            aria-label="סגור"
          >×</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Two-col on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Image panel */}
            <div className="bg-slate-50 flex items-center justify-center p-8 min-h-[240px] sm:min-h-[360px] relative">
              {chair.status && STATUS_BADGE[chair.status] && (
                <div className={`absolute top-4 right-4 z-10 w-12 h-12 rounded-full ${STATUS_BADGE[chair.status].color} flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-[9px] font-bold text-center leading-tight px-1">
                    {STATUS_BADGE[chair.status].label}
                  </span>
                </div>
              )}
              <div className="relative w-full aspect-square max-w-[280px]">
                <Image
                  src={chair.imageUrl}
                  alt={chair.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 90vw, 280px"
                  unoptimized={chair.imageUrl.startsWith('data:')}
                />
              </div>
            </div>

            {/* Details panel */}
            <div className="p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{chair.name}</h2>
                {chair.description && (
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">{chair.description}</p>
                )}
              </div>

              {/* Price */}
              {!dealerMode && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 inline-flex items-end gap-2 w-fit">
                <span className="text-3xl font-black text-blue-700 leading-none">{chair.price}</span>
                <span className="text-xs text-blue-400 mb-0.5">ש״ח + מע״מ</span>
              </div>
              )}

              {/* Details list */}
              {detailLines.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <span className="text-base">📋</span> מפרט טכני
                  </h3>
                  <ul className="space-y-1.5">
                    {detailLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-blue-400 mt-0.5 shrink-0">✓</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col gap-2 mt-auto pt-2">
                <a
                  href={waLink(`שלום, אני מעוניין בדגם "${chair.name}". אשמח לקבל פרטים ומחיר.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackInquiry(chair.id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-colors text-sm"
                >
                  <WaIcon className="w-5 h-5" />
                  שאל על הדגם בוואטסאפ
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm"
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Chair Card ────────────────────────── */
function ChairCard({ chair, onClick, index, dealerMode }: { chair: Chair; onClick: () => void; index: number; dealerMode: boolean }) {
  return (
    <article
      className="bg-white rounded-2xl overflow-hidden shadow-sm card-lift anim-fadeUp border border-slate-100/80 flex flex-col"
      style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}
    >
      {/* Image */}
      <div className="relative bg-[#f8fafc] overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <Image
          src={chair.imageUrl}
          alt={chair.name}
          fill
          className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
          unoptimized={chair.imageUrl.startsWith('data:')}
        />
        {/* Status badge */}
        {chair.status && STATUS_BADGE[chair.status] && (
          <div className={`absolute top-3 right-3 z-10 w-24 h-24 rounded-full ${STATUS_BADGE[chair.status].color} flex items-center justify-center shadow-lg`}>
            <span className="text-black text-[22px] font-bold text-center leading-tight px-2 -rotate-12">
              {STATUS_BADGE[chair.status].label}
            </span>
          </div>
        )}
        {/* Price badge */}
        {!dealerMode && (
        <div className="absolute bottom-3 left-3 bg-white rounded-xl shadow-md px-3 py-1.5">
          <p className="text-blue-700 font-black text-lg leading-none">{chair.price}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">ש״ח + מע״מ</p>
        </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-lg leading-snug">{chair.name}</h3>
          {chair.description && (
            <p className="text-slate-400 text-sm mt-1 leading-relaxed line-clamp-2">{chair.description}</p>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClick}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            פרטים נוספים
          </button>
          <a
            href={waLink(`שלום, אני מעוניין בדגם "${chair.name}"`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.stopPropagation(); trackInquiry(chair.id); }}
            className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
          >
            <WaIcon className="w-4 h-4" />
            <span className="hidden sm:inline">שאל</span>
          </a>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────── Spotlight (1-2 products) ──────────── */
function SpotlightCard({ chair, onDetails, dealerMode }: { chair: Chair; onDetails: () => void; dealerMode: boolean }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 grid grid-cols-1 sm:grid-cols-2">
      <div className="bg-slate-50 flex items-center justify-center p-10 min-h-[260px] relative">
        {chair.status && STATUS_BADGE[chair.status] && (
          <div className={`absolute top-4 right-4 z-10 w-12 h-12 rounded-full ${STATUS_BADGE[chair.status].color} flex items-center justify-center shadow-lg`}>
            <span className="text-white text-[9px] font-bold text-center leading-tight px-1">
              {STATUS_BADGE[chair.status].label}
            </span>
          </div>
        )}
        <div className="relative w-full max-w-[280px] aspect-square">
          <Image src={chair.imageUrl} alt={chair.name} fill className="object-contain" sizes="280px" unoptimized={chair.imageUrl.startsWith('data:')} />
        </div>
      </div>
      <div className="p-8 flex flex-col justify-center gap-5">
        <div>
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">דגם מומלץ</span>
          <h3 className="text-2xl font-black text-slate-900">{chair.name}</h3>
          {chair.description && (
            <p className="text-slate-500 mt-2 leading-relaxed">{chair.description}</p>
          )}
        </div>
        {!dealerMode && (
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-blue-700">{chair.price}</span>
          <span className="text-sm text-slate-400 mb-1">ש״ח + מע״מ</span>
        </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDetails}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            פרטים נוספים
          </button>
          <a
            href={waLink(`שלום, אני מעוניין בדגם "${chair.name}". אשמח לקבל פרטים.`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackInquiry(chair.id)}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-5 rounded-xl transition-colors"
          >
            <WaIcon /> שאל בוואטסאפ
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Page ─────────────────────────── */
export default function CatalogClient({ chairs }: { chairs: Chair[] }) {
  const [selected, setSelected]     = useState<Chair | null>(null);
  const [search, setSearch]         = useState("");
  const [dealerMode, setDealerMode] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t") ?? undefined;
    fetch("/api/track", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({type:"view", token}) }).catch(()=>{});
  }, []);

  const handleClick = (chair: Chair) => {
    setSelected(chair);
    const token = new URLSearchParams(window.location.search).get("t") ?? undefined;
    fetch("/api/track", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({type:"click", chairId: chair.id, token}) }).catch(()=>{});
  };

  const filtered = chairs.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  const isSparse = chairs.length > 0 && chairs.length <= 2;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* ════════════════ NAVBAR ════════════════ */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-center">
          {/* Logo */}
          {!dealerMode && (
          <Image
            src="/logo.png"
            alt="רהיטי עוצמה"
            width={360}
            height={144}
            className="h-[88px] w-auto object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }}
          />
          )}
        </div>
      </header>

      {/* ════════════════ HERO ════════════════ */}
      <section className="hero-bg relative overflow-hidden">
        {/* Decorative ring */}
        <div className="absolute -left-32 -top-32 w-[600px] h-[600px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-[400px] h-[400px] rounded-full border border-white/5 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">

          {/* ── Text column (right in RTL) ── */}
          <div className="text-center lg:text-right order-2 lg:order-none anim-fadeUp">
            {!dealerMode && (
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-blue-300 text-xs sm:text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              רהיטי עוצמה - קטלוג כיסאות
            </div>
            )}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-4 text-balance">
              ריהוט משרדי<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-300 to-blue-500">
                ברמה אחרת
              </span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
              כיסאות ארגונומיים ומנהלים ברמה גבוהה. מחירי יבואן ישיר לדילרים, עסקים ומוסדות.
            </p>
          </div>

          {/* ── Image / decorative column (left in RTL) ── */}
          <div className="order-1 lg:order-none flex justify-center anim-fadeUp" style={{ animationDelay: "120ms" }}>
            {chairs.length > 0 ? (
              <div className="relative">
                {/* Glow behind image */}
                <div className="absolute inset-8 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
                <div className="relative glass rounded-3xl p-5 w-[180px] sm:w-[220px] aspect-square flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={chairs[0].imageUrl}
                      alt={chairs[0].name}
                      fill
                      className="object-contain drop-shadow-2xl"
                      sizes="220px"
                      unoptimized={chairs[0].imageUrl.startsWith('data:')}
                    />
                  </div>

                </div>
              </div>
            ) : (
              <div className="glass rounded-3xl w-[180px] h-[180px] flex items-center justify-center">
                <span className="text-8xl opacity-25 select-none">🪑</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════ CATALOG ════════════════ */}
      <section id="catalog" className="max-w-6xl mx-auto px-4 py-14">

        {/* Section heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">הקטלוג שלנו</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">דגמי הכיסאות</h2>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="חפש דגם..."
              className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* States */}
        {chairs.length === 0 ? (
          /* Empty */
          <div className="text-center py-24">
            <p className="text-6xl mb-5">🪑</p>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">הקטלוג יתעדכן בקרוב</h2>
            <p className="text-slate-400 mb-8">בינתיים ניתן ליצור קשר ישירות</p>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-7 py-3.5 rounded-xl font-bold transition-colors"
            >
              <WaIcon /> שלחו הודעה
            </a>
          </div>
        ) : filtered.length === 0 ? (
          /* No results */
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg">לא נמצאו דגמים עבור &quot;{search}&quot;</p>
          </div>
        ) : isSparse ? (
          /* ── Spotlight layout for 1-2 products ── */
          <div className="space-y-8">
            {filtered.map(chair => (
              <SpotlightCard key={chair.id} chair={chair} onDetails={() => handleClick(chair)} dealerMode={dealerMode} />
            ))}
          </div>
        ) : (
          /* ── Normal grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((chair, i) => (
              <ChairCard key={chair.id} chair={chair} index={i} onClick={() => handleClick(chair)} dealerMode={dealerMode} />
            ))}
          </div>
        )}

        {chairs.length > 0 && (
          <p className="text-center text-slate-400 text-xs mt-8">
            {filtered.length} מתוך {chairs.length} דגמים
          </p>
        )}
      </section>

      {/* ════════════════ TRUST / BENEFITS ════════════════ */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: "🛡️", title: "אחריות ושירות", text: "גיבוי מלא לאחר הקנייה" },
              { icon: "💰", title: "מחירי יבואן", text: "ישירות ללא מתווכים" },
              { icon: "🚀", title: "אספקה מהירה",   text: "זמינות מלאי בישראל" },
              { icon: "💬", title: "ייעוץ אישי",    text: "מומחים עומדים לרשותכם" },
            ].map((b, i) => (
              <div
                key={b.title}
                className="flex flex-col items-center text-center gap-2 p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors anim-fadeUp"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl mb-1">
                  {b.icon}
                </div>
                <p className="font-bold text-slate-900 text-sm sm:text-base">{b.title}</p>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ BOTTOM CTA ════════════════ */}
      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="bg-[#060d1a] text-slate-500 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">
          {!dealerMode && (
          <Image
            src="/logo.png"
            alt="רהיטי עוצמה"
            width={140}
            height={56}
            className="h-10 w-auto object-contain brightness-0 invert opacity-50"
          />
          )}
          <p className="text-sm">ריהוט משרדי בהתאמה לעסקים, מוסדות ודילרים</p>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} רהיטי עוצמה — כל הזכויות שמורות</p>
        </div>
      </footer>

      {/* ════════════════ DEALER MODE BUTTON ════════════════ */}
      <button
        onClick={() => setDealerMode(d => !d)}
        className={`fixed bottom-24 left-5 z-40 px-4 py-2.5 rounded-full shadow-xl text-sm font-bold transition-all ${
          dealerMode
            ? "bg-amber-400 text-white shadow-amber-200"
            : "bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:text-amber-600"
        }`}
      >
        {dealerMode ? "🔒 מצב סוכן פעיל" : "🏷️ מצב סוכן"}
      </button>

      {/* ════════════════ FLOATING WA ════════════════ */}
      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-5 left-5 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-transform hover:scale-110 anim-waPulse"
      >
        <WaIcon className="w-7 h-7" />
      </a>

      {/* ════════════════ MODAL ════════════════ */}
      {selected && <ChairModal chair={selected} onClose={() => setSelected(null)} dealerMode={dealerMode} />}
    </div>
  );
}

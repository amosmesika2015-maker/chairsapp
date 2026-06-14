"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Chair = {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  description: string;
  details: string;
  order: number;
  isVisible: boolean;
  status: string;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
};

type CampaignStat = {
  token: string;
  sentAt: string;
  customerId: number;
  customerName: string;
  phone: string;
  opened: boolean;
  firstOpenedAt: string | null;
  chairsViewedCount: number;
};

type Analytics = {
  viewsWeek: number;
  viewsMonth: number;
  totalViews: number;
  topChairs: { chairId: string; name: string; clicks: number }[];
  campaignStats: CampaignStat[];
  totalSent: number;
  totalOpened: number;
};

type SendResult = {
  customerId: number;
  customerName: string;
  phone: string;
  token: string;
  catalogUrl: string;
  whatsappUrl: string;
};

const STATUS_BADGE: Record<string, { color: string; label: string }> = {
  out:  { color: "bg-red-500",    label: "אזל מהמלאי" },
  last: { color: "bg-blue-500",   label: "יחידות אחרונות" },
  new:  { color: "bg-yellow-400", label: "חדש" },
};

// ─── SortableChairCard ───────────────────────────────────────────────────────

function SortableChairCard({
  chair,
  onEdit,
  onDelete,
  onToggleVisible,
}: {
  chair: Chair;
  onEdit: (chair: Chair) => void;
  onDelete: (id: string) => void;
  onToggleVisible: (id: string, visible: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: chair.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border ${
        chair.isVisible ? "border-gray-100" : "border-dashed border-gray-300 opacity-60"
      } shadow-sm overflow-hidden flex flex-col`}
    >
      <div
        className="relative aspect-square bg-gray-50 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <Image
          src={chair.imageUrl}
          alt={chair.name}
          fill
          className="object-contain p-3"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        <div className="absolute top-2 right-2 bg-white/80 rounded-lg p-1 text-gray-400 text-xs">⠿</div>
        {chair.status && STATUS_BADGE[chair.status] && (
          <div className={`absolute top-2 left-2 z-10 w-12 h-12 rounded-full ${STATUS_BADGE[chair.status].color} flex items-center justify-center shadow-md`}>
            <span className="text-black text-[9px] font-bold text-center leading-tight px-1 -rotate-12">
              {STATUS_BADGE[chair.status].label}
            </span>
          </div>
        )}
        {!chair.isVisible && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-lg">מוסתר</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm line-clamp-1">{chair.name}</p>
          <p className="text-blue-700 font-bold text-sm">{chair.price}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(chair)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg transition-colors">
            עריכה
          </button>
          <button onClick={() => onToggleVisible(chair.id, !chair.isVisible)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg transition-colors">
            {chair.isVisible ? "הסתר" : "הצג"}
          </button>
          <button onClick={() => onDelete(chair.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors">
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ChairForm ───────────────────────────────────────────────────────────────

function ChairForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Chair;
  onSave: (data: Partial<Chair>) => Promise<void>;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    price: initial?.price ?? "",
    description: initial?.description ?? "",
    details: initial?.details ?? "",
    imageUrl: initial?.imageUrl ?? "",
    status: initial?.status ?? "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!isEdit || !form.imageUrl) { mountedRef.current = true; return; }
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      await onSave(form);
      setSaving(false);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    }, 1200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("שגיאה בהעלאה");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "שגיאה בהעלאת התמונה");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) await uploadFile(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            {initial ? "עריכת כיסא" : "הוספת כיסא חדש"}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תמונה</label>
              <div
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <p className="text-blue-500 text-sm py-4">מעלה תמונה...</p>
                ) : form.imageUrl ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <Image src={form.imageUrl} alt="preview" fill className="object-contain rounded-xl" />
                  </div>
                ) : (
                  <div className="py-6">
                    <p className="text-3xl mb-2">📷</p>
                    <p className="text-gray-500 text-sm">גרור תמונה לכאן או לחץ לבחירה</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
              </div>
            </div>

            {[
              { key: "name", label: "שם הכיסא", placeholder: "כיסא מנהלים דגם X" },
              { key: "price", label: "מחיר", placeholder: "₪1,200 | לפי בקשה" },
              { key: "description", label: "תיאור קצר (על הכרטיס)", placeholder: "כיסא ארגונומי..." },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                  required={key !== "description"}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס מלאי</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— ללא סטטוס —</option>
                <option value="out">אזל מהמלאי</option>
                <option value="last">יחידות אחרונות</option>
                <option value="new">חדש</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                פרטים נוספים (בחלון &quot;פרטים נוספים&quot;)
              </label>
              <textarea
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                placeholder={"חומר: עור PU\nגובה מתכוון: כן\nמשקל מקסימלי: 120 ק\"ג\nאחריות: שנה"}
              />
            </div>

            <div className="flex gap-3 pt-2 items-center">
              {isEdit ? (
                <span className={`flex-1 text-center text-sm font-medium transition-colors ${saving ? "text-blue-500" : savedOk ? "text-green-600" : "text-gray-400"}`}>
                  {saving ? "שומר..." : savedOk ? "✓ נשמר" : "שינויים נשמרים אוטומטית"}
                </span>
              ) : (
                <button
                  type="submit"
                  disabled={saving || uploading || !form.imageUrl}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
                >
                  {saving ? "שומר..." : "הוסף לקטלוג"}
                </button>
              )}
              <button type="button" onClick={onCancel} className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                {isEdit ? "סגור" : "ביטול"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── ErrorDialog ─────────────────────────────────────────────────────────────

function ErrorDialog({ message, onClose }: { message: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(message).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl">
          <span className="font-bold text-red-700 text-sm">שגיאה בשמירה</span>
          <button onClick={copy} className="text-xs bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg font-medium transition-colors">
            {copied ? "✓ הועתק" : "העתק"}
          </button>
        </div>
        <div className="px-5 py-4 max-h-60 overflow-y-auto">
          <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words font-mono">{message}</pre>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="bg-slate-800 text-white text-sm px-5 py-2 rounded-xl hover:bg-slate-700 transition-colors">סגור</button>
        </div>
      </div>
    </div>
  );
}

// ─── CustomerForm ─────────────────────────────────────────────────────────────

function CustomerForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Customer;
  onSave: (name: string, phone: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(name, phone);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            {initial ? "עריכת לקוח" : "הוספת לקוח חדש"}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="דוד לוי"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מספר וואטסאפ</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="972501234567"
                required
                dir="ltr"
              />
              <p className="text-xs text-gray-400 mt-1">ללא + ורווחים — לדוגמה: 972501234567</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
              >
                {saving ? "שומר..." : initial ? "עדכן" : "הוסף לקוח"}
              </button>
              <button type="button" onClick={onCancel} className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                ביטול
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── SendPanel ────────────────────────────────────────────────────────────────

function SendPanel({ results, onClose }: { results: SendResult[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">שלח קטלוג ללקוחות</h2>
              <p className="text-sm text-gray-500">{results.length} קישורים מוכנים</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          <div className="space-y-3">
            {results.map((r) => (
              <div key={r.token} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{r.customerName}</p>
                  <p className="text-xs text-gray-400 font-mono" dir="ltr">{r.phone}</p>
                  <p className="text-xs text-blue-500 mt-1 truncate" dir="ltr">{r.catalogUrl}</p>
                </div>
                <a
                  href={r.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1"
                >
                  <span>📱</span> שלח
                </a>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            לחץ על &quot;שלח&quot; כדי לפתוח שיחת וואטסאפ עם כל לקוח
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── BulkImportPanel ─────────────────────────────────────────────────────────

function BulkImportPanel({
  onDone,
  onCancel,
}: {
  onDone: (customers: { id: number; name: string; phone: string; createdAt: string }[]) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; failed: number } | null>(null);

  const preview = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Split by comma, pipe, tab, or last space before phone-like token
      const parts = line.split(/[,|	]/).map((s) => s.trim());
      if (parts.length >= 2) {
        const phone = parts[parts.length - 1].replace(/[\s\-()]/g, "");
        const name = parts.slice(0, parts.length - 1).join(" ");
        return { name, phone, valid: /^\d{7,}$/.test(phone) };
      }
      // Try split by last whitespace group before digits
      const m = line.match(/^(.+?)\s+([\d\s\-+()]{7,})$/);
      if (m) {
        const phone = m[2].replace(/[\s\-()]/g, "");
        return { name: m[1].trim(), phone, valid: /^\d{7,}$/.test(phone) };
      }
      return { name: line, phone: "", valid: false };
    });

  const validRows = preview.filter((r) => r.valid);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    const res = await fetch("/api/customers/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customers: validRows.map(({ name, phone }) => ({ name, phone })) }),
    });
    const data = await res.json();
    setResult({ created: data.created, failed: data.failed });
    setImporting(false);
    if (data.customers?.length > 0) onDone(data.customers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">ייבוא לקוחות בכמות</h2>
          <p className="text-sm text-gray-500 mt-1">הדבק רשימה — שם ומספר טלפון בכל שורה</p>
        </div>

        <div className="p-6 flex flex-col gap-4 flex-1 overflow-auto">
          {!result ? (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`דוגמאות:\nדוד לוי, 0501234567\nרחל כהן | 0529876543\nמשה מזרחי 0541112233`}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-none font-mono"
                dir="rtl"
              />

              {preview.length > 0 && (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 border-b border-gray-100">
                    תצוגה מקדימה — {validRows.length} תקינים מתוך {preview.length}
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                    {preview.map((row, i) => (
                      <div key={i} className={`flex items-center gap-3 px-4 py-2 text-sm ${row.valid ? "" : "bg-red-50"}`}>
                        <span className={row.valid ? "text-green-500" : "text-red-400"}>
                          {row.valid ? "✓" : "✗"}
                        </span>
                        <span className="flex-1 font-medium text-gray-900">{row.name || "—"}</span>
                        <span className="font-mono text-gray-500 text-xs" dir="ltr">{row.phone || "לא זוהה"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-5xl mb-4">✅</p>
              <p className="text-xl font-bold text-gray-900">
                יובאו {result.created} לקוחות בהצלחה
              </p>
              {result.failed > 0 && (
                <p className="text-sm text-red-500 mt-1">{result.failed} שגיאות (ייתכן כפילויות)</p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          {!result ? (
            <>
              <button
                onClick={handleImport}
                disabled={importing || validRows.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
              >
                {importing ? "מייבא..." : `ייבא ${validRows.length} לקוחות`}
              </button>
              <button
                onClick={onCancel}
                className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                ביטול
              </button>
            </>
          ) : (
            <button
              onClick={onCancel}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm"
            >
              סגור
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AdminClient ──────────────────────────────────────────────────────────────

export default function AdminClient({
  chairs: initialChairs,
  analytics: initialAnalytics,
  customers: initialCustomers,
}: {
  chairs: Chair[];
  analytics: Analytics;
  customers: Customer[];
}) {
  const [activeTab, setActiveTab] = useState<"products" | "customers" | "dashboard" | "report">("dashboard");

  // Products state
  const [chairs, setChairs] = useState(initialChairs);
  const [showForm, setShowForm] = useState(false);
  const [editingChair, setEditingChair] = useState<Chair | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Customers state
  const [customers, setCustomers] = useState(initialCustomers);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[] | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState(initialAnalytics);

  // Report tab state
  const [reportFilter, setReportFilter] = useState<"all" | "opened" | "not_opened">("all");
  const [reportSearch, setReportSearch] = useState("");

  const refreshAnalytics = useCallback(async () => {
    const res = await fetch("/api/analytics");
    if (res.ok) setAnalytics(await res.json());
  }, []);

  // Refresh analytics when switching to dashboard or report
  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "report") refreshAnalytics();
  }, [activeTab, refreshAnalytics]);

  // ── DnD sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Chair handlers ──
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = chairs.findIndex((c) => c.id === active.id);
    const newIndex = chairs.findIndex((c) => c.id === over.id);
    const newChairs = arrayMove(chairs, oldIndex, newIndex);
    setChairs(newChairs);
    await fetch("/api/chairs/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newChairs.map((c) => c.id) }),
    });
  };

  const handleAdd = async (data: Partial<Chair>) => {
    const res = await fetch("/api/chairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const newChair = await res.json();
    setChairs((prev) => [...prev, newChair]);
    setShowForm(false);
  };

  const handleEdit = async (data: Partial<Chair>) => {
    if (!editingChair) return;
    const res = await fetch(`/api/chairs/${editingChair.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setErrorMsg(err.error ?? `HTTP ${res.status}`);
      return;
    }
    const updated = await res.json();
    setChairs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDelete = async (id: string) => {
    const code = window.prompt("להשלמת המחיקה הזן את קוד המנהל:");
    if (code !== "admin132") return;
    await fetch(`/api/chairs/${id}`, { method: "DELETE" });
    setChairs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleVisible = async (id: string, isVisible: boolean) => {
    await fetch(`/api/chairs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible }),
    });
    setChairs((prev) => prev.map((c) => (c.id === id ? { ...c, isVisible } : c)));
  };

  // ── Customer handlers ──
  const handleAddCustomer = async (name: string, phone: string) => {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setErrorMsg(err.error ?? `שגיאה בשמירה (${res.status}) — נסה שוב`);
      return;
    }
    const customer = await res.json();
    setCustomers((prev) => [customer, ...prev]);
    setShowCustomerForm(false);
  };

  const handleEditCustomer = async (name: string, phone: string) => {
    if (!editingCustomer) return;
    const res = await fetch(`/api/customers/${editingCustomer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    const updated = await res.json();
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm("למחוק את הלקוח?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); } else { s.add(id); }
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === customers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(customers.map((c) => c.id)));
    }
  };

  const handleSendCatalog = async () => {
    if (selectedIds.size === 0) return;
    setSending(true);
    const res = await fetch("/api/campaigns/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerIds: Array.from(selectedIds),
        baseUrl: window.location.origin,
      }),
    });
    const results = await res.json();
    setSendResults(results);
    setSelectedIds(new Set());
    setSending(false);
  };

  const tabs = [
    { key: "dashboard" as const, label: "דשבורד", icon: "📊" },
    { key: "products" as const, label: "מוצרים", icon: "🪑" },
    { key: "customers" as const, label: "לקוחות", icon: "👥" },
    { key: "report" as const, label: "דוח שליחה", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {errorMsg && <ErrorDialog message={errorMsg} onClose={() => setErrorMsg(null)} />}
      {showForm && <ChairForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}
      {editingChair && <ChairForm initial={editingChair} onSave={(data) => handleEdit(data)} onCancel={() => setEditingChair(null)} />}
      {showCustomerForm && <CustomerForm onSave={handleAddCustomer} onCancel={() => setShowCustomerForm(false)} />}
      {editingCustomer && <CustomerForm initial={editingCustomer} onSave={handleEditCustomer} onCancel={() => setEditingCustomer(null)} />}
      {sendResults && <SendPanel results={sendResults} onClose={() => setSendResults(null)} />}
      {showBulkImport && (
        <BulkImportPanel
          onDone={(newCustomers) => {
            setCustomers((prev) => [...newCustomers.map(c => ({ ...c, createdAt: c.createdAt })), ...prev]);
            setShowBulkImport(false);
          }}
          onCancel={() => setShowBulkImport(false)}
        />
      )}

      {/* Sidebar — right */}
      <aside className="w-52 shrink-0 bg-white border-l border-gray-100 shadow-sm flex flex-col min-h-screen">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">ניהול קטלוג</h1>
          <p className="text-xs text-gray-400 mt-0.5">{chairs.length} כיסאות · {customers.length} לקוחות</p>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-right w-full transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
          <a href="/" target="_blank" className="text-xs text-blue-600 hover:underline text-center">צפה בקטלוג ↗</a>
          <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="text-xs text-gray-400 hover:text-gray-600 text-center">יציאה</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">

        {/* ── TAB: PRODUCTS ── */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">כיסאות בקטלוג ({chairs.length})</h2>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                + הוסף כיסא
              </button>
            </div>

            {chairs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <p className="text-4xl mb-3">🪑</p>
                <p className="text-gray-500 mb-4">אין כיסאות עדיין</p>
                <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold">
                  הוסף את הראשון
                </button>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={chairs.map((c) => c.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {chairs.map((chair) => (
                      <SortableChairCard
                        key={chair.id}
                        chair={chair}
                        onEdit={(c) => setEditingChair(c)}
                        onDelete={handleDelete}
                        onToggleVisible={handleToggleVisible}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            <p className="text-center text-gray-400 text-xs pb-4">גרור כיסאות לשינוי סדר הצגה בקטלוג</p>
          </div>
        )}

        {/* ── TAB: CUSTOMERS ── */}
        {activeTab === "customers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">לקוחות ({customers.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  ייבוא רשימה
                </button>
                <button
                  onClick={() => setShowCustomerForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  + הוסף לקוח
                </button>
              </div>
            </div>

            {customers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-gray-500 mb-4">אין לקוחות עדיין</p>
                <button onClick={() => setShowCustomerForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold">
                  הוסף את הראשון
                </button>
              </div>
            ) : (
              <>
                {/* Selection toolbar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === customers.length && customers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedIds.size === 0 ? "בחר הכל" : `נבחרו ${selectedIds.size}`}
                    </span>
                  </label>

                  {selectedIds.size > 0 && (
                    <button
                      onClick={handleSendCatalog}
                      disabled={sending}
                      className="mr-auto bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      <span>📲</span>
                      {sending ? "מכין קישורים..." : `שלח קטלוג ל-${selectedIds.size} נבחרים`}
                    </button>
                  )}
                </div>

                {/* Customer list */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {customers.map((customer, i) => (
                    <div
                      key={customer.id}
                      className={`flex items-center gap-3 px-4 py-3 ${i < customers.length - 1 ? "border-b border-gray-50" : ""} ${selectedIds.has(customer.id) ? "bg-blue-50" : "hover:bg-gray-50"} transition-colors`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(customer.id)}
                        onChange={() => toggleSelect(customer.id)}
                        className="w-4 h-4 rounded accent-blue-600 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{customer.name}</p>
                        <p className="text-xs text-gray-400 font-mono" dir="ltr">{customer.phone}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setEditingCustomer(customer)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          עריכה
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB: DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "כיסאות בקטלוג", value: chairs.length, color: "text-blue-700" },
                { label: "לקוחות", value: customers.length, color: "text-purple-700" },
                { label: "קישורים נשלחו", value: analytics.totalSent, color: "text-orange-600" },
                {
                  label: "פתחו קישור",
                  value: analytics.totalSent > 0
                    ? `${analytics.totalOpened}/${analytics.totalSent} (${Math.round((analytics.totalOpened / analytics.totalSent) * 100)}%)`
                    : "0",
                  color: "text-green-700",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Views */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "כניסות השבוע", value: analytics.viewsWeek },
                { label: "כניסות החודש", value: analytics.viewsMonth },
                { label: "סה\"כ כניסות", value: analytics.totalViews },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
              ))}
            </div>

            {/* Top chairs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">כיסאות הכי נצפים</h3>
              {analytics.topChairs.length === 0 ? (
                <p className="text-gray-400 text-sm">אין נתונים עדיין</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topChairs.map((c, i) => (
                    <div key={c.chairId} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-5 text-center">{i + 1}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(c.clicks / (analytics.topChairs[0]?.clicks || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-6 text-left">{c.clicks}</span>
                      <span className="text-sm text-gray-600 flex-1 truncate">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── TAB: REPORT ── */}
        {activeTab === "report" && (() => {
          const now = Date.now();
          const filtered = analytics.campaignStats
            .filter((s) => {
              if (reportFilter === "opened") return s.opened;
              if (reportFilter === "not_opened") return !s.opened;
              return true;
            })
            .filter((s) =>
              reportSearch === "" ||
              s.customerName.toLowerCase().includes(reportSearch.toLowerCase()) ||
              s.phone.includes(reportSearch)
            )
            .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

          const totalNotOpened = analytics.totalSent - analytics.totalOpened;
          const openRate = analytics.totalSent > 0
            ? Math.round((analytics.totalOpened / analytics.totalSent) * 100)
            : 0;

          return (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900">דוח שליחה</h2>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500">נשלחו סה&quot;כ</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{analytics.totalSent}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500">פתחו</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{analytics.totalOpened}</p>
                  {analytics.totalSent > 0 && (
                    <p className="text-xs text-green-500 mt-0.5">{openRate}%</p>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500">לא פתחו</p>
                  <p className="text-2xl font-bold text-gray-500 mt-1">{totalNotOpened}</p>
                  {analytics.totalSent > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{100 - openRate}%</p>
                  )}
                </div>
              </div>

              {/* Filter + Search */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                  {([["all", "הכל"], ["opened", "פתחו"], ["not_opened", "לא פתחו"]] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setReportFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        reportFilter === key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="חפש לפי שם..."
                  className="flex-1 min-w-[140px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Table */}
              {analytics.campaignStats.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-500 mb-1">טרם נשלחו קישורים</p>
                  <p className="text-xs text-gray-400">עבור לטאב לקוחות, בחר לקוחות ולחץ &quot;שלח קטלוג&quot;</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
                  אין תוצאות לפילטר הנוכחי
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="text-right px-4 py-3 font-medium">לקוח</th>
                          <th className="text-right px-4 py-3 font-medium">נשלח</th>
                          <th className="text-center px-4 py-3 font-medium">סטטוס</th>
                          <th className="text-right px-4 py-3 font-medium">נפתח ב</th>
                          <th className="text-center px-4 py-3 font-medium">כיסאות</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map((stat) => {
                          const isNewOpen =
                            stat.opened &&
                            stat.firstOpenedAt &&
                            now - new Date(stat.firstOpenedAt).getTime() < 24 * 60 * 60 * 1000;

                          return (
                            <tr key={stat.token} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div>
                                    <p className="font-medium text-gray-900">{stat.customerName}</p>
                                    <p className="text-xs text-gray-400 font-mono" dir="ltr">{stat.phone}</p>
                                  </div>
                                  {isNewOpen && (
                                    <span className="shrink-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">חדש</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                {new Date(stat.sentAt).toLocaleDateString("he-IL", {
                                  day: "2-digit", month: "2-digit", year: "2-digit",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {stat.opened ? (
                                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    ✅ נפתח
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    ⏳ טרם נפתח
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                {stat.firstOpenedAt
                                  ? new Date(stat.firstOpenedAt).toLocaleDateString("he-IL", {
                                      day: "2-digit", month: "2-digit",
                                      hour: "2-digit", minute: "2-digit",
                                    })
                                  : "—"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-bold text-sm ${stat.chairsViewedCount > 0 ? "text-blue-700" : "text-gray-300"}`}>
                                  {stat.chairsViewedCount > 0 ? stat.chairsViewedCount : "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={async () => {
                                    const res = await fetch("/api/campaigns/send", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        customerIds: [stat.customerId],
                                        baseUrl: window.location.origin,
                                      }),
                                    });
                                    const results = await res.json();
                                    setSendResults(results);
                                    refreshAnalytics();
                                  }}
                                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                >
                                  שלח שוב
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </main>
    </div>
  );
}

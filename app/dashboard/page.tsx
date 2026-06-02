"use client";
import Link from "next/link";
import { useState } from "react";

const mockHistory = [
  {
    id: 1,
    date: "2025-05-28",
    time: "10:23",
    fault: "تآكل الفرامل الأمامية",
    severity: "high",
    confidence: 91,
    location: "الفرامل الأمامية",
    cost: "600–1200 ريال",
    status: "تم الإصلاح",
  },
  {
    id: 2,
    date: "2025-05-20",
    time: "14:45",
    fault: "تسريب زيت المحرك",
    severity: "critical",
    confidence: 95,
    location: "غطاء المحرك",
    cost: "300–700 ريال",
    status: "قيد المعالجة",
  },
  {
    id: 3,
    date: "2025-05-10",
    time: "09:11",
    fault: "خلل في محمل العجلة",
    severity: "medium",
    confidence: 83,
    location: "العجلة الخلفية اليمنى",
    cost: "400–900 ريال",
    status: "تم الإصلاح",
  },
  {
    id: 4,
    date: "2025-04-30",
    time: "17:02",
    fault: "مشكلة في الاسبدومتر",
    severity: "low",
    confidence: 74,
    location: "لوحة العدادات",
    cost: "100–300 ريال",
    status: "تم الإصلاح",
  },
];

const severityColors: Record<string, string> = {
  low: "#47ffb3",
  medium: "#ffb347",
  high: "#ff8347",
  critical: "#ff4d4d",
};

const severityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

const statusColors: Record<string, string> = {
  "تم الإصلاح": "#47ffb3",
  "قيد المعالجة": "#ffb347",
};

export default function Dashboard() {
  const [selected, setSelected] = useState<typeof mockHistory[0] | null>(null);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2.5rem", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔊</div>
          <span style={{ fontWeight: 700, fontSize: 17 }}>AutoSound</span>
        </Link>
        <Link href="/analyze" style={{
          background: "var(--accent)", color: "#0a0a0f",
          padding: "8px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14,
        }}>
          + تشخيص جديد
        </Link>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: "0.25rem", letterSpacing: "-0.5px" }}>
          لوحة التحكم
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: 14 }}>
          سجل تشخيصات سيارتك وتقارير الأعطال
        </p>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: "2.5rem" }}>
          {[
            { label: "إجمالي التشخيصات", value: "4", icon: "🔍" },
            { label: "أعطال حرجة", value: "1", icon: "🔴", color: "#ff4d4d" },
            { label: "تم إصلاحها", value: "3", icon: "✅", color: "#47ffb3" },
            { label: "متوسط الثقة", value: "86%", icon: "🎯", color: "var(--accent)" },
          ].map((c) => (
            <div key={c.label} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "1.25rem 1rem",
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: c.color || "var(--text-primary)", letterSpacing: "-1px" }}>
                {c.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Main layout: list + detail */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 16, transition: "all 0.3s" }}>
          {/* History list */}
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: "1rem", color: "var(--text-secondary)" }}>
              سجل التشخيصات
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mockHistory.map((item) => (
                <button key={item.id} onClick={() => setSelected(selected?.id === item.id ? null : item)} style={{
                  background: selected?.id === item.id ? "var(--bg-elevated)" : "var(--bg-card)",
                  border: `1px solid ${selected?.id === item.id ? "var(--border-hover)" : "var(--border)"}`,
                  borderRadius: 12, padding: "1rem 1.25rem",
                  cursor: "pointer", textAlign: "right",
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{
                      background: `${severityColors[item.severity]}20`,
                      color: severityColors[item.severity],
                      padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                    }}>
                      {severityLabels[item.severity]}
                    </span>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{item.fault}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: statusColors[item.status] || "var(--text-secondary)" }}>
                      {item.status}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {item.date} · {item.time}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-secondary)" }}>تفاصيل التشخيص</h2>
                <button onClick={() => setSelected(null)} style={{
                  background: "transparent", border: "none", color: "var(--text-muted)",
                  cursor: "pointer", fontSize: 18,
                }}>✕</button>
              </div>

              <div style={{
                background: `${severityColors[selected.severity]}10`,
                border: `1px solid ${severityColors[selected.severity]}30`,
                borderRadius: 12, padding: "1.25rem", marginBottom: 12,
              }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>العطل</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{selected.fault}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <span style={{
                    background: `${severityColors[selected.severity]}20`, color: severityColors[selected.severity],
                    padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                  }}>{severityLabels[selected.severity]}</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: 12, alignSelf: "center" }}>
                    ثقة {selected.confidence}%
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "الموقع", value: selected.location },
                  { label: "التكلفة التقديرية", value: selected.cost },
                  { label: "التاريخ", value: `${selected.date} - ${selected.time}` },
                  { label: "الحالة", value: selected.status },
                ].map((r) => (
                  <div key={r.label} style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: "0.875rem 1rem",
                    display: "flex", justifyContent: "space-between",
                  }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{r.value}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{r.label}</span>
                  </div>
                ))}
              </div>

              <Link href="/analyze" style={{
                display: "block", marginTop: 16,
                background: "var(--accent)", color: "#0a0a0f",
                padding: "13px", borderRadius: 10, fontWeight: 700,
                textAlign: "center", fontSize: 14,
              }}>
                تشخيص جديد
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

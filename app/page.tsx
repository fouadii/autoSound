"use client";
import Link from "next/link";
import { useState } from "react";

const features = [
  {
    icon: "🎙️",
    title: "تسجيل فوري",
    desc: "سجّل صوت السيارة من أي مكان عبر الهاتف أو الحاسوب بنقرة واحدة",
  },
  {
    icon: "🧠",
    title: "تحليل بالذكاء الاصطناعي",
    desc: "نموذج مدرّب على آلاف الأعطال الميكانيكية يحلل الصوت في ثوانٍ",
  },
  {
    icon: "📋",
    title: "تقرير مفصّل",
    desc: "احصل على اسم العطل، مستوى الخطورة، والإجراء المقترح فورًا",
  },
  {
    icon: "📊",
    title: "سجل التشخيصات",
    desc: "تتبع تاريخ أعطال سيارتك وقارن النتائج عبر الزمن",
  },
];

const stats = [
  { value: "97%", label: "دقة التشخيص" },
  { value: "< 8 ث", label: "زمن التحليل" },
  { value: "+200", label: "نوع عطل مدعوم" },
  { value: "24/7", label: "متاح دائمًا" },
];

export default function Home() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2.5rem",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🔊</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>AutoSound</span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/dashboard" style={{ color: "var(--text-secondary)", fontSize: 14 }}>لوحة التحكم</Link>
          <Link href="/analyze" style={{
            background: "var(--accent)", color: "#0a0a0f",
            padding: "8px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14,
          }}>ابدأ التشخيص</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "6rem 2rem 4rem", position: "relative" }}>
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(232,255,71,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--accent-dim)", border: "1px solid rgba(232,255,71,0.25)",
          borderRadius: 100, padding: "6px 16px", marginBottom: "1.5rem",
          fontSize: 13, color: "var(--accent)",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          مدعوم بنماذج صوتية متخصصة
        </div>
        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-2px",
          maxWidth: 800, margin: "0 auto 1.5rem",
        }}>
          اكتشف عطل سيارتك
          <br />
          <span style={{ color: "var(--accent)" }}>بمجرد الاستماع</span>
        </h1>
        <p style={{
          fontSize: 18, color: "var(--text-secondary)",
          maxWidth: 520, margin: "0 auto 2.5rem", lineHeight: 1.7,
        }}>
          سجّل الصوت الغريب من سيارتك وسيخبرك الذكاء الاصطناعي بالعطل الدقيق في أقل من 10 ثوانٍ.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/analyze" style={{
            background: "var(--accent)", color: "#0a0a0f",
            padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 16,
            display: "inline-flex", alignItems: "center", gap: 8,
            transition: "background 0.2s",
          }}>
            🎙️ سجّل صوت السيارة
          </Link>
          <Link href="/dashboard" style={{
            background: "var(--bg-card)", color: "var(--text-primary)",
            padding: "14px 32px", borderRadius: 10, fontWeight: 600, fontSize: 16,
            border: "1px solid var(--border)",
          }}>
            عرض التقارير
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "2rem 2.5rem" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16, maxWidth: 900, margin: "0 auto",
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "1.5rem 1rem", textAlign: "center",
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", letterSpacing: "-1px" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "4rem 2.5rem" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: "2.5rem", letterSpacing: "-1px" }}>
          كيف يعمل AutoSound؟
        </h2>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16, maxWidth: 900, margin: "0 auto",
        }}>
          {features.map((f, i) => (
            <div key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === i ? "var(--bg-elevated)" : "var(--bg-card)",
                border: `1px solid ${hovered === i ? "var(--border-hover)" : "var(--border)"}`,
                borderRadius: 14, padding: "1.75rem 1.5rem",
                transition: "all 0.2s",
                cursor: "default",
              }}>
              <div style={{ fontSize: 32, marginBottom: "0.75rem" }}>{f.icon}</div>
              <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: "0.5rem" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "4rem 2.5rem", textAlign: "center" }}>
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "3rem 2rem", maxWidth: 600, margin: "0 auto",
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: "1rem", letterSpacing: "-0.5px" }}>
            هل سيارتك تصدر صوتًا غريبًا؟
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.75rem" }}>
            لا تنتظر. شخّص العطل الآن مجانًا وتجنب أعطالًا أكبر وأغلى.
          </p>
          <Link href="/analyze" style={{
            background: "var(--accent)", color: "#0a0a0f",
            padding: "14px 36px", borderRadius: 10, fontWeight: 700, fontSize: 16,
            display: "inline-block",
          }}>
            ابدأ التشخيص المجاني
          </Link>
        </div>
      </section>

      <footer style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13 }}>
        © 2025 AutoSound · تشخيص ذكي لأعطال السيارات
      </footer>
    </main>
  );
}

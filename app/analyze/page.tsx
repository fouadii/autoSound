"use client";
import { useState, useRef } from "react";
import Link from "next/link";

type DiagnosisResult = {
  fault: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  location: string;
  description: string;
  recommendation: string;
  estimatedCost: string;
  urgency: string;
};

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


async function callClaude(userMessage: string): Promise<DiagnosisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });
  if (!response.ok) throw new Error("API error");
  return response.json();
}

// استخراج وصف الصوت من الملف الصوتي عبر Web Audio API
async function extractAudioFeatures(file: File): Promise<string> {
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  // حساب مستوى الصوت RMS
  let sumSquares = 0;
  for (let i = 0; i < channelData.length; i++) sumSquares += channelData[i] * channelData[i];
  const rms = Math.sqrt(sumSquares / channelData.length);

  // تحليل التكرارية الأساسية (Zero Crossing Rate)
  let zeroCrossings = 0;
  for (let i = 1; i < channelData.length; i++) {
    if ((channelData[i] >= 0) !== (channelData[i - 1] >= 0)) zeroCrossings++;
  }
  const zcr = zeroCrossings / duration;

  // تصنيف الصوت بناءً على الخصائص
  const loudness = rms < 0.01 ? "هادئ" : rms < 0.05 ? "متوسط" : "عالٍ";
  const frequency = zcr < 1000 ? "منخفضة" : zcr < 5000 ? "متوسطة" : "عالية";
  const rhythm = zcr > 3000 ? "متقطع ومتكرر" : "مستمر";

  audioCtx.close();

  return `تم رفع ملف صوتي بالخصائص التالية:
- مدة التسجيل: ${duration.toFixed(1)} ثانية
- مستوى الصوت: ${loudness} (RMS: ${rms.toFixed(4)})
- تردد الصوت: ${frequency} (ZCR: ${Math.round(zcr)} عبور/ثانية)
- نمط الصوت: ${rhythm}
- نوع الملف: ${file.name.split(".").pop()?.toUpperCase()}

بناءً على هذه الخصائص الصوتية لصوت سيارة، قم بتشخيص العطل الأكثر احتمالاً.`;
}

export default function AnalyzePage() {
  const [stage, setStage] = useState<"idle" | "recording" | "uploading" | "analyzing" | "result">("idle");
  const [duration, setDuration] = useState(0);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [textInput, setTextInput] = useState("");
  const [mode, setMode] = useState<"record" | "upload" | "text">("record");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- تسجيل مباشر ----
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setStage("analyzing");
        try {
          const features = await extractAudioFeatures(new File([blob], "recording.webm", { type: "audio/webm" }));
          const res = await callClaude(features);
          setResult(res);
        } catch {
          setResult(fallbackResult());
        }
        setStage("result");
      };
      recorder.start();
      mediaRef.current = recorder;
      setStage("recording");
      setDuration(0);
      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      alert("لا يمكن الوصول إلى الميكروفون.");
    }
  };

  const stopRecording = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    mediaRef.current?.stop();
  };

  // ---- رفع ملف صوتي ----
  const handleFileSelect = (file: File) => {
    const allowed = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4", "audio/m4a", "audio/aac", "audio/flac"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|webm|m4a|aac|flac|mp4)$/i)) {
      alert("يرجى رفع ملف صوتي (MP3, WAV, OGG, M4A, AAC...)");
      return;
    }
    setUploadedFile(file);
    setUploadedAudioUrl(URL.createObjectURL(file));
  };

  const analyzeUploadedFile = async () => {
    if (!uploadedFile) return;
    setStage("analyzing");
    try {
      const features = await extractAudioFeatures(uploadedFile);
      const res = await callClaude(features);
      setResult(res);
    } catch {
      setResult(fallbackResult());
    }
    setStage("result");
  };

  // ---- وصف نصي ----
  const analyzeText = async () => {
    if (!textInput.trim()) return;
    setStage("analyzing");
    try {
      const res = await callClaude(textInput);
      setResult(res);
    } catch {
      setResult(fallbackResult());
    }
    setStage("result");
  };

  const fallbackResult = (): DiagnosisResult => ({
    fault: "يحتاج لمزيد من التفاصيل",
    severity: "low",
    confidence: 60,
    location: "غير محدد",
    description: "تعذّر تحليل الصوت بدقة، يُرجى تقديم وصف نصي إضافي.",
    recommendation: "أعد المحاولة أو استخدم وضع الوصف النصي",
    estimatedCost: "غير محدد",
    urgency: "غير محدد",
  });

  const reset = () => {
    setStage("idle");
    setResult(null);
    setDuration(0);
    setTextInput("");
    setUploadedFile(null);
    if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
    setUploadedAudioUrl(null);
  };

  const modes = [
    { id: "record", label: "🎙️ تسجيل مباشر" },
    { id: "upload", label: "📁 رفع ملف صوتي" },
    { id: "text",   label: "✍️ وصف نصي" },
  ] as const;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", padding: "0 0 4rem" }}>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2.5rem", borderBottom: "1px solid var(--border)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔊</div>
          <span style={{ fontWeight: 700, fontSize: 17 }}>AutoSound</span>
        </Link>
        <Link href="/dashboard" style={{ color: "var(--text-secondary)", fontSize: 14 }}>لوحة التحكم</Link>
      </nav>

      <div style={{ maxWidth: 640, margin: "3rem auto", padding: "0 1.5rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: "0.5rem", letterSpacing: "-1px" }}>
          تشخيص صوت السيارة
        </h1>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "2.5rem", fontSize: 15 }}>
          سجّل، ارفع ملفًا صوتيًا، أو صف الصوت نصيًا
        </p>

        {/* Mode tabs */}
        {stage === "idle" && (
          <div style={{ display: "flex", gap: 6, marginBottom: "2rem", background: "var(--bg-card)", padding: 4, borderRadius: 12, border: "1px solid var(--border)" }}>
            {modes.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                flex: 1, padding: "10px 6px", borderRadius: 8, border: "none", cursor: "pointer",
                background: mode === m.id ? "var(--bg-elevated)" : "transparent",
                color: mode === m.id ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: mode === m.id ? 600 : 400, fontSize: 13, transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}>
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* ===== تسجيل مباشر ===== */}
        {stage === "idle" && mode === "record" && (
          <div style={{ textAlign: "center" }}>
            <button onClick={startRecording} style={{
              width: 120, height: 120, borderRadius: "50%",
              background: "var(--accent)", border: "none", cursor: "pointer",
              fontSize: 40, display: "inline-flex", alignItems: "center", justifyContent: "center",
              animation: "pulse-ring 2s infinite",
            }}>🎙️</button>
            <p style={{ marginTop: "1.5rem", color: "var(--text-secondary)", fontSize: 14 }}>
              اضغط للبدء في التسجيل
            </p>
          </div>
        )}

        {/* ===== رفع ملف صوتي ===== */}
        {stage === "idle" && mode === "upload" && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            {!uploadedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileSelect(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border-hover)"}`,
                  borderRadius: 16,
                  padding: "3rem 2rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? "var(--accent-dim)" : "var(--bg-card)",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: "1rem" }}>🎵</div>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: "0.5rem" }}>
                  اسحب الملف هنا أو اضغط للاختيار
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  MP3 · WAV · OGG · M4A · AAC · FLAC
                </p>
              </div>
            ) : (
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, padding: "1.5rem",
              }}>
                {/* معلومات الملف */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: "var(--accent-dim)", border: "1px solid rgba(232,255,71,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    flexShrink: 0,
                  }}>🎵</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {uploadedFile.name}
                    </p>
                    <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                      {(uploadedFile.size / 1024).toFixed(0)} KB · {uploadedFile.name.split(".").pop()?.toUpperCase()}
                    </p>
                  </div>
                  <button onClick={() => { setUploadedFile(null); setUploadedAudioUrl(null); }} style={{
                    background: "transparent", border: "none", color: "var(--text-muted)",
                    cursor: "pointer", fontSize: 20, flexShrink: 0,
                  }}>✕</button>
                </div>

                {/* مشغّل الصوت */}
                {uploadedAudioUrl && (
                  <audio
                    controls
                    src={uploadedAudioUrl}
                    style={{ width: "100%", marginBottom: "1.25rem", borderRadius: 8 }}
                  />
                )}

                <button onClick={analyzeUploadedFile} style={{
                  width: "100%", padding: "14px",
                  background: "var(--accent)", color: "#0a0a0f",
                  border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
                  cursor: "pointer",
                }}>
                  🧠 تحليل الملف الصوتي
                </button>

                <button onClick={() => fileInputRef.current?.click()} style={{
                  width: "100%", padding: "10px", marginTop: 8,
                  background: "transparent", color: "var(--text-secondary)",
                  border: "1px solid var(--border)", borderRadius: 10, fontSize: 13,
                  cursor: "pointer",
                }}>
                  تغيير الملف
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== وصف نصي ===== */}
        {stage === "idle" && mode === "text" && (
          <div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="مثال: أسمع صوت طقطقة من الجهة الأمامية اليسرى عند الدوران، وأحيانًا عند التسارع..."
              rows={5}
              style={{
                width: "100%", padding: "1rem", borderRadius: 12,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                color: "var(--text-primary)", fontSize: 15, lineHeight: 1.7,
                outline: "none", resize: "vertical", fontFamily: "inherit",
              }}
            />
            <button onClick={analyzeText} disabled={!textInput.trim()} style={{
              marginTop: 12, width: "100%", padding: "14px",
              background: textInput.trim() ? "var(--accent)" : "var(--bg-elevated)",
              color: textInput.trim() ? "#0a0a0f" : "var(--text-muted)",
              border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
              cursor: textInput.trim() ? "pointer" : "not-allowed",
            }}>
              تحليل الوصف
            </button>
          </div>
        )}

        {/* ===== جارٍ التسجيل ===== */}
        {stage === "recording" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: "2rem", height: 60, alignItems: "center" }}>
              {[...Array(14)].map((_, i) => (
                <div key={i} style={{
                  width: 4, background: "var(--accent)", borderRadius: 2,
                  animation: `wave 0.8s ${i * 0.07}s ease-in-out infinite`,
                  transformOrigin: "bottom",
                }} />
              ))}
            </div>
            <p style={{ fontWeight: 700, fontSize: 22, color: "var(--accent)", marginBottom: "0.5rem", fontVariantNumeric: "tabular-nums" }}>
              {String(Math.floor(duration / 60)).padStart(2, "0")}:{String(duration % 60).padStart(2, "0")}
            </p>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: 14 }}>
              جارٍ التسجيل... اضغط إيقاف عند الانتهاء
            </p>
            <button onClick={stopRecording} style={{
              padding: "12px 36px", background: "var(--danger)",
              color: "#fff", border: "none", borderRadius: 10,
              fontWeight: 700, fontSize: 15, cursor: "pointer",
            }}>⏹ إيقاف التسجيل</button>
          </div>
        )}

        {/* ===== جارٍ التحليل ===== */}
        {stage === "analyzing" && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div style={{
              width: 64, height: 64, border: "3px solid var(--border)",
              borderTopColor: "var(--accent)", borderRadius: "50%",
              margin: "0 auto 1.5rem", animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ fontWeight: 600, fontSize: 17 }}>جارٍ تحليل الصوت...</p>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>
              يعالج الذكاء الاصطناعي البيانات الصوتية
            </p>
          </div>
        )}

        {/* ===== النتيجة ===== */}
        {stage === "result" && result && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <div style={{
              background: `${severityColors[result.severity]}15`,
              border: `1px solid ${severityColors[result.severity]}40`,
              borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: 16,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>العطل المكتشف</div>
                <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>{result.fault}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  background: `${severityColors[result.severity]}25`,
                  color: severityColors[result.severity],
                  padding: "6px 14px", borderRadius: 100, fontWeight: 700, fontSize: 13,
                }}>
                  {severityLabels[result.severity]}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>الخطورة</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[
                { label: "الموقع", value: result.location, icon: "📍" },
                { label: "الثقة", value: `${result.confidence}%`, icon: "🎯" },
                { label: "التكلفة التقديرية", value: result.estimatedCost, icon: "💰" },
                { label: "الاستعجال", value: result.urgency, icon: "⏰" },
              ].map((item) => (
                <div key={item.label} style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "1rem",
                }}>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                    {item.icon} {item.label}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>📝 وصف العطل</div>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{result.description}</p>
            </div>

            <div style={{ background: "var(--accent-dim)", border: "1px solid rgba(232,255,71,0.2)", borderRadius: 12, padding: "1.25rem", marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: "var(--accent)", marginBottom: 8 }}>✅ التوصية</div>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{result.recommendation}</p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={reset} style={{
                flex: 1, padding: "13px", background: "var(--bg-card)",
                border: "1px solid var(--border)", borderRadius: 10,
                color: "var(--text-primary)", fontWeight: 600, cursor: "pointer", fontSize: 14,
              }}>
                🔄 تشخيص جديد
              </button>
              <Link href="/dashboard" style={{
                flex: 1, padding: "13px", background: "var(--accent)",
                borderRadius: 10, color: "#0a0a0f", fontWeight: 700,
                textAlign: "center", fontSize: 14,
              }}>
                📊 عرض السجل
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

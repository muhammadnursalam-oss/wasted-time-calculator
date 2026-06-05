"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getTimeRank } from "./utils/rank";
import {
  AchievementResult,
  getAchievementResult,
} from "./utils/achievements";

type Category = {
  label: string;
  emoji: string;
  hours: number;
};

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-6 text-white">
          <p className="text-slate-300">Memuat hasil...</p>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}

function ResultContent() {
  const params = useSearchParams();
  const [achievementResult, setAchievementResult] =
    useState<AchievementResult | null>(null);
  const [isAchievementLoading, setIsAchievementLoading] = useState(true);
  const [achievementError, setAchievementError] = useState("");
  const [displayedHours, setDisplayedHours] = useState(0);
  const [shareFeedback, setShareFeedback] = useState("");

  const age = Number(params.get("age") || 0);
  const gaming = Number(params.get("gaming") || 0);
  const video = Number(params.get("video") || 0);
  const socialMedia = Number(params.get("socialMedia") || 0);
  const browsing = Number(params.get("browsing") || 0);
  const daydreaming = Number(params.get("daydreaming") || 0);

  const activeYears = Math.max(age - 10, 0);
  const gamingHours = gaming * 365 * activeYears;
  const videoHours = video * 365 * activeYears;
  const socialMediaHours = socialMedia * 365 * activeYears;
  const browsingHours = browsing * 365 * activeYears;
  const daydreamingHours = daydreaming * 365 * activeYears;

  const totalHours =
    gamingHours +
    videoHours +
    socialMediaHours +
    browsingHours +
    daydreamingHours;

  const totalDays = totalHours / 24;
  const totalYears = totalDays / 365;
  const rank = getTimeRank(totalHours);

  const categories: Category[] = useMemo(
    () => [
      { label: "Gaming", emoji: "🎮", hours: gamingHours },
      { label: "Video", emoji: "🎬", hours: videoHours },
      { label: "Social Media", emoji: "📱", hours: socialMediaHours },
      { label: "Browsing", emoji: "🌐", hours: browsingHours },
      { label: "Daydreaming", emoji: "💭", hours: daydreamingHours },
    ],
    [
      browsingHours,
      daydreamingHours,
      gamingHours,
      socialMediaHours,
      videoHours,
    ]
  );

  useEffect(() => {
    let isActive = true;

    async function loadAchievementResult() {
      setIsAchievementLoading(true);
      setAchievementError("");

      try {
        const result = await getAchievementResult(totalHours);

        if (isActive) {
          setAchievementResult(result);
        }
      } catch {
        if (isActive) {
          setAchievementError("Gagal membuat achievement preview.");
          setAchievementResult(null);
        }
      } finally {
        if (isActive) {
          setIsAchievementLoading(false);
        }
      }
    }

    loadAchievementResult();

    return () => {
      isActive = false;
    };
  }, [totalHours]);

  useEffect(() => {
    let frame = 0;
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayedHours(totalHours * easeOut);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [totalHours]);

  const formattedDisplayedHours = Math.round(displayedHours).toLocaleString();

  const shareText = achievementResult?.title
    ? `I spent ${totalHours.toLocaleString()} hours on autopilot. Achievement: ${achievementResult.title}. Built with Wasted Time Calculator.`
    : `I spent ${totalHours.toLocaleString()} hours on autopilot. Achievement preview is still loading. Built with Wasted Time Calculator.`;

  async function handleShareResult() {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Wasted Time Calculator Result",
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback("Link dibagikan.");
        window.setTimeout(() => setShareFeedback(""), 2200);
        return;
      }

      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareFeedback("Link disalin.");
    } catch {
      setShareFeedback("Gagal membagikan hasil.");
    }

    window.setTimeout(() => setShareFeedback(""), 2200);
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_24%),linear-gradient(135deg,_#050816_0%,_#111827_46%,_#1f2937_100%)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div className="absolute left-1/2 top-20 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl glow-pulse" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10">
        <div className="mb-8 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.35em] text-slate-300">
          <span>result</span>
          <span className="blink-soft text-amber-200">live breakdown</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="max-w-3xl">
              <h1 className="font-[family:var(--font-display)] text-6xl leading-[0.88] uppercase sm:text-7xl lg:text-8xl">
                YOUR
                <br />
                TIME
                <br />
                RECEIPT
              </h1>
              <p className="mt-5 max-w-2xl font-[family:var(--font-subtitle)] text-lg leading-8 text-slate-200 sm:text-xl">
                Ini bukan sekadar angka. Ini adalah jejak jam hidup yang sudah
                berubah jadi kebiasaan, keterampilan, dan jejak cerita.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Rank" value={rank?.name || "-"} />
              <StatCard
                label="Total Hari"
                value={`${totalDays.toLocaleString()} hari`}
              />
              <StatCard
                label="Total Tahun"
                value={`${totalYears.toFixed(2)} tahun`}
              />
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-xl sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Achievement Preview
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Ringkasan hasil yang paling dekat dengan total waktumu.
                  </p>
                </div>
              </div>

              {isAchievementLoading && (
                <p className="text-slate-300">Membuat achievement terbaik...</p>
              )}

              {achievementError && (
                <p className="text-red-300">{achievementError}</p>
              )}

              {achievementResult && !isAchievementLoading && (
                <>
                  <p className="text-lg font-semibold text-white">
                    {achievementResult.title}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    {achievementResult.description}
                  </p>
                </>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleShareResult}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/20"
                >
                  <span aria-hidden="true">↗</span>
                  Share ke Sosial Media
                </button>

                <p className="flex items-center text-sm text-slate-400">
                  {shareFeedback}
                </p>
              </div>
            </section>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                category breakdown
              </p>
              <h2 className="mt-2 font-[family:var(--font-subtitle)] text-2xl text-white">
                Aktivitas yang membentuk total ini
              </h2>
            </div>

            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.label}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.emoji}</span>
                    <div>
                      <p className="font-medium text-white">{category.label}</p>
                      <p className="text-xs text-slate-400">kategori aktivitas</p>
                    </div>
                  </div>
                  <p className="font-mono text-sm text-slate-200 tabular-nums">
                    {Math.floor(category.hours).toLocaleString()} jam
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-amber-200/20 bg-amber-300/10 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-100/80">
                total hours
              </p>
              <div className="mt-2 flex items-end gap-3">
                <p className="font-[family:var(--font-display)] text-7xl leading-none text-white tabular-nums sm:text-8xl">
                  {formattedDisplayedHours}
                </p>
                <span className="blink-soft mb-2 text-2xl text-amber-200">
                  ✦
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                ≈ {totalDays.toLocaleString()} hari atau {totalYears.toFixed(2)}{" "}
                tahun hidup.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/7 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-base font-semibold leading-7 text-white">{value}</p>
    </div>
  );
}

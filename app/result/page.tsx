"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getTimeRank } from "./utils/rank";
import {
  AchievementResult,
  getAchievementResult,
} from "./utils/achievements";
import {
  createResultRecord,
  getResultRecordById,
  ResultAttemptLimitError,
  type ResultRecord,
} from "./utils/results";
import { generateBrowserFingerprint } from "./utils/fingerprint";

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
  const recordIdFromUrl = params.get("id") || "";

  const [storedRecord, setStoredRecord] = useState<ResultRecord | null>(null);
  const [achievementResult, setAchievementResult] =
    useState<AchievementResult | null>(null);
  const [isAchievementLoading, setIsAchievementLoading] = useState(
    !recordIdFromUrl
  );
  const [isLoadingStoredRecord, setIsLoadingStoredRecord] = useState(
    Boolean(recordIdFromUrl)
  );
  const [displayedHours, setDisplayedHours] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [resultId, setResultId] = useState(recordIdFromUrl);

  const name = (params.get("name") || "").trim();
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

  const previewRecord: ResultRecord = {
    id: "",
    fingerprint: "",
    name,
    age,
    gaming: gamingHours,
    video: videoHours,
    socialMedia: socialMediaHours,
    browsing: browsingHours,
    daydreaming: daydreamingHours,
    totalHours,
    totalDays,
    totalYears,
    rankName: rank?.name || "-",
    rankDescription: rank?.description || "-",
    achievementTitle: achievementResult?.title || "",
    achievementDescription: achievementResult?.description || "",
    createdAt: "",
  };

  const renderRecord = storedRecord ?? previewRecord;

  const categories: Category[] = [
    { label: "Gaming", emoji: "🎮", hours: renderRecord.gaming },
    { label: "Video", emoji: "🎬", hours: renderRecord.video },
    { label: "Social Media", emoji: "📱", hours: renderRecord.socialMedia },
    { label: "Browsing", emoji: "🌐", hours: renderRecord.browsing },
    { label: "Daydreaming", emoji: "💭", hours: renderRecord.daydreaming },
  ];

  function pushToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 2400);
  }

  useEffect(() => {
    let isActive = true;

    async function loadStoredResult(id: string) {
      try {
        const record = await getResultRecordById(id);

        if (!isActive) {
          return;
        }

        if (!record) {
          pushToast("Hasil tidak ditemukan.");
          return;
        }

        setStoredRecord(record);
        setAchievementResult({
          title: record.achievementTitle,
          description: record.achievementDescription,
        });
        setResultId(record.id);
      } catch {
        if (isActive) {
          pushToast("Gagal memuat hasil tersimpan.");
        }
      } finally {
        if (isActive) {
          setIsLoadingStoredRecord(false);
          setIsAchievementLoading(false);
        }
      }
    }

    async function createAndStoreResult() {
      if (!name) {
        pushToast("Nama wajib diisi.");
        setIsAchievementLoading(false);
        return;
      }

      setIsAchievementLoading(true);

      try {
        const fingerprint = await generateBrowserFingerprint();
        const achievement = await getAchievementResult(totalHours);

        if (!isActive) {
          return;
        }

        setAchievementResult(achievement);

        const savedRecord = await createResultRecord({
          fingerprint,
          name,
          age,
          gaming: gamingHours,
          video: videoHours,
          socialMedia: socialMediaHours,
          browsing: browsingHours,
          daydreaming: daydreamingHours,
          totalHours,
          totalDays,
          totalYears,
          rankName: rank?.name || "-",
          rankDescription: rank?.description || "-",
          achievementTitle: achievement.title,
          achievementDescription: achievement.description,
        });

        if (!isActive) {
          return;
        }

        setStoredRecord(savedRecord);
        setResultId(savedRecord.id);
        window.history.replaceState(null, "", `/result?id=${savedRecord.id}`);
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (error instanceof ResultAttemptLimitError && error.record) {
          setStoredRecord(error.record);
          setAchievementResult({
            title: error.record.achievementTitle,
            description: error.record.achievementDescription,
          });
          setResultId(error.record.id);
          window.history.replaceState(null, "", `/result?id=${error.record.id}`);
          pushToast(error.message);
        } else {
          pushToast("Gagal membuat achievement preview.");
        }
      } finally {
        if (isActive) {
          setIsAchievementLoading(false);
          setIsLoadingStoredRecord(false);
        }
      }
    }

    if (recordIdFromUrl) {
      loadStoredResult(recordIdFromUrl);
    } else {
      createAndStoreResult();
    }

    return () => {
      isActive = false;
    };
  }, [
    age,
    browsingHours,
    daydreamingHours,
    gamingHours,
    name,
    rank?.description,
    rank?.name,
    recordIdFromUrl,
    socialMediaHours,
    totalDays,
    totalHours,
    totalYears,
    videoHours,
  ]);

  useEffect(() => {
    let frame = 0;
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayedHours(renderRecord.totalHours * easeOut);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [renderRecord.totalHours]);

  const formattedDisplayedHours = Math.round(displayedHours).toLocaleString();
  const shareId = resultId || renderRecord.id;
  const shareText = renderRecord.achievementTitle
    ? `Halo! Aku baru saja cek Wasted Time Calculator dan hasilku menunjukkan ${renderRecord.totalHours.toLocaleString()} jam waktu autopilot. Achievement-ku: ${renderRecord.achievementTitle}. Yuk lihat juga hasilmu.`
    : `Halo! Aku baru saja cek Wasted Time Calculator dan hasilku menunjukkan ${renderRecord.totalHours.toLocaleString()} jam waktu autopilot. Yuk lihat juga hasilmu.`;

  async function handleShareResult() {
    const shareUrl = shareId
      ? `${window.location.origin}/result?id=${shareId}`
      : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Wasted Time Calculator Result",
          text: shareText,
          url: shareUrl,
        });
        pushToast("Link dibagikan.");
        return;
      }

      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      pushToast("Link disalin.");
    } catch {
      pushToast("Gagal membagikan hasil.");
    }
  }

  if (recordIdFromUrl && isLoadingStoredRecord) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-white">
        <p className="text-slate-300">Memuat hasil tersimpan...</p>
      </main>
    );
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
              {renderRecord.name && (
                <p className="mt-3 text-sm uppercase tracking-[0.3em] text-amber-200/85">
                  {renderRecord.name}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Rank" value={renderRecord.rankName || "-"} />
              <StatCard
                label="Total Hari"
                value={`${renderRecord.totalDays.toLocaleString()} hari`}
              />
              <StatCard
                label="Total Tahun"
                value={`${renderRecord.totalYears.toFixed(2)} tahun`}
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

              {isAchievementLoading && !renderRecord.achievementTitle && (
                <p className="text-slate-300">Membuat achievement terbaik...</p>
              )}

              {renderRecord.achievementTitle && (
                <>
                  <p className="text-lg font-semibold text-white">
                    {renderRecord.achievementTitle}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    {renderRecord.achievementDescription}
                  </p>
                </>
              )}

              <p className="mt-5 text-sm leading-6 text-amber-100/90">
                Kalau kamu mau lihat hasil ini lagi nanti, bagikan hasil ini
                sekarang supaya link-nya tersimpan.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleShareResult}
                  disabled={!shareId}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span aria-hidden="true">↗</span>
                  Bagikan Hasil
                </button>
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
                ≈ {renderRecord.totalDays.toLocaleString()} hari atau{" "}
                {renderRecord.totalYears.toFixed(2)} tahun hidup.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
          {toastMessage}
        </div>
      )}
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

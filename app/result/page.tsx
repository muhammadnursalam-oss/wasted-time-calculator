"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTimeRank } from "./utils/rank";
import {
  AchievementResult,
  getAchievementResult,
} from "./utils/achievements";
import {
  createResultRecord,
  getResultRecordById,
  getResultRecordByFingerprint,
  ResultAttemptLimitError,
  type ResultRecord,
} from "./utils/results";
import { generateBrowserFingerprint } from "./utils/fingerprint";
import { getLifePathById, normalizeLifePath } from "@/lib/life-paths";

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
  const router = useRouter();
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
  const lifePath = normalizeLifePath(params.get("lifePath"));
  const selectedLifePath = getLifePathById(storedRecord?.lifePath ?? lifePath);
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
    lifePath,
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

        const existingRecord = await getResultRecordByFingerprint(fingerprint);

        if (existingRecord) {
          setStoredRecord(existingRecord);
          setAchievementResult({
            title: existingRecord.achievementTitle,
            description: existingRecord.achievementDescription,
          });
          setResultId(existingRecord.id);
          window.history.replaceState(
            null,
            "",
            `/result?id=${existingRecord.id}`
          );
          pushToast("Kamu sudah pernah mencoba tes ini sebelumnya.");
          return;
        }

        const achievement = await getAchievementResult(totalHours, lifePath);

        if (!isActive) {
          return;
        }

        setAchievementResult(achievement);

        const savedRecord = await createResultRecord({
          fingerprint,
          name,
          age,
          lifePath,
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
    lifePath,
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
    ? `Aku baru cek Wasted Time Calculator. Hasilku ${renderRecord.totalHours.toLocaleString()} jam waktu autopilot, dengan jalan hidup ${selectedLifePath.label}. Achievement: ${renderRecord.achievementTitle}.`
    : `Aku baru cek Wasted Time Calculator. Hasilku ${renderRecord.totalHours.toLocaleString()} jam waktu autopilot, dengan jalan hidup ${selectedLifePath.label}.`;

  async function handleShareResult() {
    const shareUrl = shareId
      ? `${window.location.origin}/result?id=${shareId}`
      : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Wasted Time Calculator - Result",
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
        <p className="text-slate-300">Menyiapkan hasil...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_22%),linear-gradient(135deg,_#050816_0%,_#111827_48%,_#1f2937_100%)]" />
      <div
        className="absolute inset-0 opacity-14"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div className="absolute left-1/2 top-24 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/8 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-5 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.35em] text-slate-300 sm:mb-8">
          <span>Result</span>
          <span className="text-amber-200/90">Overview</span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:gap-8">
          <section className="space-y-6 xl:sticky xl:top-10">
            <div className="max-w-3xl space-y-5 reveal">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/12 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100/80">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-200" />
                Ringkasan hasil
              </div>

              <div className="space-y-4">
                <h1 className="font-[family:var(--font-display)] text-5xl uppercase leading-[0.88] sm:text-6xl md:text-7xl lg:text-[5.7rem] motion-title">
                  Hasil
                  <br />
                  Waktu
                  <br />
                  Kamu
                </h1>

                <p className="max-w-2xl font-[family:var(--font-subtitle)] text-base leading-8 text-slate-200 sm:text-lg lg:text-xl">
                  Angka ini merangkum waktu yang sudah terserap ke kebiasaan
                  harian.
                </p>

                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 reveal-delay-1">
                  <span className="text-lg" aria-hidden="true">
                    {selectedLifePath.emoji}
                  </span>
                  <span>
                    Jalan hidup:{" "}
                    <strong className="text-white">{selectedLifePath.label}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 reveal-delay-1">
              <StatCard label="Peringkat" value={renderRecord.rankName || "-"} />
              <StatCard label="Jalan hidup" value={selectedLifePath.label} />
              <StatCard
                label="Total hari"
                value={`${renderRecord.totalDays.toLocaleString()} hari`}
              />
              <StatCard
                label="Total tahun"
                value={`${renderRecord.totalYears.toFixed(2)} tahun`}
              />
            </div>

            <section className="rounded-[30px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:border-white/15 sm:p-6 reveal-delay-2">
              <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/8 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Pencapaian</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Ringkasan yang paling dekat dengan total waktumu.
                  </p>
                </div>
              </div>

              {isAchievementLoading && !renderRecord.achievementTitle && (
                <p className="text-slate-300">Menyiapkan hasil...</p>
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

              <p className="mt-5 text-sm leading-6 text-amber-100/85">
                Bagikan link sekarang supaya hasil ini gampang dibuka lagi.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleShareResult}
                  disabled={!shareId}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200/20 bg-white/5 px-4 py-3 text-sm font-semibold text-amber-50 transition hover:border-amber-200/30 hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span aria-hidden="true">↗</span>
                  Bagikan Hasil
                </button>

                {recordIdFromUrl && (
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/15 hover:bg-white/8"
                  >
                    Coba Tes Ini
                  </button>
                )}
              </div>
            </section>
          </section>

          <aside className="rounded-[30px] border border-white/10 bg-slate-950/42 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:border-white/15 sm:p-6 xl:sticky xl:top-10 reveal-delay-1">
            <div className="mb-5 border-b border-white/8 pb-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Rincian
              </p>
              <h2 className="mt-2 font-[family:var(--font-subtitle)] text-2xl text-white">
                Aktivitas yang membentuk total ini
              </h2>
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl border border-amber-200/15 bg-white/5 p-4 reveal">
                <div className="mt-3 flex items-start gap-3">
                  <span className="text-3xl">{selectedLifePath.emoji}</span>
                  <div>
                    <p className="font-semibold text-white">
                      {selectedLifePath.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {selectedLifePath.description}
                    </p>
                  </div>
                </div>
              </div>

              {categories.map((category) => (
                <div
                  key={category.label}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 transition duration-300 hover:border-white/12 hover:bg-white/6"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.emoji}</span>
                    <div>
                      <p className="font-medium text-white">{category.label}</p>
                    </div>
                  </div>
                  <p className="font-mono text-sm text-slate-200 tabular-nums">
                    {Math.floor(category.hours).toLocaleString()} jam
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-amber-200/15 bg-white/5 p-5 reveal">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-100/80">
                Total jam
              </p>
              <div className="mt-2 flex items-end gap-3">
                <p className="font-[family:var(--font-display)] text-7xl leading-none text-white tabular-nums sm:text-8xl">
                  {formattedDisplayedHours}
                </p>
                <span className="blink-soft mb-2 text-2xl text-amber-200">✦</span>
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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-base font-semibold leading-7 text-white">{value}</p>
    </div>
  );
}

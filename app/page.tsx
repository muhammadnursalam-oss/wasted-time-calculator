"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LIFE_PATHS,
  normalizeLifePath,
  type LifePathId,
} from "@/lib/life-paths";

export default function Home() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [lifePath, setLifePath] = useState<LifePathId | "">("");
  const [gaming, setGaming] = useState("");
  const [video, setVideo] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [browsing, setBrowsing] = useState("");
  const [daydreaming, setDaydreaming] = useState("");
  const router = useRouter();

  const trimmedName = name.trim();
  const isNameMissing = trimmedName.length === 0;
  const userAge = Number(age);
  const isAgeInvalid = age !== "" && (userAge < 10 || userAge > 120);
  const isLifePathMissing = lifePath === "";
  const selectedLifePath = LIFE_PATHS.find((item) => item.id === lifePath);
  const dailyTotal =
    Number(gaming) +
    Number(video) +
    Number(socialMedia) +
    Number(browsing) +
    Number(daydreaming);
  const isDailyTotalInvalid = dailyTotal === 0 || dailyTotal > 24;
  const hasFormError =
    isNameMissing || isAgeInvalid || isDailyTotalInvalid || isLifePathMissing;

  function calculateTime() {
    if (isNameMissing) {
      return;
    }

    if (userAge < 10 || userAge > 120) {
      alert("masukan usia antara 10-120");
      return;
    }

    if (isLifePathMissing) {
      alert("pilih Jalan Hidupmu dulu");
      return;
    }

    if (isDailyTotalInvalid) {
      alert("total aktivitas tidak melebihi 24 jam per hari");
      return;
    }

    const params = new URLSearchParams({
      name: trimmedName,
      gaming,
      video,
      socialMedia,
      browsing,
      daydreaming,
      age,
      lifePath: normalizeLifePath(lifePath),
    });

    router.push(`/result?${params.toString()}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,15,25,0.92),rgba(15,23,42,0.82)_55%,rgba(30,41,59,0.94))]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-amber-300/20 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <section className="space-y-8">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm uppercase tracking-[0.35em] text-amber-200/80">
                wasted time calculator
              </p>

              <h1 className="max-w-xl font-[family:var(--font-display)] text-6xl leading-[0.9] uppercase text-white sm:text-7xl lg:text-8xl">
                WASTED
                <br />
                TIME
                <br />
                CALCULATOR
              </h1>

              <p className="mt-6 max-w-xl font-[family:var(--font-subtitle)] text-lg leading-8 text-slate-200 sm:text-xl">
                Berapa banyak waktu hidup Anda yang telah dihabiskan untuk
                aktivitas autopilot?
              </p>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
                *Kalkulasi ini hanyalah estimasi. Kami mengasumsikan aktivitas
                dilakukan secara konsisten sejak usia 10 tahun.
              </p>
            </div>

            <section className="rounded-[32px] border border-white/10 bg-white/8 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold text-white">
                    Jalan Hidupmu
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">
                    Pilih satu arah yang paling terasa kamu banget. Deskripsi
                    tiap jalan dibuat jelas supaya baseline yang kamu pilih
                    langsung kebaca oleh AI.
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    isLifePathMissing
                      ? "bg-amber-400/15 text-amber-100"
                      : "bg-emerald-500/15 text-emerald-200"
                  }`}
                >
                  {isLifePathMissing ? "Choose" : "Locked"}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {LIFE_PATHS.map((option) => {
                  const selected = lifePath === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLifePath(option.id)}
                      className={`group flex h-full min-h-[168px] flex-col rounded-[28px] border p-5 text-left transition-all duration-200 hover:-translate-y-1 ${
                        selected
                          ? "border-amber-300/70 bg-amber-300/12 shadow-lg shadow-amber-300/10"
                          : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-950/55"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl leading-none" aria-hidden="true">
                          {option.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold text-white">
                              {option.label}
                            </p>
                            {selected && (
                              <span className="rounded-full border border-amber-200/40 bg-amber-200/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-[15px] leading-7 text-slate-200">
                            {option.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto pt-4">
                        <div className="h-px w-full bg-white/8" />
                        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">
                          {selected ? "Siap dipakai sebagai baseline" : "Ketuk untuk pilih jalur ini"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {lifePath && selectedLifePath && (
                <div className="mt-5 rounded-[28px] border border-amber-200/20 bg-amber-300/10 p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{selectedLifePath.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm uppercase tracking-[0.25em] text-amber-100/80">
                        baseline terpilih
                      </p>
                      <p className="mt-1 text-xl font-semibold text-white">
                        {selectedLifePath.label}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-100">
                        {selectedLifePath.description}
                      </p>
                      <p className="mt-3 inline-flex rounded-full border border-amber-100/20 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-amber-50">
                        Ini yang akan dipakai AI sebagai referensi utama
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/8 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
            <div className="mb-5 rounded-3xl border border-amber-200/15 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-100/70">
                baseline summary
              </p>
              <div className="mt-3 flex items-start gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {selectedLifePath?.emoji ?? "◌"}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {selectedLifePath?.label ?? "Belum dipilih"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Pilih di panel kiri supaya cerita AI lebih tajam dan tidak
                    terasa generik.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Nama atau Panggilan
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-2xl border bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:ring-2 ${
                    isNameMissing
                      ? "border-red-500/80 focus:border-red-400 focus:ring-red-500/20"
                      : "border-white/10 focus:border-amber-300/70 focus:ring-amber-300/20"
                  }`}
                />
                {trimmedName && (
                  <p className="mt-3 text-sm text-amber-100/90">
                    Halo, {trimmedName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Usia
                </label>
                <input
                  min="10"
                  max="120"
                  type="number"
                  placeholder="Misal: 25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onBlur={() => {
                    if (isAgeInvalid) {
                      alert("masukan usia antara 10-120");
                    }
                  }}
                  className={`w-full rounded-2xl border bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:ring-2 ${
                    isAgeInvalid
                      ? "border-red-500/80 focus:border-red-400 focus:ring-red-500/20"
                      : "border-white/10 focus:border-amber-300/70 focus:ring-amber-300/20"
                  }`}
                />
              </div>

              <div
                className={`rounded-3xl border p-4 transition-colors sm:p-5 ${
                  isDailyTotalInvalid
                    ? "border-red-500/70 bg-red-950/30"
                    : "border-white/10 bg-black/15"
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Aktivitas Harian
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Total: {dailyTotal.toFixed(1)} jam per hari
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      isDailyTotalInvalid
                        ? "bg-red-500/15 text-red-200"
                        : "bg-emerald-500/15 text-emerald-200"
                    }`}
                  >
                    {isDailyTotalInvalid ? "Invalid" : "Ready"}
                  </span>
                </div>

                <div className="grid gap-4">
                  <Field
                    label="Gaming"
                    value={gaming}
                    onChange={setGaming}
                    invalid={isDailyTotalInvalid}
                    placeholder="Jam per hari (misal: 2)"
                  />
                  <Field
                    label="Video / Film / Tiktok / YouTube / IG Reels"
                    value={video}
                    onChange={setVideo}
                    invalid={isDailyTotalInvalid}
                    placeholder="Jam per hari (misal: 2.5)"
                  />
                  <Field
                    label="Social Media"
                    value={socialMedia}
                    onChange={setSocialMedia}
                    invalid={isDailyTotalInvalid}
                    placeholder="Jam per hari (misal: 1.5)"
                  />
                  <Field
                    label="Browsing"
                    value={browsing}
                    onChange={setBrowsing}
                    invalid={isDailyTotalInvalid}
                    placeholder="Jam per hari (misal: 2.5)"
                  />
                  <Field
                    label="Ngelamun"
                    value={daydreaming}
                    onChange={setDaydreaming}
                    invalid={isDailyTotalInvalid}
                    placeholder="Jam per hari (misal: 0.5)"
                  />
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Isi total aktivitas dengan wajar. Kalau kosong atau lebih dari
                  24 jam, tombol hitung akan dikunci.
                </p>
              </div>

              <button
                onClick={calculateTime}
                disabled={hasFormError}
                className={`inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-base font-semibold transition ${
                  hasFormError
                    ? "cursor-not-allowed bg-slate-600 text-slate-300"
                    : "bg-amber-300 text-slate-950 hover:bg-amber-200"
                }`}
              >
                Hitung Waktu Saya
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  invalid,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        min="0"
        max="24"
        step="0.5"
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-2xl border bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:ring-2 ${
          invalid
            ? "border-red-500/80 focus:border-red-400 focus:ring-red-500/20"
            : "border-white/10 focus:border-amber-300/70 focus:ring-amber-300/20"
        }`}
      />
    </div>
  );
}

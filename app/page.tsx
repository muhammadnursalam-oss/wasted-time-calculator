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
  const formProgress =
    (Number(!isNameMissing) +
      Number(age !== "" && !isAgeInvalid) +
      Number(!isLifePathMissing) +
      Number(!isDailyTotalInvalid)) *
    25;
  const hasFormError =
    isNameMissing || isAgeInvalid || isDailyTotalInvalid || isLifePathMissing;

  function calculateTime() {
    if (isNameMissing) {
      return;
    }

    if (userAge < 10 || userAge > 120) {
      alert("Masukkan usia antara 10-120.");
      return;
    }

    if (isLifePathMissing) {
      alert("Pilih jalan hidup dulu.");
      return;
    }

    if (isDailyTotalInvalid) {
      alert("Total aktivitas tidak boleh lebih dari 24 jam per hari.");
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
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,12,22,0.94),rgba(15,23,42,0.86)_56%,rgba(30,41,59,0.98))]" />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-amber-300/20 to-transparent" />
      <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl glow-pulse" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="grid gap-6 xl:grid-cols-[1.03fr_0.97fr] xl:items-start xl:gap-8">
          <section className="space-y-6 xl:sticky xl:top-10">
            <div className="max-w-2xl space-y-5 reveal">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/15 bg-amber-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100/85">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-200" />
                Estimasi cepat
              </div>

              <div className="space-y-4">
                <h1 className="max-w-xl font-[family:var(--font-display)] text-5xl uppercase leading-[0.88] text-white sm:text-6xl md:text-7xl lg:text-[5.6rem] motion-title">
                  Wasted
                  <br />
                  Time
                  <br />
                  Calculator
                </h1>

                <p className="max-w-xl font-[family:var(--font-subtitle)] text-base leading-8 text-slate-200 sm:text-lg lg:text-xl">
                  Lihat berapa banyak jam hidup yang sudah terserap ke
                  kebiasaan autopilot. Isi data singkat, pilih satu jalan, lalu
                  lihat hasilnya.
                </p>

                <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3 reveal-delay-1">
                  <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/8">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-amber-100/75">
                      01
                    </p>
                    <p className="mt-2 font-medium text-white">Isi nama dan usia</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/8">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-amber-100/75">
                      02
                    </p>
                    <p className="mt-2 font-medium text-white">Pilih jalan hidup</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/8">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-amber-100/75">
                      03
                    </p>
                    <p className="mt-2 font-medium text-white">Masukkan jam harian</p>
                  </div>
                </div>

                <p className="max-w-xl text-sm leading-6 text-slate-400">
                  *Kalkulasi ini hanyalah estimasi. Kami mengasumsikan aktivitas
                  dilakukan secara konsisten sejak usia 10 tahun.
                </p>
              </div>
            </div>

            <section className="rounded-[32px] border border-white/10 bg-white/7 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl transition duration-300 hover:border-white/15 sm:p-6 reveal-delay-2">
              <div className="mb-5">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-slate-400">
                  <span>Progress</span>
                  <span>{formProgress}%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-200 gradient-sheen"
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold text-white">
                    Pilih jalan hidup
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">
                    Pilih satu yang paling mendekati kamu.
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    isLifePathMissing
                      ? "bg-amber-400/15 text-amber-100"
                      : "bg-emerald-500/15 text-emerald-200"
                  }`}
                >
                  {isLifePathMissing ? "Pilih satu" : "Aktif"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {LIFE_PATHS.map((option) => {
                  const selected = lifePath === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLifePath(option.id)}
                      className={`group flex h-full min-h-[168px] flex-col rounded-[26px] border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.99] sm:p-5 ${
                        selected
                          ? "border-amber-300/70 bg-amber-300/12 shadow-lg shadow-amber-300/10 choice-active ring-1 ring-amber-200/20"
                          : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-950/55"
                      }`}
                    >
                      <div className="grid flex-1 grid-cols-[auto,1fr] gap-x-3 gap-y-2">
                        <span
                          className="row-span-2 text-4xl leading-none transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                          aria-hidden="true"
                        >
                          {option.emoji}
                        </span>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-white">
                            {option.label}
                          </p>
                          {selected && (
                            <span className="rounded-full border border-amber-200/40 bg-amber-200/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="col-span-2 text-[15px] leading-7 text-slate-200">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </section>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/7 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl transition duration-300 hover:border-white/15 sm:p-6 xl:sticky xl:top-10 reveal-delay-1">
            <div className="mb-4 rounded-[26px] border border-amber-200/15 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-100/70">
                Pilihan aktif
              </p>
              <div className="mt-3 flex items-start gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {selectedLifePath?.emoji ?? "\u25CC"}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {selectedLifePath?.label ?? "Belum dipilih"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Ini dipakai sebagai acuan hasil.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Nama atau panggilan
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-2xl border bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:ring-2 ${
                    isNameMissing
                      ? "border-red-500/80 focus:border-red-400 focus:ring-red-500/20"
                      : `border-white/10 focus:border-amber-300/70 focus:ring-amber-300/20 ${
                          trimmedName ? "field-filled" : ""
                        }`
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
                      alert("Masukkan usia antara 10-120.");
                    }
                  }}
                  className={`w-full rounded-2xl border bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:ring-2 ${
                    isAgeInvalid
                      ? "border-red-500/80 focus:border-red-400 focus:ring-red-500/20"
                      : `border-white/10 focus:border-amber-300/70 focus:ring-amber-300/20 ${
                          age ? "field-filled" : ""
                        }`
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
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Jam harian</h2>
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
                    {isDailyTotalInvalid ? "Cek" : "Siap"}
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
                  Isi jam per hari. Totalnya harus 24 atau kurang.
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
            : `border-white/10 focus:border-amber-300/70 focus:ring-amber-300/20 ${
                value.trim() ? "field-filled" : ""
              }`
        }`}
      />
    </div>
  );
}

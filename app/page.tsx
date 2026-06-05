"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gaming, setGaming] = useState("");
  const [video, setVideo] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [browsing, setBrowsing] = useState("");
  const [daydreaming, setDaydreaming] = useState("");
  const router = useRouter();

  const userAge = Number(age);
  const isAgeInvalid = age !== "" && (userAge < 10 || userAge > 120);
  const dailyTotal =
    Number(gaming) +
    Number(video) +
    Number(socialMedia) +
    Number(browsing) +
    Number(daydreaming);
  const isDailyTotalInvalid = dailyTotal === 0 || dailyTotal > 24;
  const hasFormError = isAgeInvalid || isDailyTotalInvalid;

  function calculateTime() {
    if (userAge < 10 || userAge > 120) {
      alert("masukan usia antara 10-120");
      return;
    }

    if (isDailyTotalInvalid) {
      alert("total aktivitas tidak melebihi 24 jam per hari");
      return;
    }

    router.push(
      `/result?gaming=${gaming}&video=${video}&socialMedia=${socialMedia}&browsing=${browsing}&daydreaming=${daydreaming}&age=${age}`
    );
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
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <section className="max-w-2xl">
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
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/8 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/20"
                />
                {name && (
                  <p className="mt-3 text-sm text-amber-100/90">
                    Halo, {name}
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

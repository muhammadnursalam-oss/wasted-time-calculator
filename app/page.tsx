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
const [result, setResult] = useState<any>(null);
const [showResult, setShowResult] = useState(false);
const router = useRouter();
function calculateTime() {
  const userAge = Number(age);
  if (userAge < 1 || userAge > 120) {
  alert("Masukkan usia antara 1 dan 120 tahun.");
  return;
}
  const activeYears = Math.max(userAge - 10, 0);
  const gamingHours =
    Number(gaming) * 365 * activeYears;

  const videoHours =
    Number(video) * 365 * activeYears;

  const socialMediaHours =
    Number(socialMedia) * 365 * activeYears;

  const browsingHours =
    Number(browsing) * 365 * activeYears;

  const daydreamingHours =
    Number(daydreaming) * 365 * activeYears;

  const totalHours =
    gamingHours +
    videoHours +
    socialMediaHours +
    browsingHours +
    daydreamingHours;

const totalDays = totalHours / 24;
const totalYears = totalDays / 365;

router.push(
  `/result?gaming=${gaming}&video=${video}&socialMedia=${socialMedia}&browsing=${browsing}&daydreaming=${daydreaming}&age=${age}`
);
} 
return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      
      <h1 className="text-5xl font-bold text-center">
        WASTED TIME CALCULATOR
      </h1>

      <p className="mt-6 max-w-2xl text-center text-xl text-gray-300">
        Berapa banyak waktu hidup Anda yang telah dihabiskan untuk aktivitas
        autopilot?
      </p>
      <p className="mt-3 max-w-2xl text-center text-sm text-gray-500">
  *Kalkulasi ini hanyalah estimasi. Kami mengasumsikan aktivitas dilakukan
  secara konsisten sejak usia 10 tahun.
      </p>
      <div className="mt-10 w-full max-w-md">
        <label className="mb-2 block text-lg">
          Nama atau Panggilan (Opsional)
        </label>
      
        <input
          type="text"
          placeholder="Masukkan nama..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white"
          
        />
        {name && (
        <p className="mt-4 text-center">
        Halo, {name}
        </p>
        )}
        <label className="mb-2 mt-6 block text-lg">
  Usia
</label>

<input
  min="1"
  max="120"
  type="number"
  placeholder="Misal: 25"
  value={age}
  onChange={(e) => setAge(e.target.value)}
  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white"
/>
<label className="mb-2 mt-6 block text-lg">
  Gaming
</label>

<input
  min="0"
  max="24"
  step="0.5"
  type="number"
  placeholder="Jam Perhari (misal: 2)"
  value={gaming}
  onChange={(e) => setGaming(e.target.value)}
  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white"
/><label className="mb-2 mt-6 block text-lg">
  Video / Film / Tiktok / YouTube / IG Reels
</label>
<input
  min="0"
  max="24"
  step="0.5"
  type="number"
  placeholder="Jam Perhari (misal: 2.5)"
  value={video}
  onChange={(e) => setVideo(e.target.value)}
  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white"
/><label className="mb-2 mt-6 block text-lg">
  Social Media
</label>

<input
  min="0"
  max="24"
  step="0.5"
  type="number"
  placeholder="Jam Perhari (misal: 1.5)"
  value={socialMedia}
  onChange={(e) => setSocialMedia(e.target.value)}
  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white"
/>

<label className="mb-2 mt-6 block text-lg">
  Browsing
</label>

<input
  min="0"
  max="24"
  step="0.5"
  type="number"
  placeholder="Jam Perhari (misal: 2.5)"
  value={browsing}
  onChange={(e) => setBrowsing(e.target.value)}
  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white"
/>

<label className="mb-2 mt-6 block text-lg">
  Ngelamun
</label>

<input
  min="0"
  max="24"
  step="0.5"
  type="number"
  placeholder="Jam Perhari (misal: 0.5)"
  value={daydreaming}
  onChange={(e) => setDaydreaming(e.target.value)}
  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white"
/>
<p className="mt-4 text-center text-gray-400">
  Usia: {age}
</p>

<p className="mt-2 text-center text-gray-400">
  Gaming: {gaming} jam/hari
</p>

<p className="text-center text-gray-400">
  Video: {video} jam/hari
</p>

<p className="text-center text-gray-400">
  Social Media: {socialMedia} jam/hari
</p>

<p className="text-center text-gray-400">
  Browsing: {browsing} jam/hari
</p>

<p className="text-center text-gray-400">
  Ngelamun: {daydreaming} jam/hari
</p>
      </div>
      <button
  onClick={calculateTime}
  className="mt-8 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-black hover:bg-gray-200">
        Hitung Waktu Saya
      </button>
      {result && (
  <div className="mt-8 text-center">

    <p>Gaming: {result.gamingHours.toLocaleString()} jam</p>

    <p>Video: {result.videoHours.toLocaleString()} jam</p>

    <p>Social Media: {result.socialMediaHours.toLocaleString()} jam</p>

    <p>Browsing: {result.browsingHours.toLocaleString()} jam</p>

    <p>Ngelamun: {result.daydreamingHours.toLocaleString()} jam</p>

    <hr className="my-4" />

    <p className="text-2xl font-bold">
      Total: {result.totalHours.toLocaleString()} jam
    </p>
    <p className="mt-2">
  ≈ {result.totalDays.toLocaleString()} hari
</p>

<p className="mt-2 text-xl">
  ≈ {result.totalYears.toFixed(2)} tahun hidup
</p>

  </div>
)}
    </main>
  );
}
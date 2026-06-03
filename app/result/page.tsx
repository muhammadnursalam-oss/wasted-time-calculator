"use client";
import { getTimeRank } from "./utils/rank";
import { useSearchParams } from "next/navigation";

export default function ResultPage() {
  const params = useSearchParams();

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

  const categoryHours = {
    gaming: gamingHours,
    video: videoHours,
    socialMedia: socialMediaHours,
    browsing: browsingHours,
    daydreaming: daydreamingHours,
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <h1 className="text-4xl font-bold">RESULT</h1>

      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">{rank?.name}</h2>
        <p className="text-gray-400 mt-2">{rank?.description}</p>
      </div>

      <div className="mt-6 text-center">
        <p>Gaming: {gamingHours.toLocaleString()} jam</p>
        <p>Video: {videoHours.toLocaleString()} jam</p>
        <p>Social Media: {socialMediaHours.toLocaleString()} jam</p>
        <p>Browsing: {browsingHours.toLocaleString()} jam</p>
        <p>Daydreaming: {daydreamingHours.toLocaleString()} jam</p>

        <hr className="my-4" />

        <p className="text-2xl font-bold">
          Total: {totalHours.toLocaleString()} jam
        </p>

        <p>≈ {totalDays.toLocaleString()} hari</p>
        <p>≈ {totalYears.toFixed(2)} tahun hidup</p>
      </div>
    </main>
  );
}
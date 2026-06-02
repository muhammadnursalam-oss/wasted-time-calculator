"use client";
import { useState } from "react";
export default function Home() {
const [name, setName] = useState("");
const [age, setAge] = useState("");
const [gaming, setGaming] = useState("");
const [result, setResult] = useState("");
function calculateTime() {
const currentAge = Number(age);
const gamingPerDay = Number(gaming);
const yearsTracked = Math.max(0, currentAge - 12);
const gamingHours = yearsTracked * 365 * gamingPerDay;
  setResult(`Kamu telah menghabiskan sekitar ${gamingHours.toLocaleString()} jam hidupmu untuk gaming.`);
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
  type="number"
  placeholder="Contoh: 30"
  value={age}
  onChange={(e) => setAge(e.target.value)}
  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white"
/><label className="mb-2 mt-6 block text-lg">
  Gaming (jam per hari)
</label>

<input
  type="number"
  placeholder="Contoh: 2"
  value={gaming}
  onChange={(e) => setGaming(e.target.value)}
  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white"
/><p className="mt-4 text-center text-gray-400">
  Usia: {age}
</p>

<p className="mt-2 text-center text-gray-400">
  Gaming: {gaming} jam/hari
</p>
      </div>
      <button
  onClick={calculateTime}
  className="mt-8 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-black hover:bg-gray-200">
        Hitung Waktu Saya
      </button>
      {result && (
  <p className="mt-6 text-center text-xl">
    {result}
  </p>
)}
    </main>
  );
}
export function getTimeRank(totalHours: number) {
  const ranks = [
    {
      id: 1,
      min: 0,
      max: 999,
      name: "🌱 Time Explorer",
      description: "Masih menjelajahi dunia. Waktu yang diinvestasikan belum terlalu besar.",
    },
    {
      id: 2,
      min: 1000,
      max: 2999,
      name: "🪨 Stone Age Citizen",
      description: "Masih cukup terhubung dengan dunia nyata. Rumput di luar rumah masih terasa familiar.",
    },
    {
      id: 3,
      min: 3000,
      max: 4999,
      name: "🚶 Casual Drifter",
      description: "Sesekali tersesat dalam scrolling, gaming, atau lamunan, tetapi belum terlalu jauh.",
    },
    {
      id: 4,
      min: 5000,
      max: 9999,
      name: "📱 Screen Apprentice",
      description: "Sudah menghabiskan ribuan jam dalam dunia digital. Mulai mengenal algoritma lebih baik daripada tetangga.",
    },
    {
      id: 5,
      min: 10000,
      max: 19999,
      name: "🎮 Time Investor",
      description: "Jumlah waktu yang cukup untuk menguasai berbagai keterampilan di dunia nyata.",
    },
    {
      id: 6,
      min: 20000,
      max: 29999,
      name: "🏆 Veteran Drifter",
      description: "Telah menempuh perjalanan panjang melalui layar, pikiran, dan berbagai distraksi kehidupan modern.",
    },
    {
      id: 7,
      min: 30000,
      max: 49999,
      name: "⚡ Digital Elder",
      description: "Waktu yang dihabiskan sudah setara dengan bertahun-tahun pengalaman hidup yang nyata.",
    },
    {
      id: 8,
      min: 50000,
      max: 74999,
      name: "👑 Time Lord",
      description: "Mengendalikan waktu? Nope. Dikuasai oleh waktu? Mungkin.",
    },
    {
      id: 9,
      min: 75000,
      max: 99999,
      name: "🌌 Master of Lost Hours",
      description: "Ribuan hari telah berlalu. Angka ini mulai sulit dibayangkan oleh manusia biasa.",
    },
    {
      id: 10,
      min: 100000,
      max: Infinity,
      name: "🕰️ Eternal Wanderer",
      description: "Legenda hidup. Telah menginvestasikan waktu dalam jumlah yang melampaui banyak pencapaian seumur hidup.",
    },
  ];

  return ranks.find(
    (rank) => totalHours >= rank.min && totalHours <= rank.max
  );
}
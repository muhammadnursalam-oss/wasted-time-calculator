import {
  getLifePathById,
  normalizeLifePath,
  type LifePathId,
} from "@/lib/life-paths";

export type AchievementPromptInput = {
  totalHours: number;
  lifePath?: LifePathId | string | null;
};

export function buildAchievementPrompt({
  totalHours,
  lifePath,
}: AchievementPromptInput) {
  const normalizedLifePath = normalizeLifePath(lifePath);
  const path = getLifePathById(normalizedLifePath);
  const hours = Math.round(totalHours).toLocaleString("en-US");

  const developer = `Given a total number of hours and a selected life path, generate ONE alternative-life achievement that someone could realistically reach with the same amount of dedicated effort.

The selected life path is a strict baseline. Treat it as the main lens for the comparison, not as a loose hint.

The achievement must stay tightly aligned with this path:

PATH: ${path.label}
MEANING: ${path.description}
FOCUS: ${path.promptFocus}
AVOID: ${path.promptAvoid}

Rules:

* If the selected path is Inspirator, the achievement must center on changing other people's lives through teaching, mentoring, speaking, community work, or volunteering.
* If the selected path is Kreator, the achievement must center on making, publishing, performing, or shipping creative work that people consume.
* If the selected path is Pembangun, the achievement must center on building products, software, systems, tools, or a startup.
* If the selected path is Juara, the achievement must center on competition, rankings, medals, records, or championship scenes.
* If the selected path is Seniman, the achievement must center on creating, exhibiting, or releasing art.
* If the selected path is Penemu, the achievement must center on research, experiments, discovery, patents, or learning breakthroughs.
* If the selected path is Pengusaha, the achievement must center on business growth, customers, revenue, launches, funding, or acquisition.

Do not drift into a different path category.
Do not explain the path choice.
Do not make the answer generic.
Do not return a skill description.

The goal is to show a vivid moment from an alternate version of the person's life.

The reader should immediately think:

"Wah, sebanyak itu ya."

and

"Gila, ternyata jam sebanyak itu bisa membawaku sampai ke sana."

---

# OUTPUT FORMAT

TITLE: [SHORT, PUNCHY, ALL CAPS]

OPENING: [One short emotional hook mentioning the supplied hours]

DESCRIPTION: [2-4 sentences telling the story behind the achievement]

---

# RULE 1: TITLE

The title is the most important part.

The title must describe a SPECIFIC, REAL-WORLD milestone, event, scene, or achievement.

The title MUST contain at least one concrete noun that exists in the real world.

Use:

* Real events
* Real competitions
* Real companies
* Real universities
* Real certifications
* Real platforms
* Real cities
* Real organizations
* Real public figures
* Real historical milestones

GOOD:

* CO-MAIN EVENT UFC FIGHT NIGHT
* VIDEO YOUTUBE KE-500
* SIDANG SKRIPSI DI UGM
* FINIS TOKYO MARATHON
* TEDX JAKARTA PERTAMA
* SERTIFIKAT AWS SOLUTIONS ARCHITECT
* PULL REQUEST DITERIMA REACT
* BUKU PERTAMA DI GRAMEDIA
* KLIEN PERTAMA DARI SINGAPURA
* JLPT N2 DI TOKYO
* SABUK HITAM BJJ
* GAME PERTAMA RILIS DI STEAM
* PITCHING DI TECH IN ASIA
* PRESENTASI PRODUK DI KANTOR GOJEK
* LOLOS CPNS KEMENKEU

BAD:

* PUNCAK DUNIA
* PANGGUNG PERTAMA
* PODIUM KEJUARAAN
* PERJALANAN BESAR
* MIMPI YANG TERWUJUD
* SUKSES BESAR

Abstract titles are forbidden.

The title should feel like a scene from a documentary, not a motivational poster.

---

# RULE 2: OPENING

The opening is a short emotional hook.

Always mention the supplied hour count.

The meaning should always be:

"Imagine if this amount of time had been invested into one meaningful goal."

Examples:

* Bayangkan jika seluruh 3.000 jam itu kamu fokuskan ke satu ambisi.
* Dengan 5.000 jam yang sama, hidupmu bisa berjalan ke arah yang sangat berbeda.
* Sebanyak itulah waktu yang dibutuhkan untuk mengubah mimpi menjadi sesuatu yang nyata.
* Dalam 1.250 jam yang sama, banyak orang membangun sesuatu yang masih mereka banggakan hari ini.
* Jika semua 9.000 jam itu dihabiskan untuk satu tujuan, hasilnya mungkin akan mengejutkanmu.
* 15.000 jam terdengar biasa. Sampai kamu melihat ke mana waktu sebanyak itu bisa membawamu.

Requirements:

* Maximum 20 words.
* Casual Indonesian.
* Emotional but not dramatic.
* Never guilt-trip the user.
* Never sound like a lecture.

---

# RULE 3: DESCRIPTION

Do not explain the skill.

Tell the story.

The description should feel like a snapshot from an alternate timeline.

Structure:

1. Starting point
2. Effort and struggle
3. Memorable moment
4. Emotional payoff

Focus on scenes.

Instead of:

"Anda dapat belajar MMA dan menjadi petarung yang lebih baik."

Write:

"Perjalananmu dimulai dari latihan di gym kecil dengan partner sparring yang berganti-ganti setiap minggu. Ribuan ronde grappling, sesi strength training, dan pertandingan regional perlahan membawamu naik ranking. Bertahun-tahun kemudian, saat namamu diumumkan untuk menghadapi Khamzat Chimaev di UFC Fight Night, semua jam latihan itu terasa memiliki tujuan."

Instead of:

"Anda dapat membuat channel YouTube."

Write:

"Video pertamamu mungkin hanya ditonton puluhan orang. Namun setelah ratusan naskah, malam-malam panjang di depan timeline editing, dan ratusan kali menekan tombol upload, kamu akhirnya merilis video ke-500. Channel yang dulu kosong kini menjadi arsip karya yang merekam bertahun-tahun hidupmu."

The reader should be able to imagine the scene.

---

# REAL-WORLD REFERENCES

Actively use references from:

### Indonesia

* Gojek
* Tokopedia
* GoTo
* Traveloka
* Bukalapak
* BCA
* Telkom Indonesia
* Universitas Indonesia
* UGM
* ITB
* CPNS
* Kemenkeu
* TEDx Jakarta
* Jakarta Marathon
* Comifuro
* Creativepreneur

### Global

* UFC
* ONE Championship
* NBA
* FIFA
* TEDx
* Steam
* GitHub
* Google Play Store
* App Store
* YouTube
* AWS
* Google Cloud
* IELTS
* TOEFL
* JLPT
* Tokyo Marathon
* Boston Marathon
* Ironman

### Public Figures

Use public figures only as reference points.

Examples:

* Khamzat Chimaev
* Jerome Polin
* Windah Basudara
* Raditya Dika
* Najwa Shihab
* Nadiem Makarim

Never imply the user would become these people.

---

# DIVERSITY RULE

Avoid repeatedly generating achievements from the same category.

Rotate across:

* Technology
* Entrepreneurship
* Academia
* Sports
* Martial Arts
* Writing
* Music
* Public Speaking
* Content Creation
* Open Source
* Gaming
* Volunteering
* Teaching
* Language Learning
* Fitness

Strongly prefer a different category than the previous example.

---

# SCALING RULES

50-200 HOURS

Small but memorable moments.

Examples:

* Upload Video YouTube ke-10
* Lari 10K Pertama
* Turnamen Catur Pertama
* Presentasi Seminar Kampus

200-1.000 HOURS

Major personal milestones.

Examples:

* Half Marathon
* Aplikasi Pertama di Play Store
* Sertifikasi AWS Cloud Practitioner
* JLPT N4

1.000-5.000 HOURS

Significant accomplishments.

Examples:

* Video YouTube ke-100
* Sidang Skripsi
* Klien Internasional Pertama
* Sabuk Biru BJJ
* Game Pertama di Steam

5.000-15.000 HOURS

Elite-level achievements.

Examples:

* TEDx Jakarta
* Buku Pertama di Gramedia
* Sabuk Hitam BJJ
* Co-Main Event UFC Fight Night
* Channel YouTube dengan Ratusan Video

15.000+ HOURS

Life-defining achievements.

Examples:

* Gelar Doktor
* Ironman Finisher
* Startup dengan Tim Sendiri
* Pembicara Konferensi Internasional
* Karya yang Menjadi Referensi Banyak Orang

---

# TONE

* Casual
* Human
* Specific
* Visual
* Emotional
* Inspirational
* Relatable

Avoid:

* Corporate language
* Generic achievements
* Abstract titles
* Motivational clichés
* Empty inspiration
* Repetitive examples

Every output should feel like a scene from an alternate version of the user's life, anchored to a real place, real event, real platform, real organization, or real historical milestone.`;

  const user = `Total available practice/work time: ${hours} hours. Generate the single most wow real-life achievement comparison for this amount of time. Make the years / hours stated in the result similar to the total hours in the input. Keep the answer aligned with the selected path: ${path.label}.`;

  return { developer, user, lifePath: normalizedLifePath, path };
}

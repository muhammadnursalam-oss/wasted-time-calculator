import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputFile = path.join(
  process.cwd(),
  "data",
  "openai-achievement-test-results.json"
);

const totalHoursCases = [50, 125, 250, 750, 1250, 3000, 5000, 9000, 15000, 24000];

async function loadDotEnv() {
  try {
    const envFile = await readFile(path.join(process.cwd(), ".env"), "utf8");

    for (const line of envFile.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);

      if (!match || process.env[match[1]]) {
        continue;
      }

      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // Allow normal environment variables to be used when .env is absent.
  }
}

function getOutputText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .find((text) => typeof text === "string") ?? ""
  );
}

function parseAchievementResult(text) {
  const parsed = JSON.parse(text);

  if (
    typeof parsed.title !== "string" ||
    typeof parsed.description !== "string" ||
    parsed.title.trim() === "" ||
    parsed.description.trim() === ""
  ) {
    throw new Error("OpenAI returned an invalid achievement result.");
  }

  return {
    title: parsed.title.trim(),
    description: parsed.description.trim(),
  };
}

function buildRequestBody(totalHours, usedTitles) {
  const avoidTitleLine =
    usedTitles.length > 0
      ? `Avoid repeating these earlier test titles: ${usedTitles.join(", ")}.`
      : "This is the first test case, so choose a strong baseline achievement.";

  return {
    model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
    input: [
      {
        role: "developer",
        content: `Given a total number of hours, generate ONE alternative-life achievement that someone could realistically reach with the same amount of dedicated effort.

The goal is not to describe a skill.

The goal is to show a vivid moment from an alternate version of the person's life.

The reader should immediately think:

"Wah, sebanyak itu ya."

and

"Gila, ternyata jam sebanyak itu bisa membawaku sampai ke sana."

---

# OUTPUT FORMAT

TITLE: [SHORT, PUNCHY, ALL CAPS]

OPENING: [One short emotional hook mentioning the supplied hours]

DESCRIPTION: [2–4 sentences telling the story behind the achievement]

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

50–200 HOURS

Small but memorable moments.

Examples:

* Upload Video YouTube ke-10
* Lari 10K Pertama
* Turnamen Catur Pertama
* Presentasi Seminar Kampus

200–1.000 HOURS

Major personal milestones.

Examples:

* Half Marathon
* Aplikasi Pertama di Play Store
* Sertifikasi AWS Cloud Practitioner
* JLPT N4

1.000–5.000 HOURS

Significant accomplishments.

Examples:

* Video YouTube ke-100
* Sidang Skripsi
* Klien Internasional Pertama
* Sabuk Biru BJJ
* Game Pertama di Steam

5.000–15.000 HOURS

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

Every output should feel like a scene from an alternate version of the user's life, anchored to a real place, real event, real platform, real organization, or real historical milestone.
`,
      },
      {
        role: "user",
        content: `Total available practice/work time: ${Math.round(
          totalHours
        ).toLocaleString("en-US")} hours. Generate the single most wow real-life achievement comparison for this amount of time. ${avoidTitleLine}`,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "achievement_result",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: {
              type: "string",
              description: "A short Indonesian title for the achievement.",
            },
            description: {
              type: "string",
              description:
                "A concise Indonesian description explaining why this achievement fits the total hours.",
            },
          },
          required: ["title", "description"],
        },
      },
    },
  };
}

async function generateAchievement(totalHours, usedTitles) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildRequestBody(totalHours, usedTitles)),
  });

  const responseText = await response.text();
  let responseBody;

  try {
    responseBody = JSON.parse(responseText);
  } catch {
    responseBody = { rawText: responseText };
  }

  if (!response.ok) {
    throw new Error(
      `OpenAI request failed with ${response.status}: ${JSON.stringify(
        responseBody
      )}`
    );
  }

  return parseAchievementResult(getOutputText(responseBody));
}

async function main() {
  await loadDotEnv();

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required in .env or the environment.");
  }

  const startedAt = new Date().toISOString();
  const results = [];
  const usedTitles = [];

  for (const totalHours of totalHoursCases) {
    const startedCaseAt = new Date().toISOString();

    try {
      const achievement = await generateAchievement(totalHours, usedTitles);
      usedTitles.push(achievement.title);
      results.push({
        totalHours,
        ok: true,
        startedAt: startedCaseAt,
        completedAt: new Date().toISOString(),
        ...achievement,
      });
      console.log(`[ok] ${totalHours} hours -> ${achievement.title}`);
    } catch (error) {
      results.push({
        totalHours,
        ok: false,
        startedAt: startedCaseAt,
        completedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`[fail] ${totalHours} hours`);
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    startedAt,
    model: process.env.OPENAI_MODEL ?? "gpt-5.5",
    outputFile,
    results,
  };

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const passed = results.filter((result) => result.ok).length;
  console.log(`Saved ${results.length} results (${passed} passed) to ${outputFile}`);

  if (passed !== results.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

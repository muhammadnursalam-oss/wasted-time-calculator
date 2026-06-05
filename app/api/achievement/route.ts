import { NextResponse } from "next/server";
import { getClosestAchievementRecord } from "@/lib/result-store";

type AchievementResult = {
  title: string;
  description: string;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};

const fallbackAchievement: AchievementResult = {
  title: "Ribuan Jam Bisa Menjadi Karya Nyata",
  description:
    "Dalam rentang waktu sebesar itu, seseorang bisa mengejar proyek besar di dunia nyata: membangun portofolio, menyelesaikan pendidikan terstruktur, melatih skill profesional, atau menciptakan karya publik yang berdampak.",
};

function parseAchievementResult(text: string): AchievementResult {
  const parsed = JSON.parse(text) as Partial<AchievementResult>;

  if (
    typeof parsed.title !== "string" ||
    typeof parsed.description !== "string" ||
    parsed.title.trim() === "" ||
    parsed.description.trim() === ""
  ) {
    throw new Error("Invalid achievement result.");
  }

  return {
    title: parsed.title.trim(),
    description: parsed.description.trim(),
  };
}

function getOutputText(data: OpenAIResponse): string {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .find((text): text is string => typeof text === "string") ?? ""
  );
}

async function getFallbackAchievement(totalHours: number) {
  const record = await getClosestAchievementRecord(totalHours);
  return record ?? fallbackAchievement;
}

export async function POST(request: Request) {
  const { totalHours } = (await request.json()) as { totalHours?: number };

  if (typeof totalHours !== "number" || !Number.isFinite(totalHours)) {
    return NextResponse.json(
      { error: "totalHours must be a finite number." },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(await getFallbackAchievement(totalHours));
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      input: [
        {
          role: "developer",
          content:
            `Given a total number of hours, generate ONE alternative-life achievement that someone could realistically reach with the same amount of dedicated effort.

The purpose is not to show a skill.

The purpose is to show a memorable moment from an alternate version of the person's life.

The result should feel emotional, visual, relatable, and inspiring.

The reader should immediately imagine themselves in that situation and think:

"Wah... sebanyak itu ya."

---

## OUTPUT FORMAT

TITLE: [SHORT, PUNCHY, ALL CAPS]

OPENING: [One short sentence.]

DESCRIPTION: [2–4 sentences telling the story behind the achievement.]

---

## TITLE RULES

The title is the most important part.

The title must describe a specific moment, milestone, event, or scene.

Do NOT describe a skill.

Bad:

* MENJADI PROGRAMMER
* BELAJAR BAHASA JEPANG
* MENJADI PETARUNG MMA
* MEMBUAT BISNIS

Good:

* CO-MAIN EVENT UFC FIGHT NIGHT
* SIDANG SKRIPSI DENGAN REVISI MINIM
* VIDEO YOUTUBE KE-500
* PULL REQUEST DITERIMA GOOGLE
* GARIS FINIS TOKYO MARATHON
* PELUNCURAN APLIKASI PERTAMA DI PLAY STORE
* PANGGUNG TEDX PERTAMA
* SABUK HITAM BJJ
* BUKU PERTAMA TERPAJANG DI GRAMEDIA
* KLIEN LUAR NEGERI PERTAMA

Use:

* Real events
* Real platforms
* Real competitions
* Real companies
* Real cities
* Real organizations
* Real certifications
* Real public figures

The title should feel like a movie scene, not a résumé bullet point.

---

## OPENING RULES

The opening is always a short hook.

The meaning should always be:

"Imagine if you invested this amount of time into one meaningful goal."

Use natural variations.

Examples:

* Bayangkan jika seluruh X jam itu kamu fokuskan ke satu ambisi.
* Dengan X jam yang sama, kamu bisa menjalani perjalanan yang sangat berbeda.
* Jika semua X jam itu dihabiskan untuk satu tujuan, hasilnya bisa mengejutkan.
* Sebanyak itulah waktu yang dibutuhkan untuk mengubah hobi menjadi pencapaian nyata.
* Bagaimana jika seluruh X jam itu kamu investasikan ke satu mimpi?
* Dalam rentang X jam yang sama, banyak orang membangun sesuatu yang mengubah hidup mereka.
* X jam mungkin terdengar biasa. Sampai kamu melihat apa yang bisa lahir darinya.

Keep it under 20 words.

---

## DESCRIPTION RULES

Do not explain the skill.

Tell the story.

The description should feel like a snapshot from an alternate life.

The reader should be able to picture the scene.

Use sensory and emotional details when appropriate.

Include:

* The starting point
* The struggle
* The progress
* The memorable moment

The description should feel personal.

Instead of:

"Anda dapat belajar MMA dan meningkatkan kemampuan bertarung."

Write:

"Ribuan ronde sparring, latihan fisik yang melelahkan, dan pertandingan kecil yang nyaris tak ada penonton perlahan membentuk reputasimu. Bertahun-tahun kemudian, saat lampu arena menyala dan namamu dipanggil menuju oktagon untuk menghadapi petarung elite seperti Khamzat Chimaev, semua jam latihan itu akhirnya terasa nyata."

Instead of:

"Anda dapat membangun channel YouTube."

Write:

"Awalnya videomu hanya ditonton belasan orang. Namun setelah ratusan jam menulis naskah, mengedit, dan mengunggah tanpa henti, kamu akhirnya menekan tombol publish untuk video ke-500. Arsip karya yang dulu hanya mimpi kini memenuhi satu channel yang benar-benar milikmu."

---

## SCALING RULES

Match the achievement to the supplied hours.

50–200 hours:
Small but memorable moments.

Examples:

* Lari 10K Pertama
* Video YouTube ke-10
* Turnamen Catur Pertama

200–1,000 hours:
Major personal milestones.

Examples:

* Half Marathon
* Aplikasi Pertama
* Percakapan Lancar dengan Turis Jepang
* Sertifikasi Profesional

1,000–5,000 hours:
Significant achievements.

Examples:

* Video YouTube ke-100
* Klien Internasional Pertama
* Sabuk Biru BJJ
* Sidang Skripsi

5,000–15,000 hours:
Elite accomplishments.

Examples:

* Sabuk Hitam BJJ
* Co-Main Event UFC Fight Night
* Buku Pertama di Gramedia
* Channel YouTube dengan Ratusan Video

15,000+ hours:
Life-defining moments.

Examples:

* Gelar Doktor
* Pembicara TEDx
* Ironman Finisher
* Startup dengan Tim Sendiri
* Karya yang Menjadi Referensi Banyak Orang

---

## TONE

* Casual
* Human
* Emotional
* Inspirational
* Cinematic
* Specific
* Visual

Avoid:

* Corporate language
* Formal language
* Generic achievements
* Empty motivation
* Guilt-tripping
* Uncertainty words (mungkin, barangkali, bisa jadi, kemungkinan)

Every output should feel like a scene from an alternate version of the user's life.`
        },
        {
          role: "user",
          content: `Total available practice/work time: ${Math.round(
            totalHours
          ).toLocaleString("en-US")} hours. Generate the single most wow real-life achievement comparison for this amount of time. Make the years / hours stated in the result similar to the total hours in the input`,
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
    }),
  });

  if (!response.ok) {
    return NextResponse.json(await getFallbackAchievement(totalHours));
  }

  try {
    const data = (await response.json()) as OpenAIResponse;
    return NextResponse.json(parseAchievementResult(getOutputText(data)));
  } catch {
    return NextResponse.json(await getFallbackAchievement(totalHours));
  }
}

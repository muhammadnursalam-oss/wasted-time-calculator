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
            `Given a total number of hours, generate ONE real-world achievement that represents what a person could realistically accomplish with the same amount of focused effort.

The achievement should feel concrete, motivating, and easy to imagine. Think of it as answering:

"If someone invested this amount of time into something productive, what meaningful result could they realistically have achieved?"

Audience

Assume the user is an Indonesian student, young professional, creator, entrepreneur, educator, or hobbyist. Prefer examples that feel relevant to modern Indonesian life and culture.

Achievement Categories

Prioritize relatable achievements from:

Education & Learning
University coursework
Professional certifications
Language learning
Bootcamps
Exam preparation (SNBT, CPNS, etc.)
Career & Business
Freelancing
Building a side business
Growing an UMKM
Launching a digital product
Startup projects
Technology
Software development
AI projects
Open-source contributions
Cloud certifications
Portfolio building
Content Creation
YouTube
TikTok
Instagram
Podcasting
Blogging
Arts & Creativity
Writing
Music production
Illustration
Photography
Sports & Martial Arts
Running
Cycling
Badminton
Pencak Silat
Brazilian Jiu-Jitsu
Community Impact
Volunteering
Teaching
Social initiatives
Mentoring
Cultural References

When relevant, connect the achievement to recognizable references such as:

Companies
GoTo
Tokopedia
Gojek
Traveloka
Bukalapak
Telkom Indonesia
BCA
Shopee
Platforms
YouTube
TikTok
Instagram
GitHub
Trends
Hackathons
AI tools
Creator economy
Startup building
CPNS preparation
Public Figures
Jerome Polin
Windah Basudara
Raditya Dika
Najwa Shihab
Nadiem Makarim
Scaling Rules

The achievement must feel proportional to the supplied hours.

50–200 hours → small but meaningful achievement
200–1,000 hours → serious skill development
1,000–5,000 hours → major project or advanced proficiency
5,000–15,000 hours → life-changing accomplishment or high-level expertise
15,000+ hours → decade-level achievement, mastery, or a body of work

Never suggest achievements that are clearly too small or too ambitious for the supplied hours.

Opening Statement

Before the title, generate ONE short opening statement that highlights what someone could have achieved with the same amount of time.

The opening statement should be conversational, impactful, and slightly playful. It should carry the meaning:

"This amount of time is enough to accomplish something significant."

Vary the wording naturally instead of repeating the same template.

Example styles:

Achievement Style
Dengan waktu sebanyak ini, kamu sudah bisa...
Jam sebanyak ini cukup untuk...
Dengan dedikasi yang sama, seseorang bisa...
Comparison Style
Waktu sebanyak ini setara dengan perjalanan untuk...
Sebanyak ini waktu yang dibutuhkan untuk...
Jumlah jam ini cukup untuk...
Imagination Style
Bayangkan jika seluruh waktu ini difokuskan ke satu tujuan...
Kalau semua jam ini dipakai untuk belajar satu hal...
Jika waktu ini diarahkan ke satu proyek...
Progress Style
Dalam waktu yang sama, seseorang bisa berkembang dari...
Banyak orang menggunakan rentang waktu seperti ini untuk...
Dengan durasi sepanjang ini, seseorang dapat bertransformasi menjadi...

Requirements:

Sound confident and direct.
Do not sound judgmental, preachy, or guilt-tripping.
Avoid phrases that imply certainty about the user's actual life choices.
Keep it under 20 words.
Use casual, natural Indonesian.
Style Rules
Be specific, not generic.
Prefer tangible outcomes over abstract milestones.
Use active language.
Make the achievement feel realistic and proportional to the supplied hours.
Use confident wording.
Avoid hedging language such as:
might
maybe
potentially
possibly
perhaps

Instead use:

build
complete
finish
publish
launch
create
train
develop
master
Match the achievement to the user's life stage when known.
Keep the tone casual, modern, and engaging.
Make the comparison surprising and memorable.
Avoid celebrity-level fame, viral success, unicorn startups, lottery-like outcomes, or guaranteed wealth.
Goal

The reader should immediately think:

"Wah, ternyata waktu sebanyak itu bisa dipakai untuk mencapai hal sebesar itu."`
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

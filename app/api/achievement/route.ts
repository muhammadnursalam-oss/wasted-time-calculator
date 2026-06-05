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
            `Given a total number of hours, identify ONE real-world achievement that a typical person could plausibly accomplish with a similar amount of focused effort. The achievement must be credible, proportional to the supplied hours, and not imply guaranteed success.

Prioritize achievements that are relatable to Indonesians, including examples from:

* Education (university coursework, certifications, language learning, bootcamps)
* Careers and entrepreneurship (freelancing, UMKM growth, digital businesses, startups)
* Technology (software development, AI projects, cloud certifications, open-source contributions)
* Content creation (YouTube, TikTok, Instagram, podcasts)
* Arts and entertainment (music, writing, illustration, photography)
* Sports and martial arts (running, cycling, badminton, pencak silat, BJJ)
* Public service and community impact (volunteering, teaching, social initiatives)

When relevant, anchor comparisons to recognizable Indonesian or global references such as:

* Companies: GoTo, Tokopedia, Gojek, Traveloka, Bukalapak, Telkom Indonesia, BCA, Shopee
* Platforms: YouTube, TikTok, Instagram, GitHub
* Events and trends: Hackathons, CPNS preparation, SBMPTN/SNBT preparation, startup building, creator economy, AI adoption
* Public figures and creators: Jerome Polin, Windah Basudara, Raditya Dika, Najwa Shihab, Nadiem Makarim, or globally recognized figures when appropriate

Rules:

* Match the achievement difficulty to the supplied hours.
* Prefer specific, concrete achievements over vague milestones.
* Use realistic outcomes ("could build", "could complete", "could learn", "could publish"), never guaranteed outcomes.
* Avoid lottery-like success stories, celebrity-level fame, or improbable business results.
* Make the comparison inspiring, concise, and easy to visualize.
* The title should be short and memorable.
* The description should be 1–2 sentences and explain why the achievement is comparable to the supplied effort.
* Prefer modern, culturally relevant examples that resonate with Indonesian students, professionals, creators, and entrepreneurs.`
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

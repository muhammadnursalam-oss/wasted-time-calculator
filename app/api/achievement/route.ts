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
            "You generate Indonesian achievement comparisons. Return only valid JSON with title and description. Pick one real-life achievement that could plausibly be accomplished in roughly the supplied total hours. Prefer the most impressive credible achievement from education, occupation, martial arts, entertainment, YouTube, politics, public service, technology, arts, business, or other relevant fields. Do not promise guaranteed outcomes. Keep it inspiring, realistic, and concise.",
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

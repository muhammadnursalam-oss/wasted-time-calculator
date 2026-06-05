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
            `Given a total number of hours, generate ONE highly visual real-world achievement that a person could realistically accomplish with the same amount of dedicated effort.

The goal is not to produce a boring milestone.

The goal is to create a comparison that makes the reader immediately think:

"Wah, sebanyak itu ya?"

Focus on achievements that are exciting, memorable, and easy to visualize.

Examples:

* Becoming a UFC contender
* Reaching black belt level in a martial art
* Publishing a novel
* Building an indie game
* Launching a YouTube channel with hundreds of videos
* Becoming conversational in Japanese
* Completing multiple marathons
* Building an AI application from scratch
* Performing live music on stage
* Contributing to major open-source projects
* Creating a profitable online business

## Core Principle

The achievement must be:

* Plausible
* Proportional to the supplied hours
* Inspiring
* Concrete
* Easy to imagine

Avoid generic outcomes such as:

* "Learn programming"
* "Improve English"
* "Get better at drawing"

Instead prefer:

* "Meluncurkan aplikasi AI milik sendiri"
* "Menerbitkan novel pertamamu"
* "Menjadi penantang UFC"
* "Menyelesaikan maraton penuh"
* "Membangun channel YouTube dengan ratusan video"

## Style

* Write in Indonesian.

* Be confident and direct.

* Sound energetic and exciting.

* Avoid uncertainty words such as:

  * mungkin
  * bisa jadi
  * berpotensi
  * kemungkinan

* Do not lecture or shame the user.

* Make the achievement sound like an epic alternative timeline.

* Prefer vivid imagery over formal explanations.

## Scaling

Match the scale of the achievement to the supplied hours.

Small hours:

* meaningful projects
* beginner accomplishments

Medium hours:

* advanced skills
* major personal projects

Large hours:

* elite performance
* mastery
* remarkable bodies of work

## Output Format

TITLE: [SHORT, ALL CAPS TITLE]

OPENING: [A short impactful sentence]

DESCRIPTION: [2-3 sentences explaining what someone could accomplish with that amount of effort.]

## Example Tone

TITLE:
PENANTANG UFC MELAWAN KHAMZAT CHIMAEV

OPENING:
Bayangkan semua waktu itu kamu gunakan untuk mengejar satu ambisi.

DESCRIPTION:
Dengan jumlah waktu sebesar ini, kamu bisa menghabiskan ribuan sesi latihan di gym, mengasah striking dan grappling, lalu merangkak naik di ranking profesional. Pada titik ini, kamu bukan lagi petarung amatir—kamu sedang berjalan menuju pertarungan melawan monster kelas dunia seperti Khamzat Chimaev.
`
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

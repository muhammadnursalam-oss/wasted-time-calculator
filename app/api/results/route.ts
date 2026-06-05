import { NextResponse } from "next/server";
import {
  getResultRecordById,
  getResultRecordByFingerprint,
  saveResultRecord,
  type ResultRecord,
} from "@/lib/result-store";

type ResultInput = Omit<ResultRecord, "id" | "createdAt">;

function toNumber(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

function parseInput(body: unknown): ResultInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const fingerprint =
    typeof data.fingerprint === "string" ? data.fingerprint.trim() : "";

  if (!name || !fingerprint) {
    return null;
  }

  const age = toNumber(data.age);
  const gaming = toNumber(data.gaming);
  const video = toNumber(data.video);
  const socialMedia = toNumber(data.socialMedia);
  const browsing = toNumber(data.browsing);
  const daydreaming = toNumber(data.daydreaming);
  const totalHours = toNumber(data.totalHours);
  const totalDays = toNumber(data.totalDays);
  const totalYears = toNumber(data.totalYears);

  if (
    age === null ||
    gaming === null ||
    video === null ||
    socialMedia === null ||
    browsing === null ||
    daydreaming === null ||
    totalHours === null ||
    totalDays === null ||
    totalYears === null ||
    typeof data.rankName !== "string" ||
    typeof data.rankDescription !== "string" ||
    typeof data.achievementTitle !== "string" ||
    typeof data.achievementDescription !== "string"
  ) {
    return null;
  }

  return {
    name,
    age,
    gaming,
    video,
    socialMedia,
    browsing,
    daydreaming,
    totalHours,
    totalDays,
    totalYears,
    rankName: data.rankName.trim(),
    rankDescription: data.rankDescription.trim(),
    achievementTitle: data.achievementTitle.trim(),
    achievementDescription: data.achievementDescription.trim(),
    fingerprint,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const record = await getResultRecordById(id);

  if (!record) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(record);
}

export async function POST(request: Request) {
  const input = parseInput(await request.json());

  if (!input) {
    return NextResponse.json({ error: "Invalid result payload." }, { status: 400 });
  }

  const existingRecord = await getResultRecordByFingerprint(input.fingerprint);

  if (existingRecord) {
    return NextResponse.json(
      {
        message: "Kamu sudah pernah mencoba tes ini sebelumnya.",
        record: existingRecord,
      },
      { status: 409 }
    );
  }

  const record: ResultRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  const savedRecord = await saveResultRecord(record);

  return NextResponse.json(savedRecord);
}

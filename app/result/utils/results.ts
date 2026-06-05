export type ResultRecord = {
  id: string;
  fingerprint: string;
  name: string;
  age: number;
  gaming: number;
  video: number;
  socialMedia: number;
  browsing: number;
  daydreaming: number;
  totalHours: number;
  totalDays: number;
  totalYears: number;
  rankName: string;
  rankDescription: string;
  achievementTitle: string;
  achievementDescription: string;
  createdAt: string;
};

export type ResultInput = Omit<ResultRecord, "id" | "createdAt">;

export class ResultAttemptLimitError extends Error {
  record: ResultRecord | null;

  constructor(message: string, record: ResultRecord | null) {
    super(message);
    this.name = "ResultAttemptLimitError";
    this.record = record;
  }
}

export async function createResultRecord(
  input: ResultInput
): Promise<ResultRecord> {
  const response = await fetch("/api/results", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (response.status === 409) {
    const payload = (await response.json()) as {
      message?: string;
      record?: ResultRecord;
    };

    throw new ResultAttemptLimitError(
      payload.message || "Kamu sudah pernah mencoba tes ini sebelumnya.",
      payload.record ?? null
    );
  }

  if (!response.ok) {
    throw new Error("Failed to save result record.");
  }

  return response.json();
}

export async function getResultRecordById(
  id: string
): Promise<ResultRecord | null> {
  const response = await fetch(`/api/results?id=${encodeURIComponent(id)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load result record.");
  }

  return response.json();
}

import type { LifePathId } from "@/lib/life-paths";

export type AchievementResult = {
  title: string;
  description: string;
};

export async function getAchievementResult(
  totalHours: number,
  lifePath: LifePathId
): Promise<AchievementResult> {
  const response = await fetch("/api/achievement", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ totalHours, lifePath }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate achievement result.");
  }

  return response.json();
}

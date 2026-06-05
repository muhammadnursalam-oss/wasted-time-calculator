export type AchievementResult = {
  title: string;
  description: string;
};

export async function getAchievementResult(
  totalHours: number
): Promise<AchievementResult> {
  const response = await fetch("/api/achievement", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ totalHours }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate achievement result.");
  }

  return response.json();
}

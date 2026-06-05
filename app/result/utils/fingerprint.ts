async function hashString(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateBrowserFingerprint() {
  const details = [
    navigator.userAgent,
    navigator.language,
    navigator.languages.join(","),
    navigator.platform,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    String(new Date().getTimezoneOffset()),
    String(navigator.hardwareConcurrency || ""),
    String((navigator as Navigator & { deviceMemory?: number }).deviceMemory || ""),
    String(navigator.maxTouchPoints || ""),
    navigator.vendor,
  ].join("|");

  return hashString(details);
}

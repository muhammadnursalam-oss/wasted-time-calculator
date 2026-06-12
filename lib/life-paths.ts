export type LifePathId =
  | "inspirator"
  | "kreator"
  | "pembangun"
  | "juara"
  | "seniman"
  | "penemu"
  | "pengusaha";

export type LifePath = {
  id: LifePathId;
  emoji: string;
  label: string;
  description: string;
  promptFocus: string;
  promptAvoid: string;
};

export const DEFAULT_LIFE_PATH_ID: LifePathId = "pembangun";

export const LIFE_PATHS: LifePath[] = [
  {
    id: "inspirator",
    emoji: "🌟",
    label: "Inspirator",
    description: "jalan buat kamu yang mau aktif mengubah hidup orang lain",
    promptFocus:
      "teaching, mentoring, volunteering, public speaking, community work, or social impact",
    promptAvoid: "business bragging, sports medals, or pure entertainment",
  },
  {
    id: "kreator",
    emoji: "🎭",
    label: "Kreator",
    description: "jalan buat kamu yang senang menghibur dan mengekspresikan dirimu",
    promptFocus:
      "content creation, writing, video, performance, streaming, publishing, or creative projects",
    promptAvoid: "corporate careers, academic degrees, or generic skill talk",
  },
  {
    id: "pembangun",
    emoji: "⚡",
    label: "Pembangun",
    description: "jalan buat kamu yang siap membuat apapun",
    promptFocus:
      "building products, software, systems, startups, tools, or infrastructure",
    promptAvoid: "art-only, competition-only, or vague motivational scenes",
  },
  {
    id: "juara",
    emoji: "🏆",
    label: "Juara",
    description: "jalan buat kamu yang gak bisa berhenti buat kompetitif",
    promptFocus:
      "competition, rankings, trophies, records, medals, brackets, or championship scenes",
    promptAvoid: "business exits, art shows, or teaching-focused milestones",
  },
  {
    id: "seniman",
    emoji: "🎨",
    label: "Seniman",
    description: "jalan buat kamu yang seneng banget menghasilkan karya seni",
    promptFocus:
      "artmaking, exhibitions, albums, stage work, galleries, design, illustration, or craft",
    promptAvoid: "startup language, trophies, or academic validation",
  },
  {
    id: "penemu",
    emoji: "🔬",
    label: "Penemu",
    description: "jalan buat kamu yang seneng banget belajar nemuin hal-hal baru",
    promptFocus:
      "research, experiments, labs, scientific discovery, patents, certifications, or language mastery",
    promptAvoid: "pure entertainment, sports podiums, or business hype",
  },
  {
    id: "pengusaha",
    emoji: "💼",
    label: "Pengusaha",
    description: "jalan buat kamu yang gila bisnis, semua dijadiin cuan",
    promptFocus:
      "business growth, customers, revenue, deals, funding, launches, acquisitions, or expansion",
    promptAvoid: "personal fame, art-only arcs, or competition trophies",
  },
];

export function getLifePathById(id: string | null | undefined): LifePath {
  const normalizedId = id?.trim().toLowerCase();

  return (
    LIFE_PATHS.find((path) => path.id === normalizedId) ??
    LIFE_PATHS.find((path) => path.id === DEFAULT_LIFE_PATH_ID) ??
    LIFE_PATHS[0]
  );
}

export function normalizeLifePath(id: string | null | undefined): LifePathId {
  return getLifePathById(id).id;
}

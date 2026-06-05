import { neon } from "@neondatabase/serverless";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

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

const RESULTS_FILE = path.join(process.cwd(), "data", "result-records.json");

const sql =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
    ? neon(process.env.DATABASE_URL)
    : null;

const createTableSql = `
  CREATE TABLE IF NOT EXISTS result_records (
    id TEXT PRIMARY KEY,
    fingerprint TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gaming DOUBLE PRECISION NOT NULL,
    video DOUBLE PRECISION NOT NULL,
    social_media DOUBLE PRECISION NOT NULL,
    browsing DOUBLE PRECISION NOT NULL,
    daydreaming DOUBLE PRECISION NOT NULL,
    total_hours DOUBLE PRECISION NOT NULL,
    total_days DOUBLE PRECISION NOT NULL,
    total_years DOUBLE PRECISION NOT NULL,
    rank_name TEXT NOT NULL,
    rank_description TEXT NOT NULL,
    achievement_title TEXT NOT NULL,
    achievement_description TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`;

async function ensureDatabase() {
  if (!sql) {
    return;
  }

  await sql.query(createTableSql, []);
  await sql.query(
    `ALTER TABLE result_records ADD COLUMN IF NOT EXISTS fingerprint TEXT`,
    []
  );
  await sql.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS result_records_fingerprint_idx ON result_records (fingerprint)`,
    []
  );
}

function rowToRecord(row: Record<string, unknown>): ResultRecord {
  return {
    id: String(row.id),
    fingerprint: String(row.fingerprint),
    name: String(row.name),
    age: Number(row.age),
    gaming: Number(row.gaming),
    video: Number(row.video),
    socialMedia: Number(row.social_media),
    browsing: Number(row.browsing),
    daydreaming: Number(row.daydreaming),
    totalHours: Number(row.total_hours),
    totalDays: Number(row.total_days),
    totalYears: Number(row.total_years),
    rankName: String(row.rank_name),
    rankDescription: String(row.rank_description),
    achievementTitle: String(row.achievement_title),
    achievementDescription: String(row.achievement_description),
    createdAt: String(row.created_at),
  };
}

async function readLocalResults(): Promise<ResultRecord[]> {
  try {
    const rawFile = await readFile(RESULTS_FILE, "utf8");
    const parsed = JSON.parse(rawFile) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is ResultRecord => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as ResultRecord).id === "string" &&
        typeof (item as ResultRecord).fingerprint === "string" &&
        typeof (item as ResultRecord).name === "string"
      );
    });
  } catch {
    return [];
  }
}

async function writeLocalResults(results: ResultRecord[]) {
  await mkdir(path.dirname(RESULTS_FILE), { recursive: true });
  await writeFile(RESULTS_FILE, JSON.stringify(results, null, 2), "utf8");
}

export async function saveResultRecord(
  record: ResultRecord
): Promise<ResultRecord> {
  if (sql) {
    await ensureDatabase();
    await sql`
      INSERT INTO result_records (
        id,
        fingerprint,
        name,
        age,
        gaming,
        video,
        social_media,
        browsing,
        daydreaming,
        total_hours,
        total_days,
        total_years,
        rank_name,
        rank_description,
        achievement_title,
        achievement_description,
        created_at
      ) VALUES (
        ${record.id},
        ${record.fingerprint},
        ${record.name},
        ${record.age},
        ${record.gaming},
        ${record.video},
        ${record.socialMedia},
        ${record.browsing},
        ${record.daydreaming},
        ${record.totalHours},
        ${record.totalDays},
        ${record.totalYears},
        ${record.rankName},
        ${record.rankDescription},
        ${record.achievementTitle},
        ${record.achievementDescription},
        ${record.createdAt}
      )
    `;

    return record;
  }

  const results = await readLocalResults();
  results.push(record);
  await writeLocalResults(results);

  return record;
}

export async function getResultRecordById(
  id: string
): Promise<ResultRecord | null> {
  if (sql) {
    await ensureDatabase();
    const rows = await sql`
      SELECT
        id,
        fingerprint,
        name,
        age,
        gaming,
        video,
        social_media,
        browsing,
        daydreaming,
        total_hours,
        total_days,
        total_years,
        rank_name,
        rank_description,
        achievement_title,
        achievement_description,
        created_at
      FROM result_records
      WHERE id = ${id}
      LIMIT 1
    `;

    const row = rows[0] as Record<string, unknown> | undefined;
    return row ? rowToRecord(row) : null;
  }

  const results = await readLocalResults();
  return results.find((record) => record.id === id) ?? null;
}

export async function getResultRecordByFingerprint(
  fingerprint: string
): Promise<ResultRecord | null> {
  if (sql) {
    await ensureDatabase();
    const rows = await sql`
      SELECT
        id,
        fingerprint,
        name,
        age,
        gaming,
        video,
        social_media,
        browsing,
        daydreaming,
        total_hours,
        total_days,
        total_years,
        rank_name,
        rank_description,
        achievement_title,
        achievement_description,
        created_at
      FROM result_records
      WHERE fingerprint = ${fingerprint}
      LIMIT 1
    `;

    const row = rows[0] as Record<string, unknown> | undefined;
    return row ? rowToRecord(row) : null;
  }

  const results = await readLocalResults();
  return results.find((record) => record.fingerprint === fingerprint) ?? null;
}

export async function getClosestAchievementRecord(
  totalHours: number
): Promise<{ title: string; description: string } | null> {
  if (sql) {
    await ensureDatabase();
    const rows = await sql`
      SELECT
        achievement_title,
        achievement_description
      FROM result_records
      WHERE achievement_title IS NOT NULL
        AND achievement_title <> ''
        AND achievement_description IS NOT NULL
        AND achievement_description <> ''
      ORDER BY ABS(total_hours - ${totalHours}), RANDOM()
      LIMIT 1
    `;

    const row = rows[0] as Record<string, unknown> | undefined;

    if (!row) {
      return null;
    }

    return {
      title: String(row.achievement_title),
      description: String(row.achievement_description),
    };
  }

  return null;
}

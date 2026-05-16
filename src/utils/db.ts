import postgres from "postgres";

// During `next build`, Next.js sets NEXT_PHASE to this value.
// The internal Railway Postgres URL is not reachable at build time,
// so we skip creating the connection entirely.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

const sql =
  !isBuildPhase && process.env.DATABASE_URL
    ? postgres(process.env.DATABASE_URL, {
        ssl: process.env.DATABASE_URL.includes("railway.internal")
          ? false
          : { rejectUnauthorized: false },
      })
    : (null as unknown as ReturnType<typeof postgres>);

export default sql;

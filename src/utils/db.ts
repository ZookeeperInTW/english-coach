import postgres from "postgres";

const isInternal = process.env.DATABASE_URL?.includes("railway.internal");

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: isInternal ? false : { rejectUnauthorized: false },
});

export default sql;

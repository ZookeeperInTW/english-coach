import postgres from "postgres";

const sql = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, {
      ssl: process.env.DATABASE_URL.includes("railway.internal")
        ? false
        : { rejectUnauthorized: false },
    })
  : (null as unknown as ReturnType<typeof postgres>);

export default sql;

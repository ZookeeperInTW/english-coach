import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearNews() {
  console.log("Clearing all news...");
  const { error } = await supabase
    .from("news")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) console.error(error);
  else console.log("News cleared.");
}

clearNews();

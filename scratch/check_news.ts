import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkNews() {
  const { data, error } = await supabase.from("news").select("count");
  if (error) {
    console.error("Error fetching news count:", error);
  } else {
    console.log("News count:", data);
  }
}

checkNews();

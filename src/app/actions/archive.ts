"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function archiveNews(newsId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "User not authenticated" };
  }

  const { error } = await supabase
    .from("user_archived_news")
    .insert([{ user_id: user.id, news_id: newsId }]);

  if (error) {
    if (error.code === "23505") {
      // Unique violation, already archived
      return { success: true, message: "Already archived" };
    }
    console.error("Failed to archive news:", error);
    return { error: "Failed to archive news" };
  }

  // Revalidate the home page to remove the archived news
  revalidatePath("/");

  return { success: true };
}

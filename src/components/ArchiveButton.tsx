"use client";

import { useState } from "react";
import { archiveNews } from "@/app/actions/archive";
import { useRouter } from "next/navigation";

interface ArchiveButtonProps {
  newsId: string;
  variant?: "icon" | "button";
}

export default function ArchiveButton({
  newsId,
  variant = "icon",
}: ArchiveButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleArchive = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isPending) return;
    setIsPending(true);

    try {
      const result = await archiveNews(newsId);
      if (result.error) {
        alert("封存失敗: " + result.error);
      } else {
        // Refresh current page to apply revalidation immediately
        router.refresh();

        // Show success and maybe redirect if variant is button (meaning we're on detail page)
        if (variant === "button") {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Failed to archive:", error);
      alert("發生錯誤，請稍後再試。");
    } finally {
      setIsPending(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleArchive}
        disabled={isPending}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        {isPending ? "封存中..." : "封存 (Archive)"}
      </button>
    );
  }

  // Icon variant (for homepage)
  return (
    <button
      onClick={handleArchive}
      disabled={isPending}
      className={`text-gray-400 hover:text-secondary transition-colors ${
        isPending ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title="封存此新聞"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 ${isPending ? "animate-pulse" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    </button>
  );
}

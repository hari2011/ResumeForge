"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ImproveResumePage() {
  const router = useRouter();
  useEffect(() => { router.replace("/new-resume"); }, [router]);
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[var(--accent)] border-t-transparent mb-3" />
        <p className="text-sm text-[var(--ink-soft)]">Redirecting to Resume Builder…</p>
      </div>
    </div>
  );
}

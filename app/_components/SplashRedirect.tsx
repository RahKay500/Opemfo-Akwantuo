"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon } from "@/components/ui/icons";

export default function SplashRedirect({ target }: { target: string }) {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace(target), 700);
    return () => clearTimeout(t);
  }, [router, target]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex size-[120px] items-center justify-center rounded-[60px] bg-lilac-light">
        <HeartIcon className="size-[52px] text-lilac-deeper" />
      </div>
      <p className="mt-6 font-heading text-[26px] font-bold text-text-primary">Ɔpemfoɔ Akwantuo</p>
      <p className="mt-1 font-body text-[15px] text-text-secondary">Caring for every mother</p>
      <div className="mt-16 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-pulse rounded-badge bg-primary"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </main>
  );
}
